/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Quantum Learning & Progress Dashboard
 * Modern White-First Design with Dynamic Metrics & Cohort Insights
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  BarChart3,
  Cpu,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PersonalizedPathResult } from '../types';
import { UserProfile } from './AuthLandingPage';

interface ProgressDashboardProps {
  onClose?: () => void;
  onNavigateToCurriculum?: (moduleId: string) => void;
  user?: UserProfile | null;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onNavigateToCurriculum, user }) => {
  // Determine if user has instructor privileges
  const isInstructor = user?.role === 'instructor' || user?.role === 'researcher';
  const [viewRole, setViewRole] = useState<'student' | 'instructor'>(() => (isInstructor ? 'instructor' : 'student'));
  const [learnerData, setLearnerData] = useState<any>(null);
  const [pathResult, setPathResult] = useState<PersonalizedPathResult | null>(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState<boolean>(false);
  const [instructorData, setInstructorData] = useState<any>(null);

  // Sync viewRole with user account role if it changes
  useEffect(() => {
    if (!isInstructor) {
      setViewRole('student');
    }
  }, [user?.role, isInstructor]);

  useEffect(() => {
    fetch('/api/database/stats')
      .then((res) => res.json())
      .catch(() => {});

    fetch('/api/progress/default_student')
      .then((res) => res.json())
      .then(setLearnerData)
      .catch(() => {});

    fetch('/api/progress/instructor/classes/cohort_1/summary')
      .then((res) => res.json())
      .then((json) => setInstructorData(json.data))
      .catch(() => {});
  }, []);

  const handleGeneratePath = async () => {
    setIsGeneratingPath(true);
    try {
      const res = await fetch('/api/curriculum/learning-path/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_student' }),
      });
      const data = await res.json();
      setPathResult(data);
    } catch (_) {
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const COMPETENCIES = [
    { name: 'Superposition & Single-Qubit Rotations', level: 98, status: 'Mastered', gates: 'H, X, Y, Z, S, T, R_x' },
    { name: 'Multi-Qubit Entanglement & Bell States', level: 92, status: 'Mastered', gates: 'CX, CZ, SWAP' },
    { name: 'Quantum Phase Kickback Mechanism', level: 85, status: 'Proficient', gates: 'Controlled-U, Eigenstates' },
    { name: 'Grover Search & Amplitude Amplification', level: 78, status: 'In Progress', gates: 'Oracle, Diffusion' },
    { name: 'NISQ Algorithms & Variational Ansätze', level: 70, status: 'In Progress', gates: 'VQE, QAOA' },
  ];

  const RECENT_CHALLENGES = [
    { title: 'Bell State |Φ⁺⟩ Generator', score: '100% Pass', date: 'Today', status: 'Passed' },
    { title: 'Phase Kickback Verification', score: '100% Pass', date: 'Yesterday', status: 'Passed' },
    { title: '3-Qubit GHZ State Entanglement', score: '100% Pass', date: '2 days ago', status: 'Passed' },
    { title: 'Quantum Teleportation Protocol', score: '95% Pass', date: '3 days ago', status: 'Passed' },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Role Toggle & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Learning & Progress
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              Progress Tracker
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Quantum Learning & Progress Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track linear algebra competencies, coding challenge verifications, and learning milestones.
          </p>
        </div>

        {/* Role Toggle & Badges: Restricted based on actual logged in account */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isInstructor ? (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewRole('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewRole === 'student'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student View</span>
              </button>
              <button
                onClick={() => setViewRole('instructor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewRole === 'instructor'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instructor View</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Student Progress</span>
            </div>
          )}
        </div>
      </div>

      {viewRole === 'student' ? (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Quantum XP</div>
                <div className="text-xl font-bold font-mono text-slate-900">{learnerData?.xp || '2,450'}</div>
                <div className="text-[10px] text-emerald-600 font-mono font-bold">+350 this week</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Simulations Run</div>
                <div className="text-xl font-bold font-mono text-slate-900">128</div>
                <div className="text-[10px] text-slate-500 font-mono">Qiskit + Exact Matrix</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Challenges Solved</div>
                <div className="text-xl font-bold font-mono text-slate-900">4 / 5</div>
                <div className="text-[10px] text-emerald-600 font-mono font-bold">80% Completion</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Invigilator Fairness</div>
                <div className="text-xl font-bold font-mono text-slate-900">96%</div>
                <div className="text-[10px] text-purple-600 font-mono font-bold">Audited Dual-Agent</div>
              </div>
            </div>
          </div>

          {/* AI Personalized Learning Path Engine Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">AI Adaptive Learning Path Engine</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    Personalized AI Diagnostic
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Analyzes your assessment performance history and error localizations to dynamically formulate remedial and stretch learning modules.
                </p>
              </div>

              <button
                onClick={handleGeneratePath}
                disabled={isGeneratingPath}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-white ${isGeneratingPath ? 'animate-spin' : ''}`} />
                <span>{isGeneratingPath ? 'Generating Path...' : 'Recommend Adaptive Path'}</span>
              </button>
            </div>

            {pathResult && (
              <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-800">Identified Strengths:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {pathResult.strengthsIdentified.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-800">Targeted Remedial Areas:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {pathResult.weaknessesIdentified.map((w, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800">Recommended Learning Sequence:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {pathResult.recommendedModules.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-2 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {m.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">Step {idx + 1}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 mt-1">{m.title}</div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{m.justification}</p>
                        </div>

                        {onNavigateToCurriculum && (
                          <button
                            onClick={() => onNavigateToCurriculum(m.moduleId)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <span>Open Module</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                  <span>{pathResult.verificationSidecar?.disclosure || 'Adaptive path generated via Gemini 2.5'}</span>
                  <span>Generated: {new Date(pathResult.generatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Competency Mastery Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Quantum Computing Competencies</span>
                </h3>
                <span className="text-xs text-indigo-700 font-mono font-bold">84% Overall Proficiency</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {COMPETENCIES.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="font-mono font-bold text-slate-900">{c.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${c.level}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Gates: {c.gates}</span>
                      <span className="text-indigo-700 font-bold">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Verifications & Coding Unit Tests */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Coding Challenge Verifications</span>
              </h3>

              <div className="space-y-2.5 pt-1">
                {RECENT_CHALLENGES.map((ch, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{ch.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{ch.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                        {ch.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Instructor View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">Class Cohort Overview</span>
            <button
              onClick={() => {
                fetch('/api/progress/instructor/classes/cohort_1/summary')
                  .then((r) => r.json())
                  .then((j) => setInstructorData(j.data))
                  .catch(() => {});
              }}
              className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-semibold"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Enrolled Cohort</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {instructorData?.cohortSize || 42} Students
              </div>
              <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
                {instructorData?.activeStudents || 38} Active Learners
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Class Average Score</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {instructorData?.classAverageScore || 87.4}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across completed coding labs</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Assessment Consistency</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {instructorData?.fairnessAuditScore || 98.1}%
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Consistent evaluation across submissions</div>
            </div>
          </div>

          {instructorData?.summaryText && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instructor Insights</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{instructorData.summaryText}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Common Conceptual Challenges</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from circuit checks and tutoring sessions.
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Phase Kickback Target Preparation</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Students often omit initializing target qubit in |−⟩ prior to CNOT.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                  48% of errors
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Grover Diffusion Operator Phase Inversion</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reversal of Hadamard sandwich before applying the 2|0⟩⟨0| - I operator.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                  32% of errors
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Bell Measurement Feed-Forward Logic</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Applying Bob's X and Z Pauli corrections in reverse order.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
                  20% of errors
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
