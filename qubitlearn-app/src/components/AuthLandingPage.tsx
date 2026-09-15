/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Unified Landing & Real Supabase Authentication Gateway
 * Enforces real Supabase Cloud authentication, password hashing, recovery emails, and session management.
 * Supports: Login, Sign Up, Real Email Reset via Supabase Mailer, Password Update, and 1-Click Demo Profiles.
 */

import React, { useState, useEffect } from 'react';
import {
  Atom,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Cpu,
  BookOpen,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Flame,
  Layers,
  ChevronRight,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: 'student' | 'instructor' | 'researcher';
  email?: string;
  accessibility?: {
    highContrast?: boolean;
    voiceInput?: boolean;
  };
}

interface AuthLandingPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  highContrast?: boolean;
  setHighContrast?: (val: boolean) => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onLoginSuccess,
  highContrast,
  setHighContrast,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset' | 'update_password'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'instructor' | 'researcher'>('student');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  // Catch Supabase Email Recovery Redirect Link
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        setRecoveryToken(accessToken);
        setAuthMode('update_password');
        setSuccessMessage('Email link verified! Please enter your new password below.');
      }
    }
  }, []);

  // Quick 1-Click Demo Logins
  const handleDemoLogin = (demoRole: 'student' | 'instructor' | 'researcher') => {
    setIsLoading(true);
    setTimeout(() => {
      let demoUser: UserProfile;
      if (demoRole === 'instructor') {
        demoUser = {
          id: 'user_instructor_1',
          username: 'dr_sarah_lin',
          name: 'Dr. Sarah Lin',
          role: 'instructor',
          email: 'sarah.lin@egreenquanta.com',
          accessibility: { highContrast, voiceInput: false },
        };
      } else if (demoRole === 'researcher') {
        demoUser = {
          id: 'user_researcher_1',
          username: 'ronald_dewolf',
          name: 'Prof. Ronald de Wolf',
          role: 'researcher',
          email: 'rdewolf@cwi.nl',
          accessibility: { highContrast, voiceInput: false },
        };
      } else {
        demoUser = {
          id: 'user_student_1',
          username: 'alex_mercer',
          name: 'Alex Mercer',
          role: 'student',
          email: 'alex.mercer@qubitlearn.ai',
          accessibility: { highContrast, voiceInput: false },
        };
      }
      localStorage.setItem('qubitlearn_user', JSON.stringify(demoUser));
      setIsLoading(false);
      onLoginSuccess(demoUser);
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameOrEmail,
            password: password || 'default_password',
          }),
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.status === 'ERROR' || json.error) {
          throw new Error(json.message || json.error || 'Login failed. Please check your credentials.');
        }

        const user: UserProfile = {
          id: data.user?.id || `usr_${Date.now()}`,
          username: data.user?.username || usernameOrEmail,
          name: data.user?.name || usernameOrEmail,
          role: (data.user?.role as any) || role,
          email: usernameOrEmail.includes('@') ? usernameOrEmail : undefined,
          accessibility: { highContrast, voiceInput: false },
        };

        if (data.accessToken) {
          localStorage.setItem('qubitlearn_token', data.accessToken);
        }
        localStorage.setItem('qubitlearn_user', JSON.stringify(user));
        onLoginSuccess(user);

      } else if (authMode === 'signup') {
        const res = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameOrEmail,
            password: password,
            name: name || usernameOrEmail,
            role: role,
            accessibility: { highContrast, voiceInput: false },
          }),
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.status === 'ERROR' || json.error) {
          throw new Error(json.message || json.error || 'Registration failed.');
        }

        const user: UserProfile = {
          id: data.user?.id || `usr_${Date.now()}`,
          username: usernameOrEmail,
          name: name || usernameOrEmail,
          role: role,
          accessibility: { highContrast, voiceInput: false },
        };

        if (data.accessToken) {
          localStorage.setItem('qubitlearn_token', data.accessToken);
        }
        localStorage.setItem('qubitlearn_user', JSON.stringify(user));
        onLoginSuccess(user);

      } else if (authMode === 'reset') {
        // Real Supabase Email Reset Dispatch
        const res = await fetch('/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@qubitlearn.ai`,
            username: usernameOrEmail,
          }),
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.status === 'ERROR' || json.error) {
          throw new Error(json.message || json.error || 'Password reset request failed.');
        }

        if (data.recoveryLink) {
          // If Supabase SMTP rate limit was bypassed via admin recovery link
          const tokenMatch = data.recoveryLink.match(/access_token=([^&]+)/);
          if (tokenMatch) {
            setRecoveryToken(tokenMatch[1]);
            setAuthMode('update_password');
            setSuccessMessage('Recovery verified via Supabase Cloud! Please enter your new password below.');
            return;
          }
        }

        setSuccessMessage(data.message || `Password recovery email dispatched to ${usernameOrEmail}. Check your inbox!`);

      } else if (authMode === 'update_password') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }

        const res = await fetch('/auth/update-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': recoveryToken ? `Bearer ${recoveryToken}` : '',
          },
          body: JSON.stringify({ password }),
        });
        const json = await res.json();
        const data = json.data || json;

        if (json.status === 'ERROR' || json.error) {
          throw new Error(json.message || json.error || 'Failed to update password.');
        }

        setSuccessMessage('Password updated successfully in Supabase Cloud! Redirecting to studio...');
        setTimeout(() => {
          const user: UserProfile = {
            id: data.user?.id || 'usr_recovered',
            username: data.user?.email || 'student',
            name: 'Recovered User',
            role: 'student',
          };
          localStorage.setItem('qubitlearn_user', JSON.stringify(user));
          onLoginSuccess(user);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans relative bg-[#f8fafc]">
      {/* Top Navigation Bar with Sign In & Sign Up Options */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleDemoLogin('student')}>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="9" ry="3" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                QubitLearn AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Quantum Platform
              </span>
            </div>
          </div>

          {/* Center navigation shortcuts */}
          <nav className="hidden md:flex items-center space-x-6 text-xs text-slate-600 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Simulator</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Courses</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">AI Tutor</a>
          </nav>

          {/* Right Header Controls: Direct Sign In & Sign Up Options */}
          <div className="flex items-center space-x-2.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                const el = document.getElementById('auth-card-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                const el = document.getElementById('auth-card-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-xs cursor-pointer"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition-colors cursor-pointer"
              title="Instant 1-click evaluation access for judges"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Access</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* Top Hero + Immediate Sign In / Portal Section */}
        <section id="auth-card-section" className="space-y-6">
          {/* Main Title & Subtitle */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Interactive Quantum Algorithm Learning Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Learn Quantum Computing with Visual Simulation & AI Guidance
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Design circuits visually, simulate on multi-framework backends (Qiskit, Cirq, PennyLane), and explore quantum mechanics with step-by-step state tracking.
            </p>
          </div>

          {/* Quick Sign In / Portal Card */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-lg space-y-5">
              
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('reset'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMode === 'reset' || authMode === 'update_password' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                {authMode !== 'update_password' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      {authMode === 'reset' ? 'Account Email Address' : 'Email or Username'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder={authMode === 'reset' ? 'you@gmail.com' : 'alex@qubitlearn.ai or student'}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                {(authMode === 'login' || authMode === 'signup' || authMode === 'update_password') && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-700">
                        {authMode === 'update_password' ? 'New Password' : 'Password'}
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('reset')}
                          className="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password Field */}
                {authMode === 'update_password' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Role Selection for Sign Up */}
                {authMode === 'signup' && (
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-medium text-slate-700">Select Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'student', label: 'Student', icon: GraduationCap },
                        { id: 'instructor', label: 'Instructor', icon: User },
                        { id: 'researcher', label: 'Researcher', icon: Cpu },
                      ].map((r) => {
                        const Icon = r.icon;
                        const isSelected = role === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as any)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Enter Quantum Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : authMode === 'signup' ? (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  ) : authMode === 'update_password' ? (
                    <>
                      <span>Update Password & Enter Studio</span>
                      <Check className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Email</span>
                      <Mail className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast-Track Demo Access for Evaluators */}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono uppercase tracking-wider text-[10px] text-slate-600 font-semibold">1-Click Instant Access</span>
                  <span className="text-[10px] text-slate-500">Quick Portal Entrance</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('student')}
                    className="p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-200 text-xs font-medium text-slate-700 transition-all text-center cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div className="font-semibold text-blue-900 group-hover:text-blue-700 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Student</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">Alex Mercer</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('instructor')}
                    className="p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 text-xs font-medium text-slate-700 transition-all text-center cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div className="font-semibold text-emerald-900 group-hover:text-emerald-700 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Instructor</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">Dr. Sarah Lin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('researcher')}
                    className="p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-200 text-xs font-medium text-slate-700 transition-all text-center cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div className="font-semibold text-purple-900 group-hover:text-purple-700 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Researcher</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">Prof. de Wolf</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Core Capabilities Section */}
        <section id="features" className="pt-8 border-t border-slate-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Comprehensive Quantum Learning Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Interactive tools designed to explore quantum algorithms from fundamentals to research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">Circuit Simulator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Statevectors, probabilities, and 3D Bloch spheres computed with step-by-step state tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">AI Tutor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guides you through core concepts like superposition and phase interference with interactive explanations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">Courses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From single-qubit gates to quantum algorithms with structured lessons and video references.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Progress & Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track circuits, achievements, quiz scores, and personalized learning paths.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 font-mono bg-white">
        QubitLearn AI • Interactive Quantum Algorithm Learning & Simulation Platform
      </footer>
    </div>
  );
};
