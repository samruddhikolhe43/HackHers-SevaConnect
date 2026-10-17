import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AnimalCategory, UrgencyLevel, ReportType } from '../../types';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Upload, 
  X, 
  CheckCircle2, 
  PhoneCall, 
  ShieldAlert,
  ArrowRight,
  Navigation,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  Compass,
  FileQuestion,
  HelpCircle
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { VoiceInput } from '../../components/common/VoiceInput';
import { 
  extractExifGps, 
  evaluateLocationEvidence, 
  LocationEvidenceResult, 
  GpsCoordinates 
} from '../../utils/exifParser';

interface AiPreviewState {
  aiCategory: string;
  aiUrgency: string;
  aiConfidence: number;
  aiExplanation: string;
  aiMissingInfo: string;
  aiAmbiguityFlag: boolean;
  isLoading: boolean;
}

export const ReportAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [reportType, setReportType] = useState<ReportType>('injured_animal');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState(user.city || 'Pune');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(user.name || '');
  const [reporterPhone, setReporterPhone] = useState(user.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
  );
  const [photoFileName, setPhotoFileName] = useState<string>('sample-injury-photo.jpg');
  const [photoGps, setPhotoGps] = useState<GpsCoordinates | null>(null);

  // Location & Geolocation state
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>({ lat: 18.5204, lng: 73.8567 });
  const [deviceGps, setDeviceGps] = useState<GpsCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationEvidence, setLocationEvidence] = useState<LocationEvidenceResult>({
    status: 'Location Evidence Incomplete',
    notes: 'Default city reference selected. Use "Use My Current Location" or attach a photo for geotag verification.',
    deviceDistanceKm: null,
    photoDistanceKm: null,
    consistent: true
  });

  // AI Assessment Live Preview state
  const [aiPreview, setAiPreview] = useState<AiPreviewState>({
    aiCategory: 'dog',
    aiUrgency: 'medium',
    aiConfidence: 0.85,
    aiExplanation: 'Preliminary canine welfare triage. Describe specific symptoms to refine assessment.',
    aiMissingInfo: 'Provide mobility state (standing or lying down) and visible injuries.',
    aiAmbiguityFlag: false,
    isLoading: false
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdTrackingNumber, setCreatedTrackingNumber] = useState('');

  // Hidden camera & file input refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Parse URL search parameters if arriving from the interactive map pin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramCity = params.get('city');
    const paramAddress = params.get('address');
    const paramLat = params.get('lat');
    const paramLng = params.get('lng');

    if (paramCity) setCity(decodeURIComponent(paramCity));
    if (paramAddress) setAddress(decodeURIComponent(paramAddress));
    if (paramLat && paramLng) {
      const parsedLat = parseFloat(paramLat);
      const parsedLng = parseFloat(paramLng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setCoordinates({ lat: parsedLat, lng: parsedLng });
        setLocationStatus(`Targeted from Map: ${parsedLat.toFixed(4)}°N, ${parsedLng.toFixed(4)}°E`);
      }
    }
  }, [location.search]);

  // Re-evaluate location consistency whenever coordinates, deviceGps, or photoGps change
  useEffect(() => {
    const result = evaluateLocationEvidence(
      coordinates?.lat || null,
      coordinates?.lng || null,
      deviceGps?.lat || null,
      deviceGps?.lng || null,
      photoGps?.lat || null,
      photoGps?.lng || null
    );
    setLocationEvidence(result);
  }, [coordinates, deviceGps, photoGps]);

  // Live AI assessment preview (debounced when description changes)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!description.trim() || description.trim().length < 5) {
      return;
    }

    setAiPreview(prev => ({ ...prev, isLoading: true }));

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/reports/assess-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
            deviceLat: deviceGps?.lat,
            deviceLng: deviceGps?.lng,
            photoLat: photoGps?.lat,
            photoLng: photoGps?.lng
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAiPreview({
            aiCategory: data.aiCategory || 'other',
            aiUrgency: data.aiUrgency || 'medium',
            aiConfidence: data.aiConfidence || 0.7,
            aiExplanation: data.aiExplanation || '',
            aiMissingInfo: data.aiMissingInfo || '',
            aiAmbiguityFlag: Boolean(data.aiAmbiguityFlag),
            isLoading: false
          });
        } else {
          setAiPreview(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.debug('AI preview request error:', err);
        setAiPreview(prev => ({ ...prev, isLoading: false }));
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [description, coordinates, deviceGps, photoGps]);

  // Request browser geolocation with user consent
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t.report.gpsUnavailable);
      return;
    }

    setIsLocating(true);
    setLocationStatus(t.report.detectingGps);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setDeviceGps({ lat: latitude, lng: longitude });

        // Reverse geocode to resolve city & street name
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData && revData.address) {
              const detectedCity =
                revData.address.city ||
                revData.address.town ||
                revData.address.village ||
                revData.address.state_district ||
                'Pune';
              setCity(detectedCity);
              if (!address && revData.display_name) {
                setAddress(revData.display_name.split(',').slice(0, 3).join(','));
              }
              setLocationStatus(`GPS Confirmed: ${detectedCity} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`);
              return;
            }
          }
        } catch {
          // Fall back gracefully
        }

        setLocationStatus(`Captured Live Device GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus(t.report.gpsDenied);
        } else if (err.code === err.TIMEOUT) {
          setLocationStatus(t.report.gpsTimeout);
        } else {
          setLocationStatus(t.report.gpsUnavailable);
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Handle photo file selection (both from Camera and File Upload)
  const handlePhotoSelected = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Photo size exceeds 10MB limit.');
      return;
    }

    setPhotoFile(file);
    setPhotoFileName(file.name);
    setFormError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Safely extract EXIF GPS metadata without blocking UI
    try {
      const gps = await extractExifGps(file);
      if (gps) {
        setPhotoGps(gps);
        console.info('Extracted photo GPS coordinates:', gps);
      } else {
        setPhotoGps(null);
      }
    } catch (err) {
      setPhotoGps(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoSelected(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoFileName('');
    setPhotoGps(null);
  };

  const isRabiesRisk = 
    reportType === 'rabies_suspicion' || 
    aiPreview.aiUrgency === 'critical' ||
    description.toLowerCase().includes('rabies') || 
    description.toLowerCase().includes('froth') || 
    description.toLowerCase().includes('रेबीज') ||
    description.toLowerCase().includes('पिसाळलेला');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      setFormError('Please provide a specific street address or area.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe the incident in detail.');
      return;
    }
    if (!photoPreview && !photoFile) {
      setFormError('Please upload or capture a photo of the incident to assist field responders.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', `${reportType.replace(/_/g, ' ')} at ${address.split(',')[0]}`);
      formData.append('type', reportType);
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('landmark', landmark.trim());
      formData.append('lat', String(coordinates?.lat || 18.5204));
      formData.append('lng', String(coordinates?.lng || 73.8567));

      if (deviceGps) {
        formData.append('deviceLat', String(deviceGps.lat));
        formData.append('deviceLng', String(deviceGps.lng));
      }
      if (photoGps) {
        formData.append('photoLat', String(photoGps.lat));
        formData.append('photoLng', String(photoGps.lng));
      }

      formData.append('description', description.trim());
      formData.append('isAnonymous', String(isAnonymous));
      formData.append('reporterName', isAnonymous ? 'Anonymous Citizen' : (reporterName.trim() || user.name));
      formData.append('reporterPhone', isAnonymous ? '' : reporterPhone.trim());
      formData.append('reporterEmail', isAnonymous ? '' : user.email);
      formData.append('safetyClearance', isRabiesRisk ? 'emergency_escalation' : aiPreview.aiUrgency === 'high' ? 'trained_only' : 'community_safe');
      formData.append('isEmergencyEscalation', String(isRabiesRisk));
      if (isRabiesRisk) {
        formData.append('emergencyContactNote', 'CRITICAL ESCALATION: Extreme trauma or rabies suspicion flagged. Fast-tracked to specialised response unit.');
      }

      if (photoFile) {
        formData.append('photos', photoFile);
      } else if (photoPreview) {
        formData.append('photoUrls', JSON.stringify([photoPreview]));
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.report) {
        setCreatedTrackingNumber(data.report.trackingNumber || data.trackingNumber);
        setSuccessModalOpen(true);
      } else {
        setFormError(data.error || 'Failed to submit incident report. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Could not reach report server. Please ensure the backend is running.');
    }
  };

  // Helper for location consistency badge styling
  const getLocationBadge = () => {
    switch (locationEvidence.status) {
      case 'Location Evidence Consistent':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        };
      case 'Location Mismatch — Review Required':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        };
      case 'Location Evidence Incomplete':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
          icon: <Compass className="w-4 h-4 text-blue-600 shrink-0" />
        };
      case 'Location Not Available':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-night-800 border-slate-200 dark:border-night-700 text-slate-700 dark:text-slate-300',
          icon: <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
        };
    }
  };

  const badgeStyle = getLocationBadge();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Citizen Reporting Portal
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t.report.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.report.pageSubtitle}
        </p>
      </div>

      {/* Emergency Alert if Rabies / Severe Trauma */}
      {isRabiesRisk && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-800 rounded-2xl p-4 sm:p-5 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-rose-950 dark:text-rose-100">
                CRITICAL SAFETY WARNING: High Urgency / Suspected Hazard Detected
              </h4>
              <p className="text-rose-800 dark:text-rose-300 leading-relaxed">
                DO NOT approach, touch, feed, or corner this animal. Maintain a safe distance. 
                This report is escalated for authorized veterinary/rescue dispatch.
              </p>
              <div className="pt-2">
                <a
                  href="tel:1962"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Emergency Ambulance 1962 Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Incident Description WITH Microphone Button INSIDE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.report.step1Title}: {t.report.descriptionLabel} *
              </label>
              <span className="text-[11px] text-forest-600 dark:text-forest-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Categorized</span>
              </span>
            </div>

            {/* Description box container with microphone INSIDE */}
            <div className="rounded-2xl border border-sage-300 dark:border-night-700 bg-white dark:bg-night-850 p-2.5 focus-within:ring-2 focus-within:ring-forest-500 focus-within:border-forest-500 shadow-sm transition-all">
              <textarea
                rows={4}
                placeholder={t.report.descriptionPlaceholder}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y"
              />
              
              {/* VOICE INPUT INSIDE THE CITIZEN DESCRIPTION BOX ONLY */}
              <VoiceInput
                currentValue={description}
                onTranscript={(transcribedText) => setDescription(transcribedText)}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Speak in English, Hindi, or Marathi using the microphone above, or type directly. You can edit the text at any time.
            </p>
          </div>

          {/* Section 2: Real-time AI Triage Preview */}
          <div className="rounded-2xl border border-forest-200 dark:border-forest-800/60 bg-gradient-to-br from-forest-50/60 to-sage-50/30 dark:from-forest-950/40 dark:to-night-850 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-600 dark:text-forest-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-forest-200">
                  Real-time AI Assessment (Server Validated)
                </span>
              </div>
              {aiPreview.isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-forest-600 dark:text-forest-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Evaluating...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-night-800 p-3 rounded-xl border border-forest-100 dark:border-night-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  {t.report.aiCategoryLabel}
                </span>
                <span className="text-sm font-extrabold capitalize text-forest-900 dark:text-forest-200">
                  {aiPreview.aiCategory === 'other' ? 'Other / Needs Specific Review' : aiPreview.aiCategory}
                </span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  Confidence: {Math.round(aiPreview.aiConfidence * 100)}%
                </span>
              </div>

              <div className="bg-white/80 dark:bg-night-800 p-3 rounded-xl border border-forest-100 dark:border-night-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  {t.report.aiUrgencyLabel}
                </span>
                <span className={`text-sm font-extrabold capitalize ${
                  aiPreview.aiUrgency === 'critical' ? 'text-rose-600' :
                  aiPreview.aiUrgency === 'high' ? 'text-amber-600' :
                  aiPreview.aiUrgency === 'needs_review' ? 'text-purple-600' :
                  'text-forest-700 dark:text-forest-300'
                }`}>
                  {aiPreview.aiUrgency === 'needs_review' ? 'Needs Review' : aiPreview.aiUrgency}
                </span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  {aiPreview.aiUrgency === 'critical' ? 'Immediate danger flagged' : 'Determined from symptom severity'}
                </span>
              </div>
            </div>

            {/* Explanation & Missing info suggestion */}
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-white/60 dark:bg-night-800/60 p-2.5 rounded-xl border border-forest-100/60 dark:border-night-700/60">
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Rationale: </strong>
                <span>{aiPreview.aiExplanation}</span>
              </div>
              {aiPreview.aiMissingInfo && (
                <div className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                  <span><strong>Suggestion: </strong>{aiPreview.aiMissingInfo}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Note: Citizens cannot manipulate or overwrite the final AI category or urgency directly. Re-assessments occur automatically as you type or speak.
            </div>
          </div>

          {/* Section 3: Incident Photo Upload & Device Camera Capture */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.report.step3Title} *
              </label>
              {photoGps && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Photo Geotag Detected ({photoGps.lat.toFixed(3)}°N, {photoGps.lng.toFixed(3)}°E)</span>
                </span>
              )}
            </div>

            {/* Hidden native inputs for Camera vs File */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 p-2">
                <img
                  src={photoPreview}
                  alt="Incident evidence preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="p-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span className="truncate">{photoFileName}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-forest-700 dark:text-forest-300 font-semibold underline text-xs"
                    >
                      {t.report.replacePhoto}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Take Photo with Camera */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-forest-300 dark:border-forest-700 rounded-2xl p-6 bg-forest-50/40 dark:bg-forest-950/20 hover:bg-forest-50 dark:hover:bg-forest-950/40 transition-colors text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300 flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-forest-900 dark:text-forest-200">
                    {t.report.takePhotoCamera}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Use device camera directly</span>
                </button>

                {/* Upload Existing File */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-sage-300 dark:border-night-600 rounded-2xl p-6 hover:bg-sage-50/50 dark:hover:bg-night-800 transition-colors text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.report.uploadPhotoFile}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">From gallery or files (JPG, PNG)</span>
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.report.photoExifNotice}
            </p>
          </div>

          {/* Section 4: Live Location & Geotag Verification */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.report.step2Title} *
              </label>
              <Link to="/org/map" className="text-xs text-forest-700 dark:text-forest-400 hover:underline">
                View On Civic Map
              </Link>
            </div>

            {/* Use My Current Location Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-forest-600 dark:text-forest-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {locationStatus || 'GPS coordinates assist verified responders in finding the exact incident spot.'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Browser location permission requested only with your explicit click.
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="shrink-0 text-xs shadow-sm"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 mr-1.5 text-forest-600" />
                    <span>{deviceGps ? 'Re-detect GPS' : t.report.useCurrentLocation}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Address & City inputs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.report.addressLabel} *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.report.addressPlaceholder}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.report.landmarkLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.report.landmarkPlaceholder}
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.report.cityLabel} *
                </label>
                <input
                  type="text"
                  list="indian-cities-datalist"
                  placeholder="e.g. Pune, Nagpur, Mumbai..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm font-medium"
                />
                <datalist id="indian-cities-datalist">
                  <option value="Pune" />
                  <option value="Nagpur" />
                  <option value="Mumbai" />
                  <option value="Thane" />
                  <option value="Nashik" />
                  <option value="Bengaluru" />
                  <option value="Delhi NCR" />
                  <option value="Hyderabad" />
                </datalist>
              </div>
            </div>

            {/* Location Evidence Status Card */}
            <div className={`p-3.5 rounded-2xl border ${badgeStyle.bg} flex items-start gap-2.5 text-xs transition-all`}>
              {badgeStyle.icon}
              <div className="space-y-0.5">
                <span className="font-extrabold block">{locationEvidence.status}</span>
                <p className="leading-relaxed opacity-90">{locationEvidence.notes}</p>
                <p className="text-[10px] opacity-75 pt-1">
                  {t.report.locationPrivacyNotice}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Reporter Contact Details */}
          <div className="pt-2 border-t border-sage-100 dark:border-night-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.report.reporterNameLabel}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded text-forest-600 focus:ring-forest-500"
                />
                <span>{t.report.anonymousCheckbox}</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder={t.report.reporterNameLabel}
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                />
                <input
                  type="tel"
                  placeholder={t.report.reporterPhoneLabel}
                  value={reporterPhone}
                  onChange={e => setReporterPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                />
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
            <span>{t.report.submitBtn}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={t.report.submitSuccessTitle}
        subtitle={t.report.submitSuccessMessage}
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-slate-400">{t.report.trackingNumberLabel}</span>
            <p className="text-2xl font-mono font-black text-forest-700 dark:text-forest-400 mt-1">
              {createdTrackingNumber}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            Your incident has been triaged by Sahaay AI and entered into the civic ledger. Responders will review the location evidence and coordinates.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/citizen/reports">
              <Button variant="primary" size="md">
                <span>{t.citizen.myReportsTitle}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSuccessModalOpen(false);
                setAddress('');
                setDescription('');
              }}
            >
              <span>{t.report.reportAnotherBtn}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
