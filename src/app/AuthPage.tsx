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
  ChevronDown,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  useAuth,
  SCHOOL_DEMO_PROFILES,
  COLLEGE_DEMO_PROFILES,
  COLLEGE_BRANCH_OPTIONS,
  type SchoolClassLevel,
  type UserProfile,
} from '@core/auth';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();

  // Active track persona: School vs College
  const [track, setTrack] = useState<'school' | 'college'>('school');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // School state
  const [selectedClass, setSelectedClass] = useState<SchoolClassLevel>('10');
  const [selectedStream, setSelectedStream] = useState<'science' | 'commerce' | 'arts' | 'general'>('general');
  
  // College state
  const [selectedCollegeBranch, setSelectedCollegeBranch] = useState<string>('Computer Science and Engineering (CSE)');
  const [customBranch, setCustomBranch] = useState('');
  const [collegeYear, setCollegeYear] = useState<string>('3rd Year');

  // Demo active tab
  const [demoTab, setDemoTab] = useState<'school' | 'college'>('school');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync demo tab with track card selection
  const handleSelectTrack = (newTrack: 'school' | 'college') => {
    setTrack(newTrack);
    setDemoTab(newTrack);
    setErrorMsg('');
  };

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
              {user.track === 'school'
                ? `Class ${user.classLevel}th Student`
                : `${user.collegeBranch || 'College Track'}${user.collegeYear ? ` (${user.collegeYear})` : ''}`}
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

  const effectiveCollegeBranch =
    selectedCollegeBranch === 'Other'
      ? customBranch.trim() || 'Custom Technical Stream'
      : selectedCollegeBranch;

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

        if (track === 'college' && selectedCollegeBranch === 'Other' && !customBranch.trim()) {
          setErrorMsg('Please enter your custom degree or branch name.');
          setLoading(false);
          return;
        }

        signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          track,
          classLevel: track === 'school' ? selectedClass : undefined,
          stream: track === 'school' && (selectedClass === '11' || selectedClass === '12') ? selectedStream : 'general',
          collegeBranch: track === 'college' ? effectiveCollegeBranch : undefined,
          collegeYear: track === 'college' ? collegeYear : undefined,
          avatar: track === 'school' ? '👨‍🎓' : '👨‍💻',
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
                ? 'Select your student category below to get personalized curriculum modules.'
                : 'Sign in to access your personal study planner, review queue & analytics.'}
            </p>
          </div>

          {/* Mode Switcher Tabs: Clean Sign In / Sign Up */}
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
              Sign Up
            </button>
          </div>

          {/* ── INTERACTIVE STUDENT CATEGORY CARDS ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)]">
                Choose Student Category:
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                {track === 'school' ? 'Classes 9th, 10th, 11th, 12th' : 'Undergraduate & Tech'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: School Student */}
              <button
                type="button"
                onClick={() => handleSelectTrack('school')}
                className={`relative p-4 rounded-2xl border text-left transition-all ${
                  track === 'school'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-md ring-2 ring-blue-500/20'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${track === 'school' ? 'bg-blue-600 text-white' : 'bg-[var(--color-surface)] text-blue-500 border border-[var(--color-border)]'}`}>
                    <School className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">School Student</span>
                      {track === 'school' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 mt-0.5">
                      Class 9th, 10th, 11th, 12th
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      CBSE / State Boards & Foundation
                    </p>
                  </div>
                </div>
              </button>

              {/* Card 2: College Student */}
              <button
                type="button"
                onClick={() => handleSelectTrack('college')}
                className={`relative p-4 rounded-2xl border text-left transition-all ${
                  track === 'college'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 shadow-md ring-2 ring-purple-500/20'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${track === 'college' ? 'bg-purple-600 text-white' : 'bg-[var(--color-surface)] text-purple-500 border border-[var(--color-border)]'}`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">College Student</span>
                      {track === 'college' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mt-0.5">
                      Engineering & Tech Streams
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      CSE, Mech, Civil, ECE, EEE & Placements
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                    placeholder={track === 'school' ? 'e.g. Aarav Sharma' : 'e.g. Rahul Mehta'}
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

            {/* Dynamic Fields for Sign Up based on Active Category Card */}
            {mode === 'signup' && (
              <div className="pt-2 border-t border-[var(--color-border)] space-y-3.5">
                {/* 1. School Student Fields: Class 9, 10, 11, 12 */}
                {track === 'school' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[var(--color-text)]">
                        Select Your School Class <span className="text-blue-500">*</span>
                      </label>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        Class 9th – 12th
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
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 shadow-md ring-2 ring-blue-500/20'
                                : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:border-blue-400'
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

                {/* 2. College Student Fields: Stream Dropdown, Custom Other Input, Year of Study */}
                {track === 'college' && (
                  <div className="space-y-3.5">
                    {/* Stream / Branch Dropdown */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[var(--color-text)]">
                          Choose Stream / Engineering Branch <span className="text-purple-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          Degree & Placements
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Cpu className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                        <select
                          value={selectedCollegeBranch}
                          onChange={(e) => setSelectedCollegeBranch(e.target.value)}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                        >
                          {COLLEGE_BRANCH_OPTIONS.map((branch) => (
                            <option key={branch} value={branch} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                              {branch}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      </div>
                    </div>

                    {/* Custom Input Field when "Other" is selected */}
                    {selectedCollegeBranch === 'Other' && (
                      <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-1.5 animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-purple-700 dark:text-purple-300">
                          Enter Your Degree / Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BCA, MCA, AI & Data Science, Chemical Engg, B.Sc IT..."
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-purple-300 dark:border-purple-700 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-[var(--color-text-muted)]"
                        />
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          Type your custom specialization to personalize your placement and interview modules.
                        </p>
                      </div>
                    )}

                    {/* College Year Selection */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                        Year of Study
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setCollegeYear(yr)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                              collegeYear === yr
                                ? 'border-purple-500 bg-purple-600 text-white shadow-xs'
                                : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] hover:border-purple-400'
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-4 ${
                track === 'college'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              <span>
                {mode === 'signup'
                  ? track === 'school'
                    ? `Sign Up as Class ${selectedClass}th Student`
                    : `Sign Up as College Student (${effectiveCollegeBranch.length > 25 ? effectiveCollegeBranch.slice(0, 22) + '...' : effectiveCollegeBranch})`
                  : track === 'school'
                  ? 'Sign In as School Student'
                  : 'Sign In as College Student'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles (Synced with active track card) */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                ⚡ Quick 1-Click Demo Logins:
              </span>
              {/* Tab selector for demo accounts */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setDemoTab('school')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    demoTab === 'school'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  School (9–12)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoTab('college')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    demoTab === 'college'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  College (CSE/ECE/Mech...)
                </button>
              </div>
            </div>

            {/* School Demos */}
            {demoTab === 'school' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SCHOOL_DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleDemoLogin(profile)}
                    className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{profile.avatar}</span>
                      <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Class {profile.classLevel}th
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                      {profile.name}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              /* College Demos */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLLEGE_DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleDemoLogin(profile)}
                    className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-purple-500 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{profile.avatar}</span>
                      <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                        {profile.collegeBranch?.includes('(')
                          ? profile.collegeBranch.match(/\(([^)]+)\)/)?.[1] || profile.collegeBranch.split(' ')[0]
                          : profile.collegeBranch?.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                      {profile.name} • {profile.collegeYear}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
        © 2026 Ai EduEngine • CBSE Class 9, 10, 11, 12 & Undergraduate Engineering Programs
      </footer>
    </div>
  );
}
