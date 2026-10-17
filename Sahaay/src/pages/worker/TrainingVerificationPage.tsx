import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  GraduationCap, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert,
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';
import { useAuth } from '../../context/AuthContext';

export const TrainingVerificationPage: React.FC = () => {
  const { user, token, isDemo, updateUser } = useAuth();
  const [completedModules, setCompletedModules] = useState<string[]>(['m1', 'm2']);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/workers/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.completedModules) {
          setCompletedModules(data.completedModules);
        }
      })
      .catch(() => {});
  }, [token]);

  const quizQuestion = {
    question: 'What is the mandatory protocol when encountering a street dog exhibiting hypersalivation, disorientation, and unprovoked aggression?',
    options: [
      'Approach gently with a leash and offer treats to calm the dog.',
      'Attempt to trap the dog using a blanket and transport in your two-wheeler crate.',
      'STRICT ZERO TOUCH: Maintain at least 30 feet distance, cordon off the area with shopkeepers, and call the Municipal Emergency Animal Ambulance (1962).',
      'Administer oral hydration using a plastic water bottle.'
    ],
    correctIndex: 2,
    explanation: 'Correct! This clinical profile is an immediate rabies/neurological red-line. Untrained workers must never approach or touch suspected rabid animals. Only the municipal catch-pole vehicle is equipped for this containment.'
  };

  const handleSelectQuiz = async (index: number) => {
    setSelectedQuizAnswer(index);
    setShowExplanation(true);

    if (index === quizQuestion.correctIndex && token) {
      setIsSaving(true);
      try {
        const res = await fetch('/api/workers/training', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: 'quiz_rabies_redline',
            quizScore: 100,
            completedAll: true,
          }),
        });

        const data = await res.json();
        setIsSaving(false);
        if (res.ok) {
          setSavedSuccessMessage('Quiz Passed & Persisted to SQLite! Your safety clearance is upgraded to Certified Community Handler (Tier 2).');
          updateUser({
            safetyTier: 'Certified Community Handler (Tier 2)',
            trainingCompleted: true,
            trainingQuizScore: 100,
          });
        }
      } catch {
        setIsSaving(false);
      }
    }
  };

  const markModuleComplete = async (modId: string) => {
    if (completedModules.includes(modId)) return;
    const next = [...completedModules, modId];
    setCompletedModules(next);

    if (token) {
      try {
        await fetch('/api/workers/training', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: modId,
            completedAll: next.length >= 3,
          }),
        });
      } catch {}
    }
  };

  const isTier2 = user.safetyTier?.includes('Tier 2') || user.safetyTier?.includes('Certified') || isDemo;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Professional Accreditation
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          Training & Safety Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete mandatory safety modules to qualify for Tier 2 handling tasks. Verification status is audited separately.
        </p>
      </div>

      <SafetyNoticeBanner type="critical" />

      {savedSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{savedSuccessMessage}</span>
        </div>
      )}

      {/* Tier Status Card */}
      <Card className="p-6 sm:p-8 bg-forest-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-gold-300 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Active Tier: {user.safetyTier || (isTier2 ? 'Certified Community Handler (Tier 2)' : 'Basic Community Responder (Tier 1)')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Accreditation by Sahaay Welfare Coordination
          </h2>
          <p className="text-xs sm:text-sm text-forest-200 max-w-xl">
            {isTier2
              ? 'You are qualified to accept injured animal welfare checks, hydration assistance, and safe transport tasks.'
              : 'Complete the safety protocol test below to upgrade from Tier 1 to Tier 2 Community Handler.'}
          </p>
          <div className="pt-1 text-[11px] text-forest-300 flex items-center gap-2">
            <span>Account Verification:</span>
            <strong className="text-white capitalize">{user.verificationStatus || 'Pending Review'}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-forest-950/70 border border-forest-800 text-center shrink-0">
          <span className="text-2xl font-black text-gold-400">
            {isTier2 ? '4 / 5' : `${completedModules.length} / 5`}
          </span>
          <span className="text-xs text-forest-300 block">Modules Cleared</span>
        </div>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Accreditation Curriculum
        </h3>

        <div className="space-y-3">
          {/* Module 1 */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    1. Basic Community Animal Safety & First Contact
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                    Passed
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Safe approaching, hydration bowls, reading fear vs stress signals, hygiene protocol.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <span>Review Notes</span>
            </Button>
          </Card>

          {/* Module 2 */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    2. Canine Body Language & De-escalation Protocol
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                    Passed
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ear postures, tail carriage, avoiding direct eye contact, non-threatening posture techniques.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <span>Review Notes</span>
            </Button>
          </Card>

          {/* Module 3 */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                completedModules.includes('m3') || isTier2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    3. Safe Transport & Stretcher Handling
                  </h4>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    completedModules.includes('m3') || isTier2 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {completedModules.includes('m3') || isTier2 ? 'Passed' : 'In Progress'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Blanket cradling, securing crate carriers on two-wheelers, assisting ambulance ramps.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => markModuleComplete('m3')}
            >
              <span>{completedModules.includes('m3') || isTier2 ? 'Review Notes' : 'Complete Module'}</span>
            </Button>
          </Card>

          {/* Module 4 */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                completedModules.includes('m4') || isTier2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    4. Zoonotic Diseases & Rabies Red-Line Awareness
                  </h4>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    completedModules.includes('m4') || isTier2 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {completedModules.includes('m4') || isTier2 ? 'Passed' : 'Complete Quiz Below'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Identifying clinical rabies indicators, immediate evacuation, post-exposure prophylaxis guidelines.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => markModuleComplete('m4')}
            >
              <span>{completedModules.includes('m4') || isTier2 ? 'Review Notes' : 'Mark Cleared'}</span>
            </Button>
          </Card>

          {/* Module 5 (Locked - Strict Vet Boundary) */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75 bg-sage-50/50 dark:bg-night-850 border-dashed">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-night-700 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    5. Clinical Veterinary Surgery & Injections (Tier 3)
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-night-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    Professional Vet Degree Required
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Passing community training does not qualify workers as veterinarians. Clinical procedures are legally restricted to licensed practitioners.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled className="shrink-0 text-slate-400">
              <span>Licensed Only</span>
            </Button>
          </Card>
        </div>
      </div>

      {/* Interactive Safety Knowledge Check */}
      <Card className="p-6 sm:p-8 space-y-5 border-forest-200 dark:border-forest-900">
        <div>
          <div className="flex items-center gap-2 text-forest-700 dark:text-forest-400 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Safety Knowledge Check (Persistent in SQLite)</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            Safety Case Simulation: Rabies Red-Line Test
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Passing this check persists your score and upgrades your worker tier in the database.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-sage-50/80 dark:bg-night-850 border border-sage-200 dark:border-night-700">
          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
            {quizQuestion.question}
          </p>

          <div className="space-y-2 mt-4">
            {quizQuestion.options.map((opt, i) => {
              const isSelected = selectedQuizAnswer === i;
              const isCorrect = i === quizQuestion.correctIndex;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuiz(i)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold ring-2 ring-emerald-500/20'
                        : 'bg-rose-50 border-rose-400 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 font-semibold'
                      : 'bg-white dark:bg-night-800 border-sage-200 dark:border-night-700 text-slate-700 dark:text-slate-300 hover:bg-sage-100/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-4 p-3.5 rounded-xl text-xs leading-relaxed ${
              selectedQuizAnswer === quizQuestion.correctIndex
                ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                : 'bg-rose-100/70 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200'
            }`}>
              <p className="font-bold">
                {selectedQuizAnswer === quizQuestion.correctIndex ? '✓ Correct Protocol Answer' : '✗ Incorrect Action'}
              </p>
              <p className="mt-1">{quizQuestion.explanation}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
