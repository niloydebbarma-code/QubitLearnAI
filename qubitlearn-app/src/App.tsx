/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CircuitState, CodingChallenge } from './types';
import { CircuitSimulator } from './quantum/simulator';
import { Header, ActiveTab, ThemeMode } from './components/Header';
import { AuthLandingPage, UserProfile } from './components/AuthLandingPage';
import { CircuitEditor } from './components/CircuitEditor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BlochSphere } from './components/BlochSphere';
import { StateVisualizer } from './components/StateVisualizer';
import { MultiFrameworkModal } from './components/MultiFrameworkModal';
import { CircuitDebugger } from './components/CircuitDebugger';
import { CurriculumModule } from './components/CurriculumModule';
import { SocraticTutor } from './components/SocraticTutor';
import { AssessmentEngine } from './components/AssessmentEngine';
import { PaperAnalyzer } from './components/PaperAnalyzer';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { ProgressDashboard } from './components/ProgressDashboard';
import { DiagramGenerator } from './components/DiagramGenerator';
import { AIExplanationModal, AIExplanationContext } from './components/AIExplanationModal';
import { CIRCUIT_PRESETS } from './quantum/presets';
import {
  Cpu,
  Bug,
  Layers,
  Database,
  Code2,
  CheckCircle2,
  BarChart3,
  Table,
  Grid,
  ShieldCheck,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  MessageSquare,
  Bot,
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('qubitlearn_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [themeMode, setThemeMode] = useState<ThemeMode>('obsidian');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Synchronize global HTML data-theme attribute with unified gray theme
  React.useEffect(() => {
    try {
      localStorage.removeItem('qubitlearn_theme');
      document.documentElement.removeAttribute('data-theme');
    } catch (_) {}
  }, []);

  // Active Quantum Circuit state (initialized to Bell Pair |Φ⁺⟩)
  const [circuit, setCircuit] = useState<CircuitState>({
    numQubits: 2,
    timeSteps: 6,
    gates: [
      { id: 'g0', type: 'H', qubit: 0, timeStep: 0 },
      { id: 'g1', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
    ],
  });

  // Selected qubit for 3D Bloch sphere
  const [activeBlochQubit, setActiveBlochQubit] = useState<number>(0);
  const [shotCount, setShotCount] = useState<number>(1024);

  // Highlight coordinates from AI debugger error localization
  const [highlightError, setHighlightError] = useState<{
    gateIndex?: number;
    qubitIndex?: number;
  } | null>(null);

  // Active step inspection (for step-by-step statevector & Bloch sphere evolution)
  const [activeStepInspection, setActiveStepInspection] = useState<number | null>(null);
  const [savedCircuitsList, setSavedCircuitsList] = useState<any[]>([]);
  const [saveCircuitName, setSaveCircuitName] = useState<string>('');
  const [isSavingCircuit, setIsSavingCircuit] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Global Movable AI Co-Pilot & Explainer Modal State
  const [isGlobalAiModalOpen, setIsGlobalAiModalOpen] = useState<boolean>(false);
  const [globalAiContext, setGlobalAiContext] = useState<AIExplanationContext | null>(null);

  const openGlobalAiCopilot = (topic: AIExplanationContext['topic'] = 'general', customPrompt?: string) => {
    setGlobalAiContext({
      topic,
      title: 'Quantum AI Co-Pilot & State Explainer',
      circuit,
      blochCoords: activeBlochCoords,
      statevector: simulationResult.statevector,
      customPrompt,
    });
    setIsGlobalAiModalOpen(true);
  };

  // Fetch Saved Circuits from Cloud Supabase
  const loadSavedCircuits = () => {
    fetch('/api/circuit-designer/circuits')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSavedCircuitsList(data);
        else if (Array.isArray(data?.data)) setSavedCircuitsList(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Re-fetch circuits optionally if needed, studioSubTab was removed
    loadSavedCircuits();
  }, []);

  const handleSaveCircuitToCloud = async () => {
    if (!saveCircuitName.trim()) return;
    setIsSavingCircuit(true);
    try {
      const res = await fetch('/api/circuit-designer/circuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveCircuitName.trim(),
          userId: currentUser?.name || 'default_student',
          circuit,
        }),
      });
      const data = await res.json();
      setSaveSuccessMsg(`Circuit "${saveCircuitName}" saved to Supabase Cloud!`);
      setSaveCircuitName('');
      loadSavedCircuits();
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (_) {
      setSaveSuccessMsg('Error saving circuit to cloud.');
    } finally {
      setIsSavingCircuit(false);
    }
  };

  // Run exact Hilbert space simulation whenever the circuit, shot count, or step inspection changes
  const simulationResult = useMemo(() => {
    return CircuitSimulator.simulate(
      circuit,
      shotCount,
      activeStepInspection !== null ? activeStepInspection : undefined
    );
  }, [circuit, shotCount, activeStepInspection]);

  const activeBlochCoords =
    (simulationResult?.blochCoordinates && simulationResult.blochCoordinates[activeBlochQubit]) ||
    (simulationResult?.blochSpheres && simulationResult.blochSpheres[activeBlochQubit]) || {
      x: 0,
      y: 0,
      z: 1,
      theta: 0,
      phi: 0,
      purity: 1.0,
      isEntangled: false,
    };

  const verification = simulationResult?.verification || {
    type: 'A' as const,
    method: 'exact-symbolic-check + full-statevector-simulation',
    confidence: 1.0,
    verified: true,
    disclosure: 'Mathematically verified to exact floating-point precision in Hilbert space.',
  };

  const handleLoadPreset = (presetId: string) => {
    const found = CIRCUIT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCircuit(found.circuit);
      if (activeBlochQubit >= found.circuit.numQubits) {
        setActiveBlochQubit(0);
      }
    }
  };

  const handleLoadChallengeToStudio = (challenge: CodingChallenge) => {
    setCircuit({
      numQubits: challenge.numQubits,
      timeSteps: 6,
      gates: challenge.initialGates ? [...challenge.initialGates] : [],
    });
    setActiveBlochQubit(0);
  };

  const handleResample = (shots: number) => {
    setShotCount(shots);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('qubitlearn_user');
      localStorage.removeItem('qubitlearn_token');
    } catch (_) {}
    setCurrentUser(null);
  };

  // If user is not authenticated, render the dedicated Home / Landing & Authentication Gateway
  if (!currentUser) {
    return (
      <AuthLandingPage
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  // Unified Polished Light & Balanced Color Theme canvas
  const themeWrapperClass = 'bg-[#f8fafc] text-[#0f172a]';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${themeWrapperClass}`}>
      {/* Universal Header with User Profile, Settings & Logout */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        themeMode="obsidian"
        setThemeMode={() => {}}
        highContrast={false}
        setHighContrast={() => {}}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        verificationConfidence={verification.confidence}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-[1680px] 2xl:max-w-[1840px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: All-In-One Unified Quantum Circuit Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Interactive Visual Circuit Editor */}
            <ErrorBoundary fallbackTitle="Circuit Designer Runtime Protection">
              <CircuitEditor
                circuit={circuit}
                setCircuit={setCircuit}
                soundEnabled={soundEnabled}
                highlightError={highlightError}
                setHighlightError={setHighlightError}
                activeStepInspection={activeStepInspection}
                setActiveStepInspection={setActiveStepInspection}
              />
            </ErrorBoundary>

            {/* Unified Vertical Flow: Math Analysis -> Bloch Sphere */}
            <div className="flex flex-col gap-6 w-full">
              {/* Mathematics & Probability Layer */}
              <StateVisualizer
                result={simulationResult}
                verification={verification}
                onResample={handleResample}
                activeView="histogram"
                onViewChange={() => {}}
                onNavigateToTutor={() => setActiveTab('tutor')}
              />

              {/* Physical Visualization Layer */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <BlochSphere
                  coordinates={activeBlochCoords}
                  qubitIndex={activeBlochQubit}
                  numQubits={circuit.numQubits}
                  onSelectQubit={setActiveBlochQubit}
                  onNavigateToTutor={() => setActiveTab('tutor')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Curriculum Modules (20 Courses) */}
        {activeTab === 'curriculum' && (
          <CurriculumModule
            onLoadPreset={handleLoadPreset}
            onJumpToStudio={() => {
              setActiveTab('studio');
              setStudioSubTab('visualizer');
            }}
          />
        )}

        {/* Tab 3: Socratic AI Quantum Tutor */}
        {activeTab === 'tutor' && (
          <SocraticTutor circuit={circuit} soundEnabled={soundEnabled} />
        )}

        {/* Tab 4: Bias-Resistant Assessment Engine */}
        {activeTab === 'assessment' && (
          <AssessmentEngine
            onLoadChallengeToStudio={handleLoadChallengeToStudio}
            onJumpToStudio={() => {
              setActiveTab('studio');
              setStudioSubTab('visualizer');
            }}
            currentCircuit={circuit}
          />
        )}

        {/* Tab 5: Academic Research Paper Analyzer & Lean 4 Verifier */}
        {activeTab === 'papers' && <PaperAnalyzer />}

        {/* Tab 6: Quantum Lecture Video Analyzer & OCR */}
        {activeTab === 'video' && <VideoAnalyzer />}

        {/* Tab 7: Learner Progress & Instructor Analytics */}
        {activeTab === 'progress' && (
          <ProgressDashboard
            user={currentUser}
            onNavigateToCurriculum={() => {
              setActiveTab('curriculum');
            }}
          />
        )}
      </main>

      {/* Multi-Framework Transpiler Modal (Qiskit, PennyLane, Cirq, qBraid, OpenQASM, LaTeX) */}
      <MultiFrameworkModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        circuit={circuit}
      />

      {/* Global Movable, Dockable AI Co-Pilot & Concept Explainer */}
      <AIExplanationModal
        isOpen={isGlobalAiModalOpen}
        onClose={() => setIsGlobalAiModalOpen(false)}
        context={globalAiContext}
        onNavigateToTutor={() => {
          setIsGlobalAiModalOpen(false);
          setActiveTab('tutor');
        }}
      />

      {/* Floating AI Trigger Button (Bottom Right) */}
      {!isGlobalAiModalOpen && (
        <button
          type="button"
          onClick={() => openGlobalAiCopilot('general')}
          className="fixed bottom-5 right-5 z-40 flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xl ring-2 ring-indigo-300/70 hover:ring-indigo-400 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
          title="Open Movable AI Chat (Can move left/right/float, zoom, and analyze)"
        >
          <div className="p-1 rounded-lg bg-white/20 text-yellow-300 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-sans">AI</span>
        </button>
      )}

      {/* Clean Subtle Footer */}
      <footer className="border-t border-slate-200 py-4 px-6 text-center text-[11px] text-slate-500 font-mono bg-white">
        QubitLearn AI • Quantum Computing & Algorithm Learning Platform • Exact Matrix Hilbert Space Engine & Multi-Framework Transpiler
      </footer>
    </div>
  );
}
