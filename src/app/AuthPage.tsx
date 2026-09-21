// src/app/AuthPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  School,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  BookOpen,
  Atom,
  Building2,
  Palette,
  ArrowLeft,
} from 'lucide-react';
import {
  useAuth,
  DEMO_PROFILES,
  type SchoolClassLevel,
  type UserProfile,
} from '@core/auth';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();

  // Signup form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [track, setTrack] = useState<'school' | 'college'>('school');
  const [selectedClass, setSelectedClass] = useState<SchoolClassLevel>('10');
  const [selectedStream, setSelectedStream] = useState<'science' | 'commerce' | 'arts' | 'general'>('general');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, show logged-in card or let them go to dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
            {user.avatar || '🎓'}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[var(--color-text)]">
              Welcome back, {user.name}!
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Logged in as <strong className="text-[var(--color-text)]">{user.email}</strong> •{' '}
              {user.track === 'school' ? `Class ${user.classLevel}th` : 'College Track'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <span>Continue to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] transition-colors text-center"
            >
              Go to Home Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          track,
          classLevel: track === 'school' ? selectedClass : undefined,
          stream: track === 'school' && (selectedClass === '11' || selectedClass === '12') ? selectedStream : 'general',
          avatar: track === 'school' ? '👨‍🎓' : '🎓',
        });
      } else {
        login(email.trim().toLowerCase(), password);
      }

      navigate('/dashboard');
    } catch {
      setErrorMsg('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (profile: UserProfile) => {
    login(profile.email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight text-[var(--color-text)]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>Ai EduEngine</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-border)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {mode === 'signup' ? 'Create Student Account' : 'Welcome Back, Scholar'}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {mode === 'signup'
                ? 'Join precision curriculum intelligence & track your mastery across classes.'
                : 'Sign in to access your personal study planner, FSRS review queue & analytics.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Sign Up (Class 9–12)
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Track & Class Selection (for Signup) */}
            {mode === 'signup' && (
              <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
                {/* Track Selector */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                    Select Track
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTrack('school')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        track === 'school'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>School (Class 9–12)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrack('college')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        track === 'college'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>College Track</span>
                    </button>
                  </div>
                </div>

                {/* Class Selection — strictly Class 9, 10, 11, 12 */}
                {track === 'school' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[var(--color-text)]">
                        Select Your Class <span className="text-[var(--color-accent)]">*</span>
                      </label>
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                        CBSE / State Curriculum
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {(['9', '10', '11', '12'] as SchoolClassLevel[]).map((cls) => {
                        const isSelected = selectedClass === cls;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              setSelectedClass(cls);
                              if (cls === '9' || cls === '10') setSelectedStream('general');
                              else if (selectedStream === 'general') setSelectedStream('science');
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shadow-md ring-2 ring-[var(--color-accent)]/20'
                                : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:border-[var(--color-accent)]'
                            }`}
                          >
                            <span className="text-lg font-black">{cls}th</span>
                            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                              Class {cls}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Stream Selection for Class 11th and 12th */}
                    {(selectedClass === '11' || selectedClass === '12') && (
                      <div className="p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
                        <span className="text-xs font-bold text-[var(--color-text)] block">
                          Class {selectedClass}th Stream Focus:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStream('science')}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                              selectedStream === 'science'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            }`}
                          >
                            <Atom className="w-3.5 h-3.5" />
                            <span>Science</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStream('commerce')}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                              selectedStream === 'commerce'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Commerce</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStream('arts')}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                              selectedStream === 'arts'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            }`}
                          >
                            <Palette className="w-3.5 h-3.5" />
                            <span>Arts</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 mt-4"
            >
              <span>{mode === 'signup' ? `Sign Up as Class ${selectedClass}th Student` : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                ⚡ Quick 1-Click Demo Logins:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleDemoLogin(profile)}
                  className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{profile.avatar}</span>
                    <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                      Class {profile.classLevel}th
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                    {profile.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
        © 2026 Ai EduEngine • CBSE Class 9, 10, 11, 12 & Undergraduate Success
      </footer>
    </div>
  );
}
