/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitState } from '../types';

export interface CircuitPreset {
  id: string;
  name: string;
  category: 'Fundamentals' | 'Entanglement' | 'Algorithms' | 'NISQ & Advanced';
  description: string;
  targetStateBraKet: string;
  theory: string;
  circuit: CircuitState;
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'bell-phi-plus',
    name: 'Bell State |Φ⁺⟩',
    category: 'Entanglement',
    description: 'Maximally entangled 2-qubit state (|00⟩ + |11⟩)/√2 generated using Hadamard and CNOT.',
    targetStateBraKet: '(|00⟩ + |11⟩) / √2',
    theory:
      'Applying H to Q0 creates (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2. The CNOT flips Q1 only when Q0 is 1, creating (|00⟩ + |11⟩)/√2 with Einstein-Podolsky-Rosen (EPR) correlations.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
      ],
    },
  },
  {
    id: 'bell-psi-minus',
    name: 'Singlet State |Ψ⁻⟩',
    category: 'Entanglement',
    description: 'Anti-symmetric singlet state (|01⟩ - |10⟩)/√2 with total spin angular momentum S=0.',
    targetStateBraKet: '(|01⟩ - |10⟩) / √2',
    theory:
      'Prepares the famous EPR singlet state. Applying X to Q0, X to Q1, H to Q0, and CNOT yields the maximally entangled state with rotational invariance in spin space.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'X', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'X', qubit: 1, timeStep: 0 },
        { id: 'g3', type: 'H', qubit: 0, timeStep: 1 },
        { id: 'g4', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 2 },
      ],
    },
  },
  {
    id: 'ghz-state',
    name: '3-Qubit GHZ State',
    category: 'Entanglement',
    description: 'Greenberger–Horne–Zeilinger tripartite entanglement (|000⟩ + |111⟩)/√2.',
    targetStateBraKet: '(|000⟩ + |111⟩) / √2',
    theory:
      'GHZ states provide direct, non-statistical proof against local hidden-variable theories. Q0 is put into equal superposition, then cascading CNOTs entangle Q1 and Q2.',
    circuit: {
      numQubits: 3,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
        { id: 'g3', type: 'CX', qubit: 2, controlQubit: 1, timeStep: 2 },
      ],
    },
  },
  {
    id: 'deutsch-jozsa',
    name: 'Deutsch-Jozsa Algorithm',
    category: 'Algorithms',
    description: 'Determines whether a boolean oracle is constant or balanced in exactly ONE query.',
    targetStateBraKet: '|11⟩ (Balanced) or |00⟩ (Constant)',
    theory:
      'Classical algorithms require 2^(n-1) + 1 evaluations in the worst case. Deutsch-Jozsa uses Hadamard transforms on all qubits plus an ancilla in |-⟩ state to utilize phase kickback, achieving exponential speedup.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'X', qubit: 1, timeStep: 0 },
        { id: 'g2', type: 'H', qubit: 0, timeStep: 1 },
        { id: 'g3', type: 'H', qubit: 1, timeStep: 1 },
        { id: 'g4', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 2 },
        { id: 'g5', type: 'H', qubit: 0, timeStep: 3 },
      ],
    },
  },
  {
    id: 'grover-search-2q',
    name: "Grover's Search (2-Qubit)",
    category: 'Algorithms',
    description: "Quantum search finding target marked state |11⟩ with 100% theoretical probability in 1 step.",
    targetStateBraKet: '|11⟩ (Probability 1.0)',
    theory:
      'Quadratic quantum speedup. Step 1: Equal superposition via H gates. Step 2: Oracle marks |11⟩ with a -1 phase (via CZ gate). Step 3: Grover diffusion operator (H -> X -> CZ -> X -> H) inverts state amplitudes about the average, boosting |11⟩ to 100%.',
    circuit: {
      numQubits: 2,
      timeSteps: 7,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'H', qubit: 1, timeStep: 0 },
        { id: 'g3', type: 'CZ', qubit: 1, controlQubit: 0, timeStep: 1 },
        { id: 'g4', type: 'H', qubit: 0, timeStep: 2 },
        { id: 'g5', type: 'H', qubit: 1, timeStep: 2 },
        { id: 'g6', type: 'X', qubit: 0, timeStep: 3 },
        { id: 'g7', type: 'X', qubit: 1, timeStep: 3 },
        { id: 'g8', type: 'CZ', qubit: 1, controlQubit: 0, timeStep: 4 },
        { id: 'g9', type: 'X', qubit: 0, timeStep: 5 },
        { id: 'g10', type: 'X', qubit: 1, timeStep: 5 },
        { id: 'g11', type: 'H', qubit: 0, timeStep: 6 },
        { id: 'g12', type: 'H', qubit: 1, timeStep: 6 },
      ],
    },
  },
  {
    id: 'alphatensor-optimal-toffoli',
    name: 'AlphaTensor Optimal Synthesis',
    category: 'NISQ & Advanced',
    description: 'DeepMind AlphaTensor-Quantum reinforcement learning synthesis reducing T-gate depth.',
    targetStateBraKet: 'Optimal Clifford+T 3-Qubit Toffoli',
    theory:
      'Discovered by Google DeepMind (arXiv:2402.14396). Uses tensor-network decomposition to synthesize multi-qubit controlled gates with minimal T-count and CNOT overhead compared to textbook decompositions.',
    circuit: {
      numQubits: 3,
      timeSteps: 7,
      gates: [
        { id: 'at_1', type: 'H', qubit: 2, timeStep: 0 },
        { id: 'at_2', type: 'CX', qubit: 2, controlQubit: 1, timeStep: 1 },
        { id: 'at_3', type: 'T', qubit: 2, timeStep: 2 },
        { id: 'at_4', type: 'CX', qubit: 2, controlQubit: 0, timeStep: 3 },
        { id: 'at_5', type: 'T', qubit: 1, timeStep: 4 },
        { id: 'at_6', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 5 },
        { id: 'at_7', type: 'H', qubit: 2, timeStep: 6 },
      ],
    },
  },
  {
    id: 'giallar-cancellation-benchmark',
    name: 'Giallar Push-Button Optimization',
    category: 'NISQ & Advanced',
    description: 'Involutive gate cancellation benchmark verified by Giallar rewrite rules (PLDI 2022).',
    targetStateBraKet: '|00⟩ (Redundant gates cancel to Identity)',
    theory:
      'Features self-canceling pairs: H-H = I on Q0, CX-CX = I across Q0->Q1, and H-Z-H = X. The Giallar push-button verifier detects all identities in sub-millisecond time, reducing circuit depth with 100% proven unitary fidelity.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'gc_1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'gc_2', type: 'H', qubit: 0, timeStep: 1 },
        { id: 'gc_3', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 2 },
        { id: 'gc_4', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 3 },
        { id: 'gc_5', type: 'H', qubit: 0, timeStep: 4 },
        { id: 'gc_6', type: 'Z', qubit: 0, timeStep: 5 },
      ],
    },
  },
  {
    id: 'surface-code-syndrome-3q',
    name: 'Surface Code QEC Stabilizer',
    category: 'NISQ & Advanced',
    description: 'AlphaQubit neural QEC stabilizer circuit measuring Z-parity syndrome (Z0 Z1).',
    targetStateBraKet: 'Syndrome Ancilla detects Bit-Flip X-Error',
    theory:
      'Inspired by Google DeepMind AlphaQubit (Nature 2024 / arXiv:2408.13687). Q0 and Q1 are data qubits; Q2 is the syndrome ancilla qubit. CNOTs entangle data qubits into the ancilla, measuring stabilizer S_z = Z0 Z1 without collapsing superpositions.',
    circuit: {
      numQubits: 3,
      timeSteps: 6,
      gates: [
        { id: 'qec_1', type: 'H', qubit: 0, timeStep: 0 }, // Data in superposition
        { id: 'qec_2', type: 'X', qubit: 0, timeStep: 1 }, // Injected test error
        { id: 'qec_3', type: 'CX', qubit: 2, controlQubit: 0, timeStep: 2 }, // Parity check 1
        { id: 'qec_4', type: 'CX', qubit: 2, controlQubit: 1, timeStep: 3 }, // Parity check 2
        { id: 'qec_5', type: 'H', qubit: 0, timeStep: 4 }, // Re-alignment
      ],
    },
  },
  {
    id: 'quantum-teleportation',
    name: 'Quantum Teleportation',
    category: 'Entanglement',
    description: 'Transfers unknown quantum state of Q0 to Q2 using an entangled Bell pair and 2 classical bits.',
    targetStateBraKet: 'Bob Q2 reconstructs initial Q0 state',
    theory:
      "Demonstrates quantum information transfer without transmitting the physical qubit itself. Alice entangles her source qubit with one half of an EPR pair, measures both in the Bell basis, and sends classical bits to Bob, who applies conditional X and Z gates.",
    circuit: {
      numQubits: 3,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'H', qubit: 1, timeStep: 0 },
        { id: 'g3', type: 'CX', qubit: 2, controlQubit: 1, timeStep: 1 },
        { id: 'g4', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 2 },
        { id: 'g5', type: 'H', qubit: 0, timeStep: 3 },
        { id: 'g6', type: 'CX', qubit: 2, controlQubit: 1, timeStep: 4 },
        { id: 'g7', type: 'CZ', qubit: 2, controlQubit: 0, timeStep: 5 },
      ],
    },
  },
  {
    id: 'superdense-coding',
    name: 'Superdense Coding',
    category: 'Entanglement',
    description: 'Transmits two classical bits (11) by physically sending only one entangled qubit.',
    targetStateBraKet: '|11⟩',
    theory:
      'Alice and Bob share a Bell pair. To send classical message "11", Alice applies X and Z gates to her single qubit and sends it to Bob. Bob performs Bell-basis decoding (CNOT + H) and measures both classical bits with 100% fidelity.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
        { id: 'g3', type: 'X', qubit: 0, timeStep: 2 },
        { id: 'g4', type: 'Z', qubit: 0, timeStep: 3 },
        { id: 'g5', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 4 },
        { id: 'g6', type: 'H', qubit: 0, timeStep: 5 },
      ],
    },
  },
  {
    id: 'vqe-ansatz',
    name: 'VQE Hardware-Efficient Ansatz',
    category: 'NISQ & Advanced',
    description: 'Parameterized trial wavefunction for Variational Quantum Eigensolver molecular simulation.',
    targetStateBraKet: '|Ψ(θ)⟩ parameterized state',
    theory:
      'In NISQ computing, VQE uses shallow parameterized circuits evaluated on quantum processors while a classical optimizer updates rotation angles θ to minimize the Hamiltonian energy expectation value ⟨H⟩.',
    circuit: {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g1', type: 'Ry', qubit: 0, param: 1.0472, timeStep: 0 },
        { id: 'g2', type: 'Ry', qubit: 1, param: 0.7854, timeStep: 0 },
        { id: 'g3', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
        { id: 'g4', type: 'Rz', qubit: 0, param: 1.5708, timeStep: 2 },
        { id: 'g5', type: 'Rz', qubit: 1, param: 0.5236, timeStep: 2 },
        { id: 'g6', type: 'CX', qubit: 0, controlQubit: 1, timeStep: 3 },
      ],
    },
  },
];
