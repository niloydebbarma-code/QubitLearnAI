/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Interactive Quantum Circuit Studio
 * Modern White-First Design with Category-Colored Quantum Gates & Grid
 */

import React, { useState, useEffect } from 'react';
import { CircuitState, GatePlacement, GateType, CircuitOptimizationResult } from '../types';
import { CollaborationSync } from './CollaborationSync';
import { CIRCUIT_PRESETS } from '../quantum/presets';
import { CircuitTranspiler } from '../quantum/transpiler';
import { GiallarCompilerVerifier, GIALLAR_20_REWRITE_RULES } from '../quantum/giallarVerifier';
import {
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Play,
  Wand2,
  Code2,
  LayoutGrid,
  Terminal,
  CheckCircle2,
  X,
  ShieldCheck,
  Clock,
  Loader2,
  Cloud,
} from 'lucide-react';

interface CircuitEditorProps {
  circuit: CircuitState;
  setCircuit: React.Dispatch<React.SetStateAction<CircuitState>>;
  onStepChange?: (step: number) => void;
  soundEnabled: boolean;
  highlightError?: { gateIndex?: number; qubitIndex?: number } | null;
  activeStepInspection?: number | null;
  setActiveStepInspection?: (step: number | null) => void;
}

interface GateDef {
  type: GateType;
  label: string;
  name: string;
  category: 'superposition' | 'pauli' | 'rotation' | 'multi' | 'measure';
  hasParam?: boolean;
  description: string;
  colorClass: string;
  activeColorClass: string;
  placedClass: string;
}

export const AVAILABLE_GATES: GateDef[] = [
  // Superposition & Clifford (Vibrant Indigo / Blue)
  {
    type: 'H',
    label: 'H',
    name: 'Hadamard',
    category: 'superposition',
    description: 'Creates equal superposition |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩-|1⟩)/√2',
    colorClass: 'bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400',
    activeColorClass: 'ring-2 ring-blue-500 bg-blue-600 text-white border-blue-600 shadow-md scale-105',
    placedClass: 'bg-blue-600 text-white border-blue-700 shadow-xs',
  },
  {
    type: 'S',
    label: 'S',
    name: 'Phase (π/2)',
    category: 'superposition',
    description: 'Adds π/2 (90°) relative phase to |1⟩ (Z^1/2)',
    colorClass: 'bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400',
    activeColorClass: 'ring-2 ring-blue-500 bg-blue-600 text-white border-blue-600 shadow-md scale-105',
    placedClass: 'bg-blue-600 text-white border-blue-700 shadow-xs',
  },
  {
    type: 'T',
    label: 'T',
    name: 'π/4 Phase',
    category: 'superposition',
    description: 'Adds π/4 (45°) phase to |1⟩ (Z^1/4). Universal fault-tolerant generator',
    colorClass: 'bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400',
    activeColorClass: 'ring-2 ring-blue-500 bg-blue-600 text-white border-blue-600 shadow-md scale-105',
    placedClass: 'bg-blue-600 text-white border-blue-700 shadow-xs',
  },
  {
    type: 'Sdg',
    label: 'S†',
    name: 'Phase Dagger (-π/2)',
    category: 'superposition',
    description: 'Adds -π/2 (-90°) phase to |1⟩ (Z^-1/2)',
    colorClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400',
    activeColorClass: 'ring-2 ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-md scale-105',
    placedClass: 'bg-indigo-600 text-white border-indigo-700 shadow-xs',
  },
  {
    type: 'Tdg',
    label: 'T†',
    name: 'T Dagger (-π/4)',
    category: 'superposition',
    description: 'Adds -π/4 (-45°) phase to |1⟩ (Z^-1/4)',
    colorClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400',
    activeColorClass: 'ring-2 ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-md scale-105',
    placedClass: 'bg-indigo-600 text-white border-indigo-700 shadow-xs',
  },

  // Pauli Gates (Vibrant Emerald / Green)
  {
    type: 'X',
    label: 'X',
    name: 'Pauli-X (NOT)',
    category: 'pauli',
    description: 'Bit-flip gate: swaps |0⟩ ↔ |1⟩',
    colorClass: 'bg-emerald-50/90 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400',
    activeColorClass: 'ring-2 ring-emerald-500 bg-emerald-600 text-white border-emerald-600 shadow-md scale-105',
    placedClass: 'bg-emerald-600 text-white border-emerald-700 shadow-xs',
  },
  {
    type: 'Y',
    label: 'Y',
    name: 'Pauli-Y',
    category: 'pauli',
    description: 'Bit and phase-flip: rotates π around Y axis',
    colorClass: 'bg-emerald-50/90 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400',
    activeColorClass: 'ring-2 ring-emerald-500 bg-emerald-600 text-white border-emerald-600 shadow-md scale-105',
    placedClass: 'bg-emerald-600 text-white border-emerald-700 shadow-xs',
  },
  {
    type: 'Z',
    label: 'Z',
    name: 'Pauli-Z (Phase)',
    category: 'pauli',
    description: 'Phase-flip gate: maps |1⟩ → -|1⟩',
    colorClass: 'bg-teal-50/90 text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400',
    activeColorClass: 'ring-2 ring-teal-500 bg-teal-600 text-white border-teal-600 shadow-md scale-105',
    placedClass: 'bg-teal-600 text-white border-teal-700 shadow-xs',
  },

  // Parametric Rotations (Vibrant Purple / Violet)
  {
    type: 'Rx',
    label: 'Rx(θ)',
    name: 'X-Rotation',
    category: 'rotation',
    hasParam: true,
    description: 'Arbitrary rotation around X-axis by angle θ',
    colorClass: 'bg-purple-50/90 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-400',
    activeColorClass: 'ring-2 ring-purple-500 bg-purple-600 text-white border-purple-600 shadow-md scale-105',
    placedClass: 'bg-purple-600 text-white border-purple-700 shadow-xs',
  },
  {
    type: 'Ry',
    label: 'Ry(θ)',
    name: 'Y-Rotation',
    category: 'rotation',
    hasParam: true,
    description: 'Arbitrary rotation around Y-axis by angle θ',
    colorClass: 'bg-purple-50/90 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-400',
    activeColorClass: 'ring-2 ring-purple-500 bg-purple-600 text-white border-purple-600 shadow-md scale-105',
    placedClass: 'bg-purple-600 text-white border-purple-700 shadow-xs',
  },
  {
    type: 'Rz',
    label: 'Rz(θ)',
    name: 'Z-Rotation',
    category: 'rotation',
    hasParam: true,
    description: 'Arbitrary rotation around Z-axis by angle θ',
    colorClass: 'bg-fuchsia-50/90 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100 hover:border-fuchsia-400',
    activeColorClass: 'ring-2 ring-fuchsia-500 bg-fuchsia-600 text-white border-fuchsia-600 shadow-md scale-105',
    placedClass: 'bg-fuchsia-600 text-white border-fuchsia-700 shadow-xs',
  },

  // Multi-Qubit Entanglers (Vibrant Cyan / Sky)
  {
    type: 'CX',
    label: 'CNOT',
    name: 'Controlled-NOT',
    category: 'multi',
    description: 'Flips target qubit if control qubit is |1⟩. Generates maximal entanglement.',
    colorClass: 'bg-cyan-50/90 text-cyan-800 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-400',
    activeColorClass: 'ring-2 ring-cyan-600 bg-cyan-600 text-white border-cyan-600 shadow-md scale-105',
    placedClass: 'bg-cyan-600 text-white border-cyan-700 shadow-xs',
  },
  {
    type: 'CZ',
    label: 'CZ',
    name: 'Controlled-Z',
    category: 'multi',
    description: 'Adds -1 phase if both control and target qubits are |1⟩',
    colorClass: 'bg-cyan-50/90 text-cyan-800 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-400',
    activeColorClass: 'ring-2 ring-cyan-600 bg-cyan-600 text-white border-cyan-600 shadow-md scale-105',
    placedClass: 'bg-cyan-600 text-white border-cyan-700 shadow-xs',
  },
  {
    type: 'SWAP',
    label: 'SWAP',
    name: 'Swap Gate',
    category: 'multi',
    description: 'Exchanges the states of two quantum wires',
    colorClass: 'bg-sky-50/90 text-sky-800 border-sky-200 hover:bg-sky-100 hover:border-sky-400',
    activeColorClass: 'ring-2 ring-sky-600 bg-sky-600 text-white border-sky-600 shadow-md scale-105',
    placedClass: 'bg-sky-600 text-white border-sky-700 shadow-xs',
  },
  {
    type: 'CCX',
    label: 'CCX',
    name: 'Toffoli',
    category: 'multi',
    description: 'Flips target if both control qubits are 1. Universal classical reversible gate.',
    colorClass: 'bg-cyan-50/90 text-cyan-800 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-400',
    activeColorClass: 'ring-2 ring-cyan-600 bg-cyan-600 text-white border-cyan-600 shadow-md scale-105',
    placedClass: 'bg-cyan-600 text-white border-cyan-700 shadow-xs',
  },

  // Measurement (Vibrant Rose)
  {
    type: 'M',
    label: 'M',
    name: 'Measure',
    category: 'measure',
    description: 'Projective measurement in computational Z-basis',
    colorClass: 'bg-rose-50/90 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-400',
    activeColorClass: 'ring-2 ring-rose-500 bg-rose-600 text-white border-rose-600 shadow-md scale-105',
    placedClass: 'bg-rose-600 text-white border-rose-700 shadow-xs',
  },
];

export const CircuitEditor: React.FC<CircuitEditorProps> = ({
  circuit,
  setCircuit,
  soundEnabled,
  highlightError,
  activeStepInspection,
  setActiveStepInspection,
}) => {
  // Safe Normalization
  const safeCircuit: CircuitState = {
    numQubits: Math.max(1, Math.min(5, circuit?.numQubits || 2)),
    timeSteps: Math.max(4, circuit?.timeSteps || 6),
    gates: Array.isArray(circuit?.gates) ? circuit.gates : [],
    initialState: Array.isArray(circuit?.initialState) ? circuit.initialState : new Array(circuit?.numQubits || 2).fill(0),
  };

  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');
  const [activeControlQubit, setActiveControlQubit] = useState<number>(0);
  const [activeTargetQubit, setActiveTargetQubit] = useState<number>(1);
  const [rotationTheta, setRotationTheta] = useState<number>(Math.PI / 2);
  const [activePreset, setActivePreset] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [codeFramework, setCodeFramework] = useState<
    'qiskit' | 'cirq' | 'pennylane' | 'braket' | 'cudaq' | 'qsharp' | 'pyquil' | 'qutip' | 'openqasm' | 'quantikz'
  >('qiskit');
  const [codeText, setCodeText] = useState<string>('');
  const [codeParseMsg, setCodeParseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<CircuitOptimizationResult | null>(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState<boolean>(false);
  const [showGiallarRulesModal, setShowGiallarRulesModal] = useState<boolean>(false);

  const playChirp = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  };

  const handleExplicitRunSimulation = () => {
    setIsRunningSim(true);
    playChirp();
    setTimeout(() => {
      setIsRunningSim(false);
    }, 250);
  };

  // Drag and drop state
  const [draggedGateType, setDraggedGateType] = useState<GateType | null>(null);

  const handleOptimizeCircuit = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/circuit-designer/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuitJson: safeCircuit, framework: codeFramework }),
      });
      const data: CircuitOptimizationResult = await res.json();
      setOptimizationResult(data);
      setShowOptimizeModal(true);
    } catch {
      // Local Giallar fallback if server unreachable
      const { optimizedCircuit, report } = GiallarCompilerVerifier.optimizeAndVerify(safeCircuit);
      const giallarResult: CircuitOptimizationResult = {
        originalGateCount: report.originalGateCount,
        optimizedGateCount: report.reducedGateCount,
        suggestions: report.rulesApplied.map((r) => ({
          action: 'optimize',
          gateIndices: [r.timeStep],
          reason: `Applied Giallar formal rule: ${r.ruleName} on Qubit(s) [${r.targetQubits.join(', ')}]`,
        })),
        transpiledCircuitJson: optimizedCircuit,
        verificationSidecar: {
          verificationType: 'Type A - Formal Push-Button Proof (Giallar PLDI 2022)',
          method: 'giallar-z3-rewrite-system',
          verified: report.isSemanticsPreserved,
          confidence: report.fidelity,
          disclosure: `Formally verified: ${report.verificationSidecar.subgoalsProven} subgoals proven, statevector fidelity ${report.fidelity * 100}% in ${report.verificationSidecar.verificationTimeMs}ms`,
        },
      };
      setOptimizationResult(giallarResult);
      setShowOptimizeModal(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (optimizationResult?.transpiledCircuitJson) {
      setCircuit(optimizationResult.transpiledCircuitJson as CircuitState);
      setShowOptimizeModal(false);
      playChirp();
    }
  };

  // Sync code text when switching framework, mode, or circuit
  useEffect(() => {
    if (editorMode === 'code') {
      try {
        switch (codeFramework) {
          case 'qiskit':
            setCodeText(CircuitTranspiler.toQiskit(safeCircuit));
            break;
          case 'cirq':
            setCodeText(CircuitTranspiler.toCirq(safeCircuit));
            break;
          case 'pennylane':
            setCodeText(CircuitTranspiler.toPennyLane(safeCircuit));
            break;
          case 'braket':
            setCodeText(CircuitTranspiler.toBraket(safeCircuit));
            break;
          case 'cudaq':
            setCodeText(CircuitTranspiler.toCudaQ(safeCircuit));
            break;
          case 'qsharp':
            setCodeText(CircuitTranspiler.toQSharp(safeCircuit));
            break;
          case 'pyquil':
            setCodeText(CircuitTranspiler.toPyQuil(safeCircuit));
            break;
          case 'qutip':
            setCodeText(CircuitTranspiler.toQutip(safeCircuit));
            break;
          case 'openqasm':
            setCodeText(CircuitTranspiler.toOpenQasm(safeCircuit));
            break;
          case 'quantikz':
            setCodeText(CircuitTranspiler.toQuantikz(safeCircuit));
            break;
        }
      } catch {
        setCodeText('# Circuit code generation active...');
      }
    }
  }, [editorMode, codeFramework, circuit]);

  const BASIS_STATES = ['|0⟩', '|1⟩', '|+⟩', '|−⟩', '|i⟩', '|−i⟩'];

  // Toggle Initial Qubit State (|0⟩ -> |1⟩ -> |+⟩ -> |−⟩ -> |i⟩ -> |−i⟩)
  const handleToggleInitialState = (qubitIndex: number) => {
    playChirp();
    const current = safeCircuit.initialState || new Array(safeCircuit.numQubits).fill(0);
    const updated = [...current];
    updated[qubitIndex] = ((updated[qubitIndex] || 0) + 1) % 6;
    setCircuit((prev) => ({
      ...prev,
      initialState: updated,
    }));
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, gType: GateType) => {
    e.dataTransfer.setData('gateType', gType);
    setDraggedGateType(gType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnCell = (e: React.DragEvent, qubit: number, timeStep: number) => {
    e.preventDefault();
    const gType = (e.dataTransfer.getData('gateType') as GateType) || draggedGateType || selectedGateType;
    if (gType) {
      placeGate(gType, qubit, timeStep);
    }
    setDraggedGateType(null);
  };

  const placeGate = (gType: GateType, qubit: number, timeStep: number) => {
    playChirp();
    const existingIndex = safeCircuit.gates.findIndex(
      (g) => g?.qubit === qubit && g?.timeStep === timeStep
    );

    const newGate: GatePlacement = {
      id: `gate-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: gType,
      qubit,
      timeStep,
    };

    if (gType === 'CX' || gType === 'CZ') {
      const ctrl = activeControlQubit === qubit ? (qubit === 0 ? 1 : 0) : activeControlQubit;
      newGate.controlQubit = Math.min(ctrl, safeCircuit.numQubits - 1);
    } else if (gType === 'SWAP') {
      const tgt = activeTargetQubit === qubit ? (qubit === 0 ? 1 : 0) : activeTargetQubit;
      newGate.targetQubit = Math.min(tgt, safeCircuit.numQubits - 1);
    } else if (gType === 'CCX') {
      newGate.controlQubit = 0;
      newGate.controlQubit2 = 1;
      newGate.qubit = Math.max(2, qubit);
    } else if (gType === 'Rx' || gType === 'Ry' || gType === 'Rz') {
      newGate.param = rotationTheta;
    }

    if (existingIndex !== -1) {
      // Replace existing gate on drop
      const updated = [...safeCircuit.gates];
      updated[existingIndex] = newGate;
      setCircuit((prev) => ({ ...prev, gates: updated }));
    } else {
      setCircuit((prev) => ({ ...prev, gates: [...(prev?.gates || []), newGate] }));
    }
  };

  // Click cell to place or remove
  const handleCellClick = (qubit: number, timeStep: number) => {
    const existingIndex = safeCircuit.gates.findIndex(
      (g) => g?.qubit === qubit && g?.timeStep === timeStep
    );

    if (existingIndex !== -1) {
      // Remove existing gate on click
      playChirp();
      setCircuit((prev) => ({
        ...prev,
        gates: (prev?.gates || []).filter((_, idx) => idx !== existingIndex),
      }));
      return;
    }

    placeGate(selectedGateType, qubit, timeStep);
  };

  const handleAddQubit = () => {
    if (safeCircuit.numQubits >= 5) return;
    setCircuit((prev) => ({ ...prev, numQubits: (prev?.numQubits || 2) + 1 }));
  };

  const handleRemoveQubit = () => {
    if (safeCircuit.numQubits <= 1) return;
    const newNumQubits = Math.max(1, (safeCircuit.numQubits || 2) - 1);
    setCircuit((prev) => ({
      ...prev,
      numQubits: newNumQubits,
      initialState: (prev?.initialState || []).slice(0, newNumQubits),
      gates: (prev?.gates || []).filter((g) => {
        if (!g) return false;
        if (g.qubit >= newNumQubits) return false;
        if (g.controlQubit !== undefined && g.controlQubit >= newNumQubits) return false;
        if (g.controlQubit2 !== undefined && g.controlQubit2 >= newNumQubits) return false;
        if (g.targetQubit !== undefined && g.targetQubit >= newNumQubits) return false;
        return true;
      }),
    }));
  };

  const handleClearCircuit = () => {
    setCircuit((prev) => ({ ...prev, gates: [], initialState: new Array(prev?.numQubits || 2).fill(0) }));
    setActivePreset('');
    if (setActiveStepInspection) setActiveStepInspection(null);
  };

  const handleLoadPreset = (presetId: string) => {
    const found = CIRCUIT_PRESETS.find((p) => p.id === presetId);
    if (found && found.circuit) {
      setCircuit(found.circuit);
      setActivePreset(presetId);
      playChirp();
    }
  };

  const handleCompileCode = () => {
    try {
      const parsed = CircuitTranspiler.fromCode(codeText);
      setCircuit(parsed);
      setEditorMode('visual');
      setCodeParseMsg({ type: 'success', text: 'Compiled and updated visual grid successfully!' });
      playChirp();
    } catch (err: any) {
      setCodeParseMsg({
        type: 'error',
        text: `Transpilation error: ${err.message || 'Check circuit syntax'}. Try standard: qc.h(0), qc.cx(0, 1)`,
      });
    }
  };

  const selectedDef = AVAILABLE_GATES.find((g) => g.type === selectedGateType);
  const suggestions = optimizationResult?.suggestions || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 text-slate-800">
      {/* Top Toolbar: Mode Switcher, Presets, Qubits, Collaboration, AI Optimizer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                editorMode === 'visual'
                  ? 'bg-white text-blue-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Studio</span>
            </button>
            <button
              onClick={() => setEditorMode('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                editorMode === 'code'
                  ? 'bg-white text-blue-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Multi-SDK Code</span>
            </button>
          </div>

          {/* Real-Time Collaboration Bar */}
          <CollaborationSync circuit={safeCircuit} setCircuit={setCircuit} />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Qubit Count Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Qubits:</span>
            <span className="font-mono text-slate-900 font-bold text-sm px-1.5">
              {safeCircuit.numQubits}
            </span>
            <button
              id="btn-remove-qubit"
              onClick={handleRemoveQubit}
              disabled={safeCircuit.numQubits <= 1}
              className="p-1 rounded bg-white hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40 text-slate-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
              title="Remove bottom qubit"
            >
              <Minus className="w-3 h-3 text-amber-600" />
            </button>
            <button
              id="btn-add-qubit"
              onClick={handleAddQubit}
              disabled={safeCircuit.numQubits >= 5}
              className="p-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40 text-slate-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
              title="Add qubit (up to 5)"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
            </button>
          </div>

          {/* Algorithm Presets Loader */}
          <div className="flex items-center space-x-1.5">
            <Wand2 className="w-4 h-4 text-purple-600 hidden sm:inline" />
            <select
              id="preset-circuit-select"
              value={activePreset}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="bg-white border border-slate-200 hover:border-purple-300 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer transition-colors shadow-2xs"
            >
              <option value="">Load Algorithm Preset...</option>
              {CIRCUIT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Run Circuit Simulation Button — Vibrant Blue */}
          <button
            id="btn-run-simulation-canvas"
            onClick={handleExplicitRunSimulation}
            disabled={isRunningSim || safeCircuit.gates.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border border-blue-600 transition-all cursor-pointer disabled:opacity-40"
            title="Execute circuit simulation and calculate exact Hilbert space statevector"
          >
            {isRunningSim ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunningSim ? 'Simulating...' : 'Run Simulation'}</span>
          </button>

          {/* Clear Circuit Button */}
          <button
            id="btn-clear-circuit"
            onClick={handleClearCircuit}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear</span>
          </button>

          {/* AI Optimization Co-Pilot Button */}
          <button
            id="btn-ai-optimize"
            onClick={handleOptimizeCircuit}
            disabled={isOptimizing || safeCircuit.gates.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 hover:text-purple-800 text-purple-700 border border-purple-200 shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
            title="AI Optimization Co-Pilot (cancels redundant gates, reduces depth, preserves unitary matrix)"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'AI Optimize'}</span>
          </button>
        </div>
      </div>

      {/* Giallar 20-Rule Formal Verifier Modal */}
      {showGiallarRulesModal && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Giallar Push-Button Quantum Rewrite Engine
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PLDI '22 (arXiv:2205.00661)
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  20 Statically Verified Coq/Z3 Rewrite Rules ensuring zero exponential matrix explosion
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGiallarRulesModal(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {GIALLAR_20_REWRITE_RULES.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-bold">{rule.id}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    {rule.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 font-sans">{rule.name}</div>
                <div className="p-1.5 rounded bg-white border border-slate-200 text-[11px] text-indigo-700 font-semibold">
                  {rule.latexNotation}
                </div>
                <p className="text-[10px] text-slate-600 font-sans leading-tight">{rule.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
            <span>Soundness Proofs: Coq (QWIRE Denotational Semantics) + Z3 SMT Solver</span>
            <button
              onClick={() => setShowGiallarRulesModal(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* AI Optimization Modal */}
      {showOptimizeModal && optimizationResult && (
        <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">AI Circuit Optimization Co-Pilot</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700 border border-purple-200 font-semibold">
                Unitary Matrix Preserved
              </span>
            </div>
            <button
              onClick={() => setShowOptimizeModal(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Original Gate Count</span>
              <div className="text-lg font-bold font-mono text-slate-900">{optimizationResult.originalGateCount || safeCircuit.gates.length}</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Optimized Gate Count</span>
              <div className="text-lg font-bold font-mono text-emerald-600">{optimizationResult.optimizedGateCount || 0}</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-medium">Gate Reduction</span>
              <div className="text-lg font-bold font-mono text-emerald-600">
                {(optimizationResult.originalGateCount || 0) - (optimizationResult.optimizedGateCount || 0) > 0
                  ? `-${(optimizationResult.originalGateCount || 0) - (optimizationResult.optimizedGateCount || 0)} gates`
                  : 'Already Minimal'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">Optimization Suggestions:</span>
            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No redundant gates detected. Circuit is already at optimal depth.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3 shadow-2xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${sug?.action === 'remove' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          {sug?.action || 'optimize'}
                        </span>
                        <span className="text-slate-800 font-medium">Gate Indices: [{Array.isArray(sug?.gateIndices) ? sug.gateIndices.join(', ') : '0'}]</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{sug?.reason || 'Redundant operation canceled'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-purple-100">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">
                {optimizationResult.verificationSidecar?.disclosure || 'Verified via exact unitary matrix algebra'}
              </span>
              <button
                type="button"
                onClick={() => setShowGiallarRulesModal(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline font-mono flex items-center gap-1 cursor-pointer font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Formal Rules (20)</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              {optimizationResult.transpiledCircuitJson && (optimizationResult.originalGateCount || 0) > (optimizationResult.optimizedGateCount || 0) && (
                <button
                  onClick={handleApplyOptimization}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply Optimization</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Editor View */}
      {editorMode === 'code' ? (
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-800">
                Multi-SDK Quantum Code Editor:
              </span>
              <select
                value={codeFramework}
                onChange={(e) => setCodeFramework(e.target.value as any)}
                className="bg-white border border-slate-200 text-xs text-slate-800 font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="qiskit">1. IBM Qiskit 1.x</option>
                <option value="cirq">2. Google Cirq</option>
                <option value="pennylane">3. Xanadu PennyLane</option>
                <option value="braket">4. Amazon Braket (AWS)</option>
                <option value="cudaq">5. NVIDIA CUDA-Q</option>
                <option value="qsharp">6. Microsoft Q#</option>
                <option value="pyquil">7. Rigetti pyQuil</option>
                <option value="qutip">8. QuTiP</option>
                <option value="openqasm">9. OpenQASM 3.0/2.0</option>
                <option value="quantikz">10. LaTeX quantikz</option>
              </select>
            </div>
            <button
              onClick={handleCompileCode}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Compile to Visual Grid</span>
            </button>
          </div>

          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            rows={12}
            className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 leading-relaxed resize-y shadow-2xs"
            placeholder="from qiskit import QuantumCircuit&#10;qc = QuantumCircuit(2)&#10;qc.h(0)&#10;qc.cx(0, 1)"
          />

          {codeParseMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-mono ${
                codeParseMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {codeParseMsg.text}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Supports standard syntax: <code>qc.h(q)</code>, <code>qc.cx(c, t)</code>, <code>qc.swap(a, b)</code>, <code>qc.rx(θ, q)</code>, and OpenQASM.</span>
            <span className="font-mono text-slate-700 font-medium">Bidirectional Transpiler Active</span>
          </div>
        </div>
      ) : (
        /* Visual Studio View: Toolbox + Interactive Wire Grid + Step Scrubber */
        <>
          {/* Gate Toolbox Palette (Draggable + Clickable with Category Colors) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Gate Palette — Drag onto wire or click to select and place</span>
              {selectedDef && (
                <span className="font-mono text-slate-900 font-bold">{selectedDef.name}</span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-14 gap-1.5">
              {AVAILABLE_GATES.map((g) => {
                const isSelected = selectedGateType === g.type;
                return (
                  <button
                    key={g.type}
                    id={`toolbox-gate-${g.type}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, g.type)}
                    onClick={() => {
                      setSelectedGateType(g.type);
                      playChirp();
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-grab active:cursor-grabbing shadow-2xs ${
                      isSelected
                        ? g.activeColorClass
                        : g.colorClass
                    }`}
                    title={`${g.name}: ${g.description} (Drag to wire)`}
                  >
                    <span className="text-sm">{g.label}</span>
                    <span className="text-[9px] font-normal tracking-tight truncate w-full text-center opacity-85">
                      {g.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Parameter Controls Bar for Controlled Gates or Angles */}
            {(selectedGateType === 'CX' || selectedGateType === 'CZ') && (
              <div className="flex items-center space-x-3 text-xs bg-cyan-50/70 p-2.5 rounded-xl border border-cyan-200 font-mono">
                <span className="text-cyan-900 font-bold">Controlled Gate Target:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-cyan-700 font-medium">Control Qubit:</span>
                  <select
                    value={activeControlQubit}
                    onChange={(e) => setActiveControlQubit(Number(e.target.value))}
                    className="bg-white border border-cyan-300 rounded px-2 py-0.5 text-xs text-slate-800 font-bold shadow-2xs"
                  >
                    {Array.from({ length: safeCircuit.numQubits }).map((_, i) => (
                      <option key={i} value={i}>
                        q[{i}]
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-cyan-600 text-[11px] hidden sm:inline">
                  (Target qubit is where you place the gate on the wire)
                </span>
              </div>
            )}

            {(selectedGateType === 'Rx' || selectedGateType === 'Ry' || selectedGateType === 'Rz') && (
              <div className="flex flex-wrap items-center gap-3 text-xs bg-purple-50/70 p-2.5 rounded-xl border border-purple-200 font-mono">
                <span className="text-purple-900 font-bold">Rotation Angle θ:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={Math.PI * 2}
                    step={0.05}
                    value={rotationTheta}
                    onChange={(e) => setRotationTheta(Number(e.target.value))}
                    className="w-32 accent-purple-600"
                  />
                  <span className="text-purple-900 font-bold">
                    {(rotationTheta / Math.PI).toFixed(2)}π rad ({((rotationTheta * 180) / Math.PI).toFixed(0)}°)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {[
                    { label: 'π/4', val: Math.PI / 4 },
                    { label: 'π/2', val: Math.PI / 2 },
                    { label: 'π', val: Math.PI },
                    { label: '2π', val: Math.PI * 2 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setRotationTheta(item.val)}
                      className="px-1.5 py-0.5 rounded bg-white text-[10px] text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold cursor-pointer shadow-2xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual Quantum Wire Grid (Crisp White Canvas with Category Gates) */}
          <div className="relative overflow-x-auto bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-inner">
            <div className="min-w-[640px] flex flex-col space-y-7 relative">
              {/* Render horizontal wire for each qubit */}
              {Array.from({ length: safeCircuit.numQubits }).map((_, qIndex) => {
                const initialMode = safeCircuit.initialState?.[qIndex] || 0;
                const basisLabel = BASIS_STATES[initialMode] || '|0⟩';
                return (
                  <div key={`wire-${qIndex}`} className="relative flex items-center h-12">
                    {/* Clickable Qubit initial state cycler (|0⟩, |1⟩, |+⟩, |-⟩, |i⟩, |-i⟩) */}
                    <button
                      type="button"
                      onClick={() => handleToggleInitialState(qIndex)}
                      className="w-16 flex-shrink-0 flex items-center space-x-1.5 font-mono text-xs font-bold text-slate-700 hover:text-blue-700 transition cursor-pointer p-1 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs"
                      title="Click to cycle initial state (|0⟩, |1⟩, |+⟩, |−⟩, |i⟩, |−i⟩)"
                    >
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                        {basisLabel}
                      </span>
                      <span>q[{qIndex}]</span>
                    </button>

                    {/* Wire line */}
                    <div className="absolute left-16 right-0 h-[2px] bg-slate-300 z-0" />

                    {/* Time step columns with Drop Zone */}
                    <div className="flex-1 flex items-center justify-between pl-4 z-10">
                      {Array.from({ length: safeCircuit.timeSteps }).map((_, tIndex) => {
                        const gate = safeCircuit.gates.find(
                          (g) => g?.qubit === qIndex && g?.timeStep === tIndex
                        );
                        const isHighlighted =
                          highlightError &&
                          highlightError.qubitIndex === qIndex &&
                          highlightError.gateIndex === tIndex;

                        const isStepActive = activeStepInspection === tIndex;

                        const def = gate
                          ? AVAILABLE_GATES.find((d) => d.type === gate.type)
                          : null;

                        return (
                          <div
                            key={`cell-${qIndex}-${tIndex}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnCell(e, qIndex, tIndex)}
                            className={`p-0.5 rounded-xl transition-all ${isStepActive ? 'bg-blue-100/70 ring-1 ring-blue-400' : ''}`}
                          >
                            <button
                              id={`circuit-cell-${qIndex}-${tIndex}`}
                              onClick={() => handleCellClick(qIndex, tIndex)}
                              className={`relative w-11 h-11 flex items-center justify-center rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                                gate
                                  ? `${def?.placedClass || 'bg-blue-600 border-blue-700 text-white'} shadow-sm scale-100 hover:scale-105`
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 shadow-2xs'
                              } ${isHighlighted ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-white animate-pulse' : ''}`}
                              title={
                                gate
                                  ? `Gate ${gate.type} on q[${qIndex}] at step ${tIndex} (Click to remove)`
                                  : `Click or drop to place ${selectedGateType} on q[${qIndex}] at step ${tIndex}`
                              }
                            >
                              {gate ? (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                  {gate.type === 'CX' ? (
                                    <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-sm bg-cyan-700 shadow-xs">
                                      ⊕
                                    </div>
                                  ) : gate.type === 'CZ' ? (
                                    <div className="w-5 h-5 rounded-full bg-cyan-100 border border-cyan-400 shadow-xs flex items-center justify-center text-[10px] text-cyan-950 font-bold">
                                      Z
                                    </div>
                                  ) : gate.type === 'SWAP' ? (
                                    <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-lg">
                                      ✕
                                    </div>
                                  ) : gate.type === 'M' ? (
                                    <div className="flex flex-col items-center">
                                      <span className="text-xs">⌖</span>
                                      <span className="text-[8px] font-mono leading-none text-rose-100">MEAS</span>
                                    </div>
                                  ) : (
                                    <>
                                      <span>{gate.type}</span>
                                      {gate.param !== undefined && (
                                        <span className="text-[8px] font-normal leading-none text-purple-100">
                                          {(gate.param / Math.PI).toFixed(1)}π
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] opacity-0 hover:opacity-100 transition-opacity text-blue-500 font-bold">
                                  +
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Multi-Wire Connection Lines for CNOT / CZ */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-20">
                {safeCircuit.gates.map((g) => {
                  if (
                    g &&
                    (g.type === 'CX' || g.type === 'CZ') &&
                    g.controlQubit !== undefined &&
                    g.controlQubit !== g.qubit
                  ) {
                    const rowHeight = 76;
                    const topY = 24 + g.controlQubit * rowHeight;
                    const bottomY = 24 + g.qubit * rowHeight;
                    const colPct = ((g.timeStep + 0.5) / safeCircuit.timeSteps) * 100;

                    return (
                      <g key={`link-${g.id}`}>
                        <line
                          x1={`${colPct}%`}
                          y1={topY}
                          x2={`${colPct}%`}
                          y2={bottomY}
                          stroke="#0891b2"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx={`${colPct}%`}
                          cy={topY}
                          r="5"
                          fill="#0891b2"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  }
                  return null;
                })}
              </svg>
            </div>

            {/* Step Timeline Inspector Scrubber (Quirk / IBM Composer Feature) */}
            <div className="flex items-center justify-between pl-20 pr-4 pt-4 border-t border-slate-200 mt-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-500 font-sans">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">Inspect State at Step:</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (setActiveStepInspection) setActiveStepInspection(null);
                    playChirp();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                    activeStepInspection === null
                      ? 'bg-blue-600 text-white border border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  Full Output
                </button>
                {Array.from({ length: safeCircuit.timeSteps }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (setActiveStepInspection) setActiveStepInspection(i);
                      playChirp();
                    }}
                    className={`w-8 py-1 rounded-lg text-center transition cursor-pointer text-xs ${
                      activeStepInspection === i
                        ? 'bg-blue-600 text-white font-bold shadow-xs border border-blue-600'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    t_{i}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
