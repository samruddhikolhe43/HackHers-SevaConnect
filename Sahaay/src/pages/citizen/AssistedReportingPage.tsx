import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';
import { 
  PhoneCall, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Heart,
  Headphones,
  UserCheck
} from 'lucide-react';

export const AssistedReportingPage: React.FC = () => {
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [area, setArea] = useState('Kothrud');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRequestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerPhone.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Helpline & Offline Intake
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          Assisted Reporting & Emergency Hotlines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Unable to submit online or assisting an elderly neighbour? Call directly or request a quick intake callback.
        </p>
      </div>

      <SafetyNoticeBanner type="critical" />

      {/* Emergency Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-l-4 border-l-rose-600 space-y-3 bg-white dark:bg-night-800">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase">
            <PhoneCall className="w-4 h-4" />
            <span>National Emergency</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">1962</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            24/7 Government Toll-Free Animal Ambulance & Veterinary Casualty dispatch.
          </p>
          <a
            href="tel:1962"
            className="block text-center py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
          >
            Dial 1962 Toll-Free
          </a>
        </Card>

        <Card className="p-5 border-l-4 border-l-forest-600 space-y-3 bg-white dark:bg-night-800">
          <div className="flex items-center gap-2 text-forest-700 dark:text-forest-400 font-bold text-xs uppercase">
            <Headphones className="w-4 h-4" />
            <span>Sahaay Dispatch Desk</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">+91 20 2567 8900</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Nagpur & Pune Regional Community Worker & Volunteer Dispatch Desk (8 AM - 10 PM).
          </p>
          <a
            href="tel:+912025678900"
            className="block text-center py-2 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs transition-colors"
          >
            Call Volunteer Desk
          </a>
        </Card>

        <Card className="p-5 border-l-4 border-l-gold-500 space-y-3 bg-white dark:bg-night-800">
          <div className="flex items-center gap-2 text-gold-600 font-bold text-xs uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Municipal Control</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">020-25501000</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pune Municipal Corporation (PMC) Veterinary Health Department.
          </p>
          <a
            href="tel:02025501000"
            className="block text-center py-2 px-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Call PMC Control
          </a>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Assisted Callback Form */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="w-5 h-5 text-forest-600" />
              <span>Request Dispatcher Callback</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Leave your contact number. An on-duty operator will call you in under 5 minutes to record the incident details on your behalf.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                Callback Requested!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Operator will call <strong>{callerPhone}</strong> momentarily. Keep your phone line free.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestCallback} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Joshi"
                  value={callerName}
                  onChange={e => setCallerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={callerPhone}
                  onChange={e => setCallerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Locality / Ward in Pune
                </label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                >
                  <option value="Baner">Baner / Balewadi</option>
                  <option value="Kothrud">Kothrud / Karvenagar</option>
                  <option value="Shivajinagar">Shivajinagar / FC Road</option>
                  <option value="Hinjawadi">Hinjawadi IT Park</option>
                  <option value="Hadapsar">Hadapsar / Magarpatta</option>
                  <option value="Viman Nagar">Viman Nagar / Kalyani Nagar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Voice Notes / Landmark (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly state animal type and landmark..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                />
              </div>

              <Button type="submit" variant="primary" size="md" fullWidth>
                <span>Request Immediate Voice Intake Call</span>
              </Button>
            </form>
          )}
        </Card>

        {/* Immediate Citizen First Aid Best Practices */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-current" />
            <span>While Waiting for Responders</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700">
              <p className="font-bold text-slate-900 dark:text-white">1. Keep a Safe Calm Distance</p>
              <p className="mt-0.5 leading-relaxed">
                Injured animals can bite out of intense pain or terror. Do not crowd, shout, or make sudden movements.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700">
              <p className="font-bold text-slate-900 dark:text-white">2. Offer Fresh Water Gently</p>
              <p className="mt-0.5 leading-relaxed">
                Place a shallow bowl of clean drinking water 4 feet away. Do NOT force-feed or pour water down an animal's throat.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700">
              <p className="font-bold text-slate-900 dark:text-white">3. Provide Shade or Rain Cover</p>
              <p className="mt-0.5 leading-relaxed">
                Use an umbrella or cardboard box to shield animal from direct scorching sunlight or rain until handler arrives.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-medium">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Never Administer Human Medicine</span>
              </p>
              <p className="mt-0.5 leading-relaxed text-[11px]">
                Paracetamol, ibuprofen, and human analgesics are lethal and toxic to dogs and cats. Wait for veterinary professionals.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
