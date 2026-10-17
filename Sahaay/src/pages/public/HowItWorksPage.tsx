import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';
import { 
  Camera, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  IndianRupee, 
  PhoneCall, 
  Award, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Building2,
  Users
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Accountable Operations
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1">
          How Sahaay Works
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          Sahaay bridges the gap between community need reporting and field resolution. By pairing verified micro-tasks with accountable oversight, we coordinate local welfare tasks safely and ensure medical cases receive professional care.
        </p>
      </div>

      <SafetyNoticeBanner type="critical" />

      {/* 6-Stage Process Flow Cards */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          The 6-Stage Service Lifecycle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 relative border-t-4 border-t-forest-600">
            <span className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">Stage 1</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Citizen Report Submission</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A citizen identifies a community need or street animal in distress. They capture a photo, describe the situation, and specify the landmark location (in Pune, Nagpur, or surrounding wards). A tracking ID is generated.
            </p>
          </Card>

          <Card className="p-6 space-y-3 relative border-t-4 border-t-forest-700">
            <span className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">Stage 2</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organisation Triage</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A registered local organisation or coordinating team evaluates the report, assesses urgency, validates the location, and categorizes the required response.
            </p>
          </Card>

          <Card className="p-6 space-y-3 relative border-t-4 border-t-amber-500">
            <span className="text-2xl font-black text-amber-600 font-mono">Stage 3</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Classification & Routing</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The case is categorized by safety clearance: safe routine tasks (feeding, water refill) can be broadcast to workers. Medical emergencies and aggressive or rabid animals are routed strictly to licensed veterinarians or animal ambulances.
            </p>
          </Card>

          <Card className="p-6 space-y-3 relative border-t-4 border-t-gold-500">
            <span className="text-2xl font-black text-gold-600 font-mono">Stage 4</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Task Assignment</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Eligible tasks become visible to verified workers who hold the required safety tier. Workers can accept the task based on their availability and schedule.
            </p>
          </Card>

          <Card className="p-6 space-y-3 relative border-t-4 border-t-emerald-600">
            <span className="text-2xl font-black text-emerald-600 font-mono">Stage 5</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Field Service & Proof</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The worker attends on-site with required safety gear, performs the agreed service, and uploads clear photographic verification and field notes.
            </p>
          </Card>

          <Card className="p-6 space-y-3 relative border-t-4 border-t-sky-600">
            <span className="text-2xl font-black text-sky-600 font-mono">Stage 6</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification & Resolution</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The organisation audits the photo evidence. Upon approval, the ticket timeline is updated to resolved, notifying the citizen, and the worker's compensation is released.
            </p>
          </Card>
        </div>
      </div>

      {/* Safety Level Matrix Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-sage-100 dark:border-night-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Incident Classification & Safety Authorization Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rules governing who is eligible to accept or handle each incident category.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Incident Category</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Authorized Personnel</th>
                <th className="p-4">Permitted Worker Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">
                  Kitten/Puppy Feeding, Routine Census
                </td>
                <td className="p-4 text-emerald-600 font-medium">Low</td>
                <td className="p-4">Any Verified Citizen / Community Responder</td>
                <td className="p-4">Food supply, water refill, photo verification</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">
                  Minor Limping, Entangled Kite Thread, Dehydration
                </td>
                <td className="p-4 text-amber-600 font-medium">Medium / High</td>
                <td className="p-4">Certified Animal Handler (Tier 2 Verified)</td>
                <td className="p-4">Calm hydration, blanket wrap, transfer to vet van</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">
                  Major Trauma, Fracture, Cattle Deep Injury
                </td>
                <td className="p-4 text-amber-600 font-medium">High</td>
                <td className="p-4">Veterinary Escort & Mobile Shelter Van</td>
                <td className="p-4">Assisted stretcher loading ONLY under vet supervision</td>
              </tr>
              <tr className="bg-rose-50/50 dark:bg-rose-950/20 font-medium text-rose-950 dark:text-rose-200">
                <td className="p-4 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Rabies Suspicion, Severe Aggression, Dog Bite Risk</span>
                </td>
                <td className="p-4 text-rose-600 font-bold">Critical</td>
                <td className="p-4">Municipal Rapid Animal Control Unit ONLY</td>
                <td className="p-4 text-rose-700 dark:text-rose-300">
                  STRICT ZERO TOUCH. Area cordoned off; workers barred from approaching.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-forest-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">Ready to participate in Sahaay?</h3>
          <p className="text-xs sm:text-sm text-forest-200 mt-1">
            Submit a community report or register for flexible service work.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/citizen/report">
            <Button variant="gold" size="md">
              <span>Report an Issue</span>
            </Button>
          </Link>
          <Link to="/worker/tasks">
            <Button variant="secondary" size="md">
              <span>Browse Tasks</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
