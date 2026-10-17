import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  ShieldAlert, 
  MapPin, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Briefcase, 
  Building2, 
  PhoneCall, 
  Activity,
  AlertTriangle,
  Award,
  ShieldCheck,
  FileText,
  Camera,
  Coins,
  UserPlus
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';
import { useTranslation } from '../../i18n/LanguageContext';

export const HomePage: React.FC = () => {
  const { switchRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRoleJump = (role: 'citizen' | 'worker' | 'organisation', path: string) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-24 border-b border-sage-200/80 dark:border-night-700 bg-gradient-to-b from-white via-ivory-50 to-sage-50/30 dark:from-night-900 dark:via-night-850 dark:to-night-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 dark:bg-forest-950/70 border border-forest-200 dark:border-forest-800 text-forest-800 dark:text-forest-200 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-forest-600 dark:bg-forest-400" />
            <span>{t.home.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {t.home.titleLead} <br />
            <span className="text-forest-700 dark:text-forest-400">{t.home.titleHighlight}</span> <br />
            {t.home.titleTrail}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.home.description}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/citizen/report">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-sm">
                <Heart className="w-5 h-5 mr-2 text-gold-300 fill-current" />
                <span>{t.home.reportBtn}</span>
              </Button>
            </Link>

            <button onClick={() => handleRoleJump('worker', '/worker/tasks')}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Briefcase className="w-5 h-5 mr-2 text-forest-700 dark:text-forest-300" />
                <span>{t.home.earnBtn}</span>
              </Button>
            </button>

            <button onClick={() => handleRoleJump('organisation', '/org')}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Building2 className="w-5 h-5 mr-2 text-forest-700 dark:text-forest-300" />
                <span>{t.home.orgBtn}</span>
              </Button>
            </button>
          </div>

          {/* Safety guarantee */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t.home.safetyGuarantee}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Critical Safety Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SafetyNoticeBanner type="critical" />
      </section>

      {/* 3. Who Uses Sahaay: 3 Clear Entry Points */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Participant Roles
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Built for Everyone in the Community
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Clear pathways for reporting citizens, verified service helpers, and coordinating welfare organisations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Citizen */}
          <Card hover className="p-6 sm:p-7 flex flex-col justify-between border-t-4 border-t-forest-600">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Citizens
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Spot a street animal in distress or a community issue? Submit details, a photo, and a landmark location in seconds. Monitor progress transparently on a live ticket timeline.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast photo & landmark reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time resolution timeline tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assisted phone intake option</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleRoleJump('citizen', '/citizen')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <span>Open Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Card 2: Community Service Worker */}
          <Card hover className="p-6 sm:p-7 flex flex-col justify-between border-t-4 border-t-gold-500">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-gold-900/60 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Community Workers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn available hours into dignified local income. Complete basic safety verification, toggle availability whenever free, accept safe tasks, and upload completion proof for verified stipends.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Availability toggle: work on your schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Clear safety tiers & task compensation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified safety training modules</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleRoleJump('worker', '/worker')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <span>Open Worker Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Card 3: Organisation / NGO */}
          <Card hover className="p-6 sm:p-7 flex flex-col justify-between border-t-4 border-t-forest-800">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-200 dark:bg-night-700 text-forest-900 dark:text-forest-200 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Organisations & NGOs
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralise community intake, triage cases by urgency, assign accredited field helpers, audit photo completion proof, and route high-risk veterinary cases to authorised ambulances.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive OpenStreetMap dispatch view</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Photo proof review & sign-off workflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Emergency red-line veterinary routing</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleRoleJump('organisation', '/org')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <span>Open Organisation Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Operational Workflow (6 Simple Accountable Steps) */}
      <section className="bg-sage-100/50 dark:bg-night-850/50 py-16 border-y border-sage-200 dark:border-night-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
              Clear & Accountable
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              How the Sahaay Workflow Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every community request follows a structured 6-stage lifecycle ensuring quality, accountability, and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">01</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                1. Citizen Reports Need
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A citizen uploads details, a clear photo if available, and selects the location and landmark. A unique tracking reference is generated.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">02</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                2. Organisation Reviews
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The coordinating NGO or agency reviews the incoming report, verifies location validity, and evaluates safety parameters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">03</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                3. Safety Triage & Routing
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Safe routine tasks (feeding, welfare check) are approved for community workers. Critical trauma or rabies alerts are routed to veterinarians and ambulances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">04</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                4. Worker Claims Task
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A verified worker matching the safety tier accepts the task on their schedule, reviews equipment requirements, and attends on-site.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">05</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                5. Proof Submission
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Worker completes the service, photographs the outcome, records field notes, and submits completion proof for review.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-2">
              <div className="text-2xl font-black text-forest-700 dark:text-forest-400 font-mono">06</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                6. Verification & Resolution
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The organisation audits the proof, updates the citizen's ticket as resolved, and releases the worker's compensation.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-forest-800 dark:text-forest-300 hover:underline"
            >
              <span>Explore Safety Authorization Matrix & Protocols</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Demo / Pilot Metrics (Clearly Labeled) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-forest-900 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-gold-400 block">
                Demonstration & Pilot Data
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Community Coordination in Action
              </h3>
              <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-xl">
                Sample pilot figures representing simulated cluster operations in Nagpur & Pune wards.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-forest-950 border border-forest-800 text-[11px] text-forest-300 font-medium">
              Demo Test Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-forest-800">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gold-400">120+</div>
              <div className="text-xs text-forest-300 mt-1">Community Reports Triaged</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gold-400">100%</div>
              <div className="text-xs text-forest-300 mt-1">Photo Proof Verification</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gold-400">35 min</div>
              <div className="text-xs text-forest-300 mt-1">Average Review Response</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gold-400">Zero-Touch</div>
              <div className="text-xs text-forest-300 mt-1">Rabies Red-Line Enforcement</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Ready to Get Started Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 shadow-soft text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Ready to Connect with Sahaay?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Whether you want to report an animal in need, offer your time for flexible community work, or coordinate local rescue efforts, Sahaay provides the trusted tools you need.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="md">
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Create an Account</span>
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="md">
                <span>Learn How It Works</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
