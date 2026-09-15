/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodingChallenge } from '../types';

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'ch-1-hadamard-plus',
    title: 'Challenge 1: Create Superposition |+⟩',
    difficulty: 'Easy',
    description: 'Place Qubit 0 into an equal superposition state with zero relative phase: |+⟩ = (|0⟩ + |1⟩)/√2.',
    targetGoal: 'Statevector |ψ⟩ = 1/√2|0⟩ + 1/√2|1⟩ with P(0)=50% and P(1)=50%.',
    numQubits: 1,
    expectedStateDescription: '0.7071|0⟩ + 0.7071|1⟩',
    hint: 'Apply a single Hadamard (H) gate to Qubit 0.',
    testCondition: (result) => {
      const p0 = result.probabilities['0'] || 0;
      const p1 = result.probabilities['1'] || 0;
      const sv = result.statevector;
      const closeAmp = Math.abs((sv[0]?.amplitude.re || 0) - 1 / Math.SQRT2) < 0.05;
      if (Math.abs(p0 - 0.5) < 0.05 && Math.abs(p1 - 0.5) < 0.05 && closeAmp) {
        return { passed: true, message: 'Correct! Qubit 0 is now in the |+⟩ equal superposition state.' };
      }
      return {
        passed: false,
        message: `Current probabilities P(0)=${(p0 * 100).toFixed(1)}%, P(1)=${(p1 * 100).toFixed(1)}%. Target is 50% / 50% with equal positive amplitude.`,
      };
    },
  },
  {
    id: 'ch-2-bell-state',
    title: 'Challenge 2: Generate Bell State |Φ⁺⟩',
    difficulty: 'Easy',
    description: 'Entangle 2 qubits into the maximally entangled Bell pair: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.',
    targetGoal: '50% probability of |00⟩ and 50% probability of |11⟩, with zero probability for |01⟩ and |10⟩.',
    numQubits: 2,
    expectedStateDescription: '0.7071|00⟩ + 0.7071|11⟩',
    hint: 'Apply a Hadamard gate on Qubit 0, followed by a CNOT gate with control Qubit 0 and target Qubit 1.',
    testCondition: (result) => {
      const p00 = result.probabilities['00'] || 0;
      const p11 = result.probabilities['11'] || 0;
      const p01 = result.probabilities['01'] || 0;
      const p10 = result.probabilities['10'] || 0;
      if (Math.abs(p00 - 0.5) < 0.05 && Math.abs(p11 - 0.5) < 0.05 && p01 < 0.01 && p10 < 0.01) {
        return { passed: true, message: 'Outstanding! You successfully created the EPR Bell pair |Φ⁺⟩.' };
      }
      return {
        passed: false,
        message: `Detected probabilities: P(00)=${(p00 * 100).toFixed(0)}%, P(11)=${(p11 * 100).toFixed(0)}%, P(01+10)=${((p01 + p10) * 100).toFixed(0)}%.`,
      };
    },
  },
  {
    id: 'ch-3-phase-flip-minus',
    title: 'Challenge 3: Prepare the |−⟩ State',
    difficulty: 'Easy',
    description: 'Transform |0⟩ into the anti-phase superposition state: |−⟩ = (|0⟩ − |1⟩)/√2.',
    targetGoal: 'Amplitudes α = +1/√2 and β = -1/√2.',
    numQubits: 1,
    expectedStateDescription: '0.7071|0⟩ - 0.7071|1⟩',
    hint: 'Try applying an X gate first to reach |1⟩, then an H gate, or apply H followed by Z.',
    testCondition: (result) => {
      const sv = result.statevector;
      const re0 = sv[0]?.amplitude.re || 0;
      const re1 = sv[1]?.amplitude.re || 0;
      if (Math.abs(re0 - 1 / Math.SQRT2) < 0.05 && Math.abs(re1 - -1 / Math.SQRT2) < 0.05) {
        return { passed: true, message: 'Perfect! The state has a relative phase of π radians (180°).' };
      }
      return {
        passed: false,
        message: `Amplitude on |1⟩ is ${re1.toFixed(3)}. Target is negative (-0.707).`,
      };
    },
  },
  {
    id: 'ch-4-ghz-state',
    title: 'Challenge 4: 3-Qubit GHZ State',
    difficulty: 'Medium',
    description: 'Create the tripartite entangled Greenberger–Horne–Zeilinger state: (|000⟩ + |111⟩)/√2.',
    targetGoal: '50% probability of |000⟩ and 50% probability of |111⟩ across 3 qubits.',
    numQubits: 3,
    expectedStateDescription: '0.7071|000⟩ + 0.7071|111⟩',
    hint: 'Start with H on Q0, then CNOT from Q0 to Q1, then CNOT from Q1 to Q2.',
    testCondition: (result) => {
      const p000 = result.probabilities['000'] || 0;
      const p111 = result.probabilities['111'] || 0;
      const rest = 1 - (p000 + p111);
      if (Math.abs(p000 - 0.5) < 0.05 && Math.abs(p111 - 0.5) < 0.05 && rest < 0.02) {
        return { passed: true, message: 'Bravo! You generated the 3-qubit GHZ quantum entangled state.' };
      }
      return {
        passed: false,
        message: `Current P(000)=${(p000 * 100).toFixed(0)}%, P(111)=${(p111 * 100).toFixed(0)}%. Other outcomes: ${(rest * 100).toFixed(0)}%.`,
      };
    },
  },
  {
    id: 'ch-5-swap-circuit',
    title: 'Challenge 5: Swap without SWAP Gate',
    difficulty: 'Medium',
    description: 'Swap the states of Qubit 0 and Qubit 1 using ONLY three CNOT gates (no SWAP gate permitted).',
    targetGoal: 'If Q0=1, state becomes |01⟩. If Q1=1, state becomes |10⟩.',
    numQubits: 2,
    initialGates: [{ id: 'init-x', type: 'X', qubit: 0, timeStep: 0 }],
    expectedStateDescription: '|01⟩ (Qubit 0 moved to Qubit 1)',
    hint: 'Use the canonical alternating CNOT ladder: CX(0→1), CX(1→0), CX(0→1).',
    testCondition: (result) => {
      const p01 = result.probabilities['01'] || 0;
      if (p01 > 0.98) {
        return { passed: true, message: 'Brilliant! The 3-CNOT reversal identity successfully swapped the qubit states.' };
      }
      return {
        passed: false,
        message: `Expected state |01⟩ (100% probability), but measured P(01)=${(p01 * 100).toFixed(0)}%.`,
      };
    },
  },
  {
    id: 'ch-6-grover-oracle',
    title: 'Challenge 6: Grover Oracle for |11⟩',
    difficulty: 'Hard',
    description: 'Starting with 2 qubits in equal superposition, implement the phase oracle that marks the target state |11⟩ with a -1 phase factor without altering other states.',
    targetGoal: '|ψ⟩ = 1/2 |00⟩ + 1/2 |01⟩ + 1/2 |10⟩ - 1/2 |11⟩.',
    numQubits: 2,
    initialGates: [
      { id: 'h0', type: 'H', qubit: 0, timeStep: 0 },
      { id: 'h1', type: 'H', qubit: 1, timeStep: 0 },
    ],
    expectedStateDescription: '0.5|00⟩ + 0.5|01⟩ + 0.5|10⟩ - 0.5|11⟩',
    hint: 'A Controlled-Z (CZ) gate flips the phase of |11⟩ only, leaving |00⟩, |01⟩, and |10⟩ positive.',
    testCondition: (result) => {
      const sv = result.statevector;
      const a00 = sv[0]?.amplitude.re || 0;
      const a01 = sv[1]?.amplitude.re || 0;
      const a10 = sv[2]?.amplitude.re || 0;
      const a11 = sv[3]?.amplitude.re || 0;

      const isOracle =
        Math.abs(a00 - 0.5) < 0.05 &&
        Math.abs(a01 - 0.5) < 0.05 &&
        Math.abs(a10 - 0.5) < 0.05 &&
        Math.abs(a11 - -0.5) < 0.05;

      if (isOracle) {
        return { passed: true, message: 'Mastery achieved! The oracle accurately marked |11⟩ with the negative phase signature.' };
      }
      return {
        passed: false,
        message: `Amplitudes: |00⟩=${a00.toFixed(2)}, |01⟩=${a01.toFixed(2)}, |10⟩=${a10.toFixed(2)}, |11⟩=${a11.toFixed(2)}. Target for |11⟩ is -0.5.`,
      };
    },
  },
];
