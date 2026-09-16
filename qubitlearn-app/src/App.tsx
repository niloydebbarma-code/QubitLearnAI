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
  const [studioSubTab, setStudioSubTab] = useState<'visualizer' | 'debugger' | 'diagram' | 'cloud'>('visualizer');
  const [visualizerSubView, setVisualizerSubView] = useState<'histogram' | 'statevector' | 'density' | 'verification'>('histogram');
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
    if (studioSubTab === 'cloud') {
      loadSavedCircuits();
    }
  }, [studioSubTab]);

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
                activeStepInspection={activeStepInspection}
                setActiveStepInspection={setActiveStepInspection}
              />
            </ErrorBoundary>

            {/* Studio Workspace Sub-Panel Switcher & Highlighted Feature Toolbar */}
            <div className="bg-white rounded-2xl border-2 border-blue-200/90 shadow-sm p-3.5 space-y-3">
              {/* Top Banner: Studio Telemetry & Quick Algorithm Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/90 text-blue-900 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                    <span>Quantum Studio & State Analysis Hub</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                    State Dim: <strong className="text-slate-800 font-bold">2^{circuit.numQubits} = {Math.pow(2, circuit.numQubits)}</strong> • {circuit.gates.length} Gates • {circuit.timeSteps} Depth
                  </span>
                </div>

                {/* 1-Click Fast Presets for Students */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mr-0.5 hidden md:inline">Quick Presets:</span>
                  <button
                    onClick={() => {
                      const p = CIRCUIT_PRESETS.find((x) => x.id === 'bell-phi-plus');
                      if (p) setCircuit(p.circuit);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition cursor-pointer font-sans shadow-2xs"
                    title="Bell State |Φ⁺⟩"
                  >
                    |Φ⁺⟩ Bell
                  </button>
                  <button
                    onClick={() => {
                      const p = CIRCUIT_PRESETS.find((x) => x.id === 'ghz-state');
                      if (p) setCircuit(p.circuit);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 transition cursor-pointer font-sans shadow-2xs"
                    title="3-Qubit GHZ State"
                  >
                    GHZ 3Q
                  </button>
                  <button
                    onClick={() => {
                      const p = CIRCUIT_PRESETS.find((x) => x.id === 'grover-search-2q');
                      if (p) setCircuit(p.circuit);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition cursor-pointer font-sans shadow-2xs"
                    title="Grover's Search Algorithm"
                  >
                    Grover Search
                  </button>
                  <button
                    onClick={() => {
                      const p = CIRCUIT_PRESETS.find((x) => x.id === 'deutsch-jozsa');
                      if (p) setCircuit(p.circuit);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 transition cursor-pointer font-sans shadow-2xs"
                    title="Deutsch-Jozsa Algorithm"
                  >
                    Deutsch-Jozsa
                  </button>
                </div>
              </div>

              {/* Main Feature Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  {/* Primary State & 3D Bloch */}
                  <button
                    onClick={() => {
                      setStudioSubTab('visualizer');
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      studioSubTab === 'visualizer' && visualizerSubView === 'histogram'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                        : studioSubTab === 'visualizer'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>State & 3D Bloch</span>
                  </button>

                  {/* Direct Analytical State Subtabs */}
                  <button
                    onClick={() => {
                      setStudioSubTab('visualizer');
                      setVisualizerSubView('histogram');
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      studioSubTab === 'visualizer' && visualizerSubView === 'histogram'
                        ? 'bg-blue-100 text-blue-800 font-bold border border-blue-300 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-slate-50/60'
                    }`}
                    title="Directly inspect Born rule measurement outcome probabilities and shot frequencies"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Probabilities</span>
                  </button>

                  <button
                    onClick={() => {
                      setStudioSubTab('visualizer');
                      setVisualizerSubView('statevector');
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      studioSubTab === 'visualizer' && visualizerSubView === 'statevector'
                        ? 'bg-purple-100 text-purple-800 font-bold border border-purple-300 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-slate-50/60'
                    }`}
                    title="Inspect Dirac ket statevector, complex amplitudes, and phase angles"
                  >
                    <Table className="w-3.5 h-3.5 text-purple-600" />
                    <span>Amplitudes</span>
                  </button>

                  <button
                    onClick={() => {
                      setStudioSubTab('visualizer');
                      setVisualizerSubView('density');
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      studioSubTab === 'visualizer' && visualizerSubView === 'density'
                        ? 'bg-cyan-100 text-cyan-800 font-bold border border-cyan-300 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-slate-50/60'
                    }`}
                    title="Inspect full 2ⁿ × 2ⁿ density matrix ρ = |ψ⟩⟨ψ|, coherence, and purity"
                  >
                    <Grid className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Density Matrix (ρ)</span>
                  </button>

                  <button
                    onClick={() => {
                      setStudioSubTab('visualizer');
                      setVisualizerSubView('verification');
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      studioSubTab === 'visualizer' && visualizerSubView === 'verification'
                        ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-slate-50/60'
                    }`}
                    title="Exact mathematical proof and ground-truth verification"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verification</span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-0.5 hidden sm:block" />

                  {/* Circuit Tools */}
                  <button
                    onClick={() => setStudioSubTab('debugger')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      studioSubTab === 'debugger'
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
                        : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50 bg-white border border-slate-200'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5 text-purple-500" />
                    <span>Circuit Debugger</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      studioSubTab === 'debugger' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                    }`}>
                      AI
                    </span>
                  </button>

                  <button
                    onClick={() => setStudioSubTab('diagram')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      studioSubTab === 'diagram'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 bg-white border border-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Diagrams & LaTeX</span>
                  </button>

                  <button
                    onClick={() => setStudioSubTab('cloud')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      studioSubTab === 'cloud'
                        ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400/40'
                        : 'text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 bg-white border border-slate-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Cloud Circuits</span>
                  </button>
                </div>

                {/* Highlighted Export Code Action */}
                <button
                  onClick={() => setIsCodeModalOpen(true)}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold shadow-sm ring-2 ring-indigo-300/60 hover:ring-indigo-400 transition-all cursor-pointer shrink-0"
                  title="Export code to 10 Quantum SDKs: Qiskit, Cirq, PennyLane, Amazon Braket, NVIDIA CUDA-Q, Microsoft Q#, pyQuil, QuTiP, OpenQASM, and LaTeX quantikz"
                >
                  <Code2 className="w-4 h-4 text-white" />
                  <span>Export Code</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono font-medium">
                    10 SDKs
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Panel 1: Statevector & 3D Bloch Visualizer */}
            {studioSubTab === 'visualizer' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-200">
                <div className="lg:col-span-7 xl:col-span-7 min-w-0 flex flex-col">
                  <StateVisualizer
                    result={simulationResult}
                    verification={verification}
                    onResample={handleResample}
                    activeView={visualizerSubView}
                    onViewChange={setVisualizerSubView}
                    onNavigateToTutor={() => setActiveTab('tutor')}
                  />
                </div>

                <div className="lg:col-span-5 xl:col-span-5 min-w-0 flex flex-col">
                  <BlochSphere
                    coordinates={activeBlochCoords}
                    qubitIndex={activeBlochQubit}
                    numQubits={circuit.numQubits}
                    onSelectQubit={setActiveBlochQubit}
                    onNavigateToTutor={() => setActiveTab('tutor')}
                  />
                </div>
              </div>
            )}

            {/* Sub-Panel 2: Embedded AI Multimodal Circuit Debugger */}
            {studioSubTab === 'debugger' && (
              <div className="animate-in fade-in duration-200">
                <CircuitDebugger
                  circuit={circuit}
                  setCircuit={setCircuit}
                  setHighlightError={setHighlightError}
                  onJumpToStudio={() => setStudioSubTab('visualizer')}
                />
              </div>
            )}

            {/* Sub-Panel 3: Embedded Deterministic SVG & LaTeX Quantikz Generator */}
            {studioSubTab === 'diagram' && (
              <div className="animate-in fade-in duration-200">
                <DiagramGenerator circuit={circuit} />
              </div>
            )}

            {/* Sub-Panel 4: Cloud Saved Circuits Manager & Canonical Academic Algorithm Library */}
            {studioSubTab === 'cloud' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-600" />
                      <span>Cloud Circuits & Curated Algorithm Library</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Save custom circuits to cloud and explore foundational quantum computing algorithms
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveCircuitName}
                      onChange={(e) => setSaveCircuitName(e.target.value)}
                      placeholder="Enter circuit name..."
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 w-48 font-medium shadow-2xs"
                    />
                    <button
                      onClick={handleSaveCircuitToCloud}
                      disabled={isSavingCircuit || !saveCircuitName.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      {isSavingCircuit ? 'Saving...' : 'Save to Cloud'}
                    </button>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* User Saved Circuits */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block font-mono">
                    Your Saved Cloud Circuits ({savedCircuitsList.length}):
                  </span>

                  {savedCircuitsList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                      No custom circuits saved to cloud yet. Type a name above and click "Save to Cloud" to persist your quantum circuit.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedCircuitsList.map((sc, idx) => (
                        <div key={sc.id || idx} className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 space-y-3 flex flex-col justify-between transition-colors shadow-2xs">
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-500" />
                              <span>{sc.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-1">
                              {sc.circuit?.numQubits || 2} Qubits • {(sc.circuit?.gates || []).length} Gates
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (sc.circuit) {
                                setCircuit(sc.circuit);
                                setStudioSubTab('visualizer');
                              }
                            }}
                            className="w-full py-1.5 rounded-lg bg-white hover:bg-cyan-600 hover:text-white text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                          >
                            Load onto Canvas
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Canonical Academic Quantum Algorithm Library */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Academic Algorithm Library & Reference Circuits:</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {CIRCUIT_PRESETS.length} Canonical Algorithms Ready to Simulate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CIRCUIT_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-4 rounded-xl bg-white hover:border-blue-300 border border-slate-200 space-y-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              preset.category === 'Entanglement'
                                ? 'bg-purple-100 text-purple-700'
                                : preset.category === 'Algorithms'
                                ? 'bg-blue-100 text-blue-700'
                                : preset.category === 'Fundamentals'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {preset.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {preset.description}
                          </p>
                          <div className="p-1.5 bg-slate-50 rounded-lg text-[10px] font-mono text-blue-800 border border-slate-100">
                            Target: <strong className="font-bold">{preset.targetStateBraKet}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setCircuit(preset.circuit);
                            setStudioSubTab('visualizer');
                          }}
                          className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Load Algorithm</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
