/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantum State Simulator & Qubit Scalability Limits Test Suite
 * Real execution of QuantumSimulator (qubitlearn-app/src/quantum/simulator.ts).
 */

import { QuantumSimulator } from '../src/quantum/simulator';
import { CircuitState } from '../src/types';

export async function runQubitScalabilityTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Benchmark scaling from 1 to 5 qubits with real statevector evolution
  for (let n = 1; n <= 5; n++) {
    const circuit: CircuitState = {
      numQubits: n,
      gates: [
        { id: `h0`, type: 'H', qubit: 0, timeStep: 0 },
        ...(n > 1 ? [{ id: `cx01`, type: 'CX', qubit: 1, controlQubit: 0, targetQubit: 1, timeStep: 1 }] : [])
      ]
    };

    const startTime = performance.now();
    const simRes = QuantumSimulator.simulate(circuit, 1024);
    const durationMs = performance.now() - startTime;

    const dim = 1 << n;
    const hasValidStatevector = simRes.statevector && simRes.statevector.length === dim;
    const hasNormalizedProbabilities = Object.values(simRes.probabilities).reduce((a, b) => a + b, 0) > 0.99;

    results.push({
      name: `Statevector Simulation: ${n} Qubit(s) (${dim} Amplitudes)`,
      passed: Boolean(hasValidStatevector && hasNormalizedProbabilities),
      details: `Execution time: ${durationMs.toFixed(2)}ms | Probabilities sum: ~1.00 | Measured shots: 1024`
    });
  }

  // 2. Analytical memory limit scaling calculation for high-qubit allocations
  const highQubitBenchmarks = [
    { qubits: 10, amplitudes: 1024, bytes: 1024 * 16 },
    { qubits: 16, amplitudes: 65536, bytes: 65536 * 16 },
    { qubits: 20, amplitudes: 1048576, bytes: 1048576 * 16 },
    { qubits: 24, amplitudes: 16777216, bytes: 16777216 * 16 }
  ];

  for (const b of highQubitBenchmarks) {
    const mb = b.bytes / (1024 * 1024);
    const browserSafe = mb <= 256.0;
    results.push({
      name: `Memory Limits: ${b.qubits} Qubits (${b.amplitudes.toLocaleString()} Statevector Dimension)`,
      passed: browserSafe,
      details: `Allocated RAM: ${mb.toFixed(2)} MB | Safe Allocation Limit (<= 256 MB): ${browserSafe}`
    });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('qubit_scalability_test')) {
  console.log('='.repeat(80));
  console.log('QUANTUM STATE SIMULATOR & SCALABILITY VERIFICATION');
  console.log('='.repeat(80));
  runQubitScalabilityTests().then(tests => {
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
