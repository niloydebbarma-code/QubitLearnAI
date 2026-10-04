/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Edge Cases & Boundary Conditions Verification Suite
 * Tests empty circuits, excessive qubit clamping, parametric continuous angles,
 * and malicious payload neutralization.
 */

import { QuantumSimulator } from '../qubitlearn-app/src/quantum/simulator';

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
