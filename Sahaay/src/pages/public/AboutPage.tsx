import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  Building2, 
  Stethoscope, 
  Award, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Our Mission & Purpose
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          About Sahaay
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          A community-service coordination platform that creates paid local work opportunities while helping citizens and organisations coordinate community welfare and animal-rescue needs.
        </p>
      </div>

      <SafetyNoticeBanner type="critical" />

      {/* Purpose Statement */}
      <div className="p-6 sm:p-8 rounded-3xl bg-forest-900 text-white space-y-4 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold">
          Why Sahaay Exists
        </h2>
        <p className="text-xs sm:text-sm text-forest-200 leading-relaxed">
          In urban and peri-urban communities across India, countless needs arise daily—from injured community animals and orphaned litters to routine feeding, census, and public-space safety. At the same time, willing local citizens, students, and workers seek flexible, dignified, and verified earning opportunities.
        </p>
        <p className="text-xs sm:text-sm text-forest-200 leading-relaxed">
          Sahaay connects these stakeholders into an accountable, transparent ecosystem: citizens report needs with photos and locations; accredited organisations review and classify cases; verified community workers handle safe routine tasks; and medical or high-risk cases are immediately escalated to qualified veterinarians and authorised emergency responders.
        </p>
      </div>

      {/* 5 Connected Stakeholders */}
      <div className="space-y-4">
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Who Sahaay Connects
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Five vital groups collaborating for community impact and reliable local livelihoods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Citizens</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Everyday residents who observe and report community issues, injured animals, or local hazards with photos and accurate landmark locations.
            </p>
          </Card>

          <Card className="p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold-100 dark:bg-gold-900/60 text-gold-700 dark:text-gold-300 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Community Workers</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Local workers and students who undergo safety verification to accept safe, approved micro-tasks on flexible schedules for fair compensation.
            </p>
          </Card>

          <Card className="p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">NGOs & Organisations</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Registered welfare groups and municipal liaisons who triage reports, coordinate task assignments, audit proof photos, and maintain accountability.
            </p>
          </Card>

          <Card className="p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Veterinarians & Responders</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Licensed veterinarians and authorised emergency response teams who handle medical triage, clinical surgeries, and high-risk animal rescues.
            </p>
          </Card>

          <Card className="p-6 space-y-2.5 md:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Sponsors & Civic Partners</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Philanthropic partners and CSR sponsors who support verified community tasks and review immutable impact records and photographic proof.
            </p>
          </Card>
        </div>
      </div>

      {/* 6-Step Workflow Summary */}
      <Card className="p-6 sm:p-8 space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          The 6-Step Sahaay Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">01</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Citizen Reports Issue</strong>
              Details, photos where possible, and selected location/landmark are submitted.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">02</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Organisation Reviews</strong>
              Coordinating NGO or authorised team reviews urgency and feasibility.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">03</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Classification & Routing</strong>
              Safe tasks are routed to workers. Medical and high-risk cases go to qualified veterinarians.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">04</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Safe Task Assignment</strong>
              Eligible tasks matching safety tiers are claimed by trained, verified workers.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">05</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Execution & Proof</strong>
              Worker completes service, photographs the resolution, and submits field notes.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 flex items-start gap-3">
            <span className="font-mono font-bold text-forest-700 dark:text-forest-400 text-sm">06</span>
            <div>
              <strong className="block text-slate-900 dark:text-white">Audit & Outcome Recorded</strong>
              Authorised organisation verifies proof, records ticket completion, and triggers stipend.
            </div>
          </div>
        </div>
      </Card>

      {/* Trust & Medical Safety Clause */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Strict Safety & Accountability Principle</span>
        </div>
        <p className="leading-relaxed">
          Untrained workers are never permitted to handle medical emergencies, rabies suspicions, or dangerous aggressive animals. High-risk situations require authorized responders and licensed veterinarians with appropriate containment equipment.
        </p>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-forest-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold">Get Involved in Community Care</h3>
          <p className="text-xs text-forest-200 mt-1">
            Join as an active citizen reporter, verified worker, or partner organisation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/register">
            <Button variant="gold" size="md">
              <span>Register on Sahaay</span>
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="secondary" size="md">
              <span>View How It Works</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
