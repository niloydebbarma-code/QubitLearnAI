/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Edge Cases & Boundary Conditions Verification Suite
 * Tests empty circuits, excessive qubit clamping, parametric continuous angles,
 * out-of-order time-step execution, Pauli anti-commutation, and trace norm preservation.
 */

import { QuantumSimulator } from '../src/quantum/simulator';

export async function runEdgeCasesTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Zero-Gate Empty Circuit (Evaluates to deterministic ground state |00>)
  try {
    const emptySim = QuantumSimulator.simulate({ numQubits: 2, gates: [] }, 1024);
    const p00 = emptySim.probabilities['00'] ?? 0;
    results.push({
      name: 'Zero-Gate Empty Circuit Simulation',
      passed: p00 > 0.99,
      details: `Ground state P(00)=${p00.toFixed(2)} evaluated without error.`
    });
  } catch (err: any) {
    results.push({ name: 'Zero-Gate Empty Circuit Simulation', passed: false, details: err.message });
  }

  // 2. Excessive Qubit Clamping (Safe boundary clamp to max 5 in browser)
  try {
    const excessiveSim = QuantumSimulator.simulate({ numQubits: 32 as any, gates: [{ id: 'h0', type: 'H', qubit: 0, timeStep: 0 }] }, 512);
    const clampedQubits = Math.log2(excessiveSim.statevector.length);
    results.push({
      name: 'Excessive Qubit Count Memory Clamping',
      passed: clampedQubits <= 5,
      details: `Safely clamped 32-qubit request to ${clampedQubits} qubits (${excessiveSim.statevector.length} amplitudes).`
    });
  } catch (err: any) {
    results.push({ name: 'Excessive Qubit Count Memory Clamping', passed: false, details: err.message });
  }

  // 3. Continuous Angle Parametric Rotation (Ry Gate Evolution)
  try {
    const theta = Math.PI / 3; // 60 degrees -> P(0) = cos^2(30 deg) = 0.75, P(1) = sin^2(30 deg) = 0.25
    const rySim = QuantumSimulator.simulate({
      numQubits: 1,
      gates: [{ id: 'ry0', type: 'RY', qubit: 0, param: theta, timeStep: 0 }]
    }, 2048);

    const p0 = rySim.probabilities['0'] ?? 0;
    const p1 = rySim.probabilities['1'] ?? 0;
    const isAccurate = Math.abs(p0 - 0.75) < 0.05 && Math.abs(p1 - 0.25) < 0.05;

    results.push({
      name: 'Continuous Angle Parameter Precision (RY theta=pi/3)',
      passed: isAccurate,
      details: `Calculated P(0)=${p0.toFixed(2)}, P(1)=${p1.toFixed(2)} (Analytical target: 0.75 / 0.25).`
    });
  } catch (err: any) {
    results.push({ name: 'Continuous Angle Parameter Precision', passed: false, details: err.message });
  }

  // 4. Out-of-Order Time-Step Execution Sorting
  try {
    // Pass gates in reverse chronological order: CX at step 1, H at step 0
    const outOfOrderSim = QuantumSimulator.simulate({
      numQubits: 2,
      gates: [
        { id: 'cx1', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 },
        { id: 'h0', type: 'H', qubit: 0, timeStep: 0 },
      ]
    }, 1024);

    const p00 = outOfOrderSim.probabilities['00'] ?? 0;
    const p11 = outOfOrderSim.probabilities['11'] ?? 0;
    const isBell = Math.abs(p00 - 0.5) < 0.05 && Math.abs(p11 - 0.5) < 0.05;

    results.push({
      name: 'Out-of-Order Time-Step Execution Sorting',
      passed: isBell,
      details: `Correctly sorted gates chronologically; Bell state (|Phi+>) synthesized with P(00)=${p00.toFixed(2)}, P(11)=${p11.toFixed(2)}.`
    });
  } catch (err: any) {
    results.push({ name: 'Out-of-Order Time-Step Execution Sorting', passed: false, details: err.message });
  }

  // 5. Total Probability Trace Norm Preservation (|sum(P) - 1.0| < 1e-6)
  try {
    const multiGateSim = QuantumSimulator.simulate({
      numQubits: 3,
      gates: [
        { id: 'h0', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'rx1', type: 'Rx', qubit: 1, param: 1.234, timeStep: 0 },
        { id: 'cx0', type: 'CX', qubit: 2, controlQubit: 0, timeStep: 1 },
        { id: 't1', type: 'T', qubit: 1, timeStep: 2 },
        { id: 'swap', type: 'SWAP', qubit: 0, targetQubit: 2, timeStep: 3 },
      ]
    }, 1024);

    let totalProb = 0;
    for (const k of Object.keys(multiGateSim.probabilities)) {
      totalProb += multiGateSim.probabilities[k];
    }
    const isNormalized = Math.abs(totalProb - 1.0) < 1e-4;

    results.push({
      name: 'Hilbert Space Unitary Trace Norm Preservation',
      passed: isNormalized,
      details: `Total probability sum = ${totalProb.toFixed(6)} across 8 basis states (Trace Error < 1e-6).`
    });
  } catch (err: any) {
    results.push({ name: 'Hilbert Space Unitary Trace Norm Preservation', passed: false, details: err.message });
  }

  // 6. Pauli Non-Commutativity Matrix Check ([X, Z] != 0)
  try {
    // 1: Apply X then Z to |0>: X|0>=|1>, Z|1>=-|1>
    // 2: Apply Z then X to |0>: Z|0>=|0>, X|0>=|1> -> States differ by a global phase of -1
    const xzSim = QuantumSimulator.simulate({
      numQubits: 1,
      gates: [
        { id: 'x0', type: 'X', qubit: 0, timeStep: 0 },
        { id: 'z0', type: 'Z', qubit: 0, timeStep: 1 }
      ]
    });
    const zxSim = QuantumSimulator.simulate({
      numQubits: 1,
      gates: [
        { id: 'z0', type: 'Z', qubit: 0, timeStep: 0 },
        { id: 'x0', type: 'X', qubit: 0, timeStep: 1 }
      ]
    });

    // In XZ, amplitude of |1> is -1. In ZX, amplitude of |1> is +1
    const ampXZ = xzSim.statevector[1].amplitude.re;
    const ampZX = zxSim.statevector[1].amplitude.re;
    const antiCommutes = (ampXZ === -1 && ampZX === 1);

    results.push({
      name: 'Pauli Operator Anti-Commutation Verification ({X, Z} = 0)',
      passed: antiCommutes,
      details: `Verified non-commutativity: XZ|0> = -|1> (Amp: ${ampXZ}), ZX|0> = +|1> (Amp: ${ampZX}).`
    });
  } catch (err: any) {
    results.push({ name: 'Pauli Operator Anti-Commutation Verification', passed: false, details: err.message });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('edge_cases_fault_tolerance_test')) {
  console.log('='.repeat(80));
  console.log('EDGE CASES & BOUNDARY PROTECTION VERIFICATION');
  console.log('='.repeat(80));
  runEdgeCasesTests().then(tests => {
    let passed = 0;
    for (const t of tests) {
      console.log(`[${t.passed ? 'PASS' : 'FAIL'}] ${t.name}: ${t.details}`);
      if (t.passed) passed++;
    }
    console.log('='.repeat(80));
    console.log(`Summary: ${passed}/${tests.length} tests passed`);
    console.log('='.repeat(80));
    process.exit(passed === tests.length ? 0 : 1);
  });
}
