import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SahaayLogo } from '../../components/common/SahaayLogo';
import { 
  UserPlus, 
  User, 
  Wrench, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileCheck
} from 'lucide-react';

const WORKER_SKILL_OPTIONS = [
  'Basic Animal Care & Feeding',
  'First Aid & Bandaging',
  'Safe Leashing & Restraint',
  'Stray Cat & Kitten Care',
  'Two-Wheeler Transport',
  'Crowd & Traffic Management',
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Pune');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Worker-specific state
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Basic Animal Care & Feeding']);
  const [experience, setExperience] = useState('');

  // Org-specific state
  const [orgRegNumber, setOrgRegNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the Community Safety & Welfare Terms.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      phone: phone.trim(),
      city: city.trim(),
      skills: role === 'worker' ? selectedSkills : undefined,
      experience: role === 'worker' ? experience.trim() : undefined,
      orgRegNumber: role === 'organisation' ? orgRegNumber.trim() : undefined,
      serviceArea: role === 'organisation' ? serviceArea.trim() : undefined,
    };

    const res = await register(payload);
    setIsSubmitting(false);

    if (res.success && res.role) {
      setSuccess(true);
      setTimeout(() => {
        if (res.role === 'citizen') navigate('/citizen');
        else if (res.role === 'worker') navigate('/worker');
        else if (res.role === 'organisation') navigate('/org');
        else navigate('/');
      }, 800);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <SahaayLogo size="lg" showText={false} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Create Your Sahaay Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Independent account registration with persistent SQLite database storage
        </p>
      </div>

      <Card className="p-6 sm:p-8 shadow-soft border-sage-200 dark:border-night-700">
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Created Successfully!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Welcome, <strong>{name}</strong>. Loading your private {role.toUpperCase()} portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Select Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    role === 'citizen'
                      ? 'border-forest-600 bg-forest-50 dark:bg-forest-950/60 ring-2 ring-forest-500/20 shadow-sm'
                      : 'border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 hover:border-sage-300'
                  }`}
                >
                  <User className="w-4 h-4 text-forest-700 mb-1" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Citizen</p>
                  <p className="text-[10px] text-slate-500">Report & track</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    role === 'worker'
                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-950/60 ring-2 ring-gold-500/20 shadow-sm'
                      : 'border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 hover:border-sage-300'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-gold-600 mb-1" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Worker</p>
                  <p className="text-[10px] text-slate-500">Earn flexibly</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organisation')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    role === 'organisation'
                      ? 'border-forest-700 bg-forest-100 dark:bg-forest-900/60 ring-2 ring-forest-700/20 shadow-sm'
                      : 'border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 hover:border-sage-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-forest-800 mb-1" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">NGO / Org</p>
                  <p className="text-[10px] text-slate-500">Triage & dispatch</p>
                </button>
              </div>
            </div>

            {/* Step 2: Account Details */}
            <div className="space-y-3.5 pt-2 border-t border-sage-100 dark:border-night-700">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Contact & Authentication
              </span>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'organisation' ? 'Organisation / NGO Name *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'organisation' ? 'e.g. Pune Animal Relief Society' : 'e.g. Ramesh Kadam'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary City / District *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      list="reg-cities-list"
                      placeholder="Pune, Nagpur, etc."
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                    <datalist id="reg-cities-list">
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
              </div>

              {/* ROLE-SPECIFIC ONBOARDING DETAILS */}

              {/* Worker Onboarding Fields */}
              {role === 'worker' && (
                <div className="space-y-3 p-4 rounded-2xl bg-gold-50/60 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-800 text-xs text-gold-950 dark:text-gold-200">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gold-600" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">Worker Onboarding & Skills</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                      Community Skills (Select relevant)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKER_SKILL_OPTIONS.map(skill => {
                        const isChecked = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`p-2 rounded-xl text-[11px] text-left border transition-all ${
                              isChecked
                                ? 'bg-gold-500 text-slate-950 font-bold border-gold-600'
                                : 'bg-white dark:bg-night-800 text-slate-700 dark:text-slate-300 border-sage-200 dark:border-night-700'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '} {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Relevant Animal Handling or Volunteer Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 year volunteer at local shelter, pet owner"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <p className="text-[11px] text-gold-800 dark:text-gold-300 leading-relaxed">
                    Note: Registered workers start as <strong>Basic Community Responder (Tier 1)</strong>. Completing the mandatory safety training unlocks Tier 2 task claiming. Passing the quiz certifies community handling, but does not claim professional veterinary status.
                  </p>
                </div>
              )}

              {/* Organisation Onboarding Fields */}
              {role === 'organisation' && (
                <div className="space-y-3 p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/20 border border-forest-200 dark:border-forest-800 text-xs text-forest-950 dark:text-forest-200">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-forest-600" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">Organisation Credentials</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Trust / Society / NGO Darpan Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MH/2019/0123456 or Trust Reg No."
                      value={orgRegNumber}
                      onChange={e => setOrgRegNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-forest-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Dedicated Service Localities / Wards
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Baner, Aundh, Kothrud, Shivaji Nagar"
                      value={serviceArea}
                      onChange={e => setServiceArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-forest-500"
                    />
                  </div>

                  <p className="text-[11px] text-forest-800 dark:text-forest-300 leading-relaxed">
                    Note: Registered organisations are maintained with an initial <strong>Pending Verification</strong> status while documentation is reviewed.
                  </p>
                </div>
              )}

              {/* Safety Charter Agreement */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I agree to the <strong>Sahaay Safety & Civic Charter</strong>. I understand that medical animal emergencies must be routed to qualified veterinarians, and user accounts maintain separate authentic ledgers.
                </span>
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth isLoading={isSubmitting}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Register New {role.toUpperCase()} Account</span>
            </Button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-forest-700 dark:text-forest-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
};
