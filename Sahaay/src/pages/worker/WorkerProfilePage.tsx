import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Save,
  Star,
  Truck
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('+91 98220 12345');
  const [cityZones, setCityZones] = useState('Pune (Baner, Kothrud, Balewadi)');
  const [vehicle, setVehicle] = useState('Honda Activa 6G with rear carrier crate');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Field Responder Identity
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Worker Profile & Verification Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your availability regions, vehicle equipment, and safety tier accreditation
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile configuration updated successfully.</span>
        </div>
      )}

      {/* Hero Profile Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-sage-100 dark:border-night-700">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-forest-500/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tier 2 Certified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Certified Animal Handler • Pune Animal Welfare Alliance Partner
              </p>
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  4.92 / 5.0
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">38 Rescues Verified</span>
              </div>
            </div>
          </div>

          <Button
            variant={isEditing ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </Button>
        </div>

        {/* Profile Attributes */}
        <form onSubmit={handleSave} className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Registered Email</label>
              <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-200">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Contact Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-200">
                  {phone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Assigned Service Wards</label>
              {isEditing ? (
                <input
                  type="text"
                  value={cityZones}
                  onChange={e => setCityZones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-600" />
                  <span>{cityZones}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Field Transport Vehicle</label>
              {isEditing ? (
                <input
                  type="text"
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-forest-600" />
                  <span>{vehicle}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Completed Certifications & Modules */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-forest-600" />
            <span>Completed Training Accreditations</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified by Dr. Sunita Kulkarni (Pune Animal Welfare Alliance)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-night-850 border border-forest-200 dark:border-forest-900 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Basic Community Animal Safety & First Contact</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Completed Aug 2026</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-night-850 border border-forest-200 dark:border-forest-900 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Canine Body Language & De-escalation Protocol</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Completed Aug 2026</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-night-850 border border-forest-200 dark:border-forest-900 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Safe Transport & Stretcher Handling</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Completed Sep 2026</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-night-850 border border-forest-200 dark:border-forest-900 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Zoonotic Diseases & Rabies Red-Line Awareness</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Completed Sep 2026</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
