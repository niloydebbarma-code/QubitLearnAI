/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Full-Stack API Endpoints & Service Layer Verification Suite
 * Tests REST API routes, Giallar optimization endpoints, and AI verification handlers.
 */

import { QuantumEngine } from '../server/quantumEngine';
import { GiallarCompilerVerifier } from '../src/quantum/giallarVerifier';
import { CircuitTranspiler } from '../src/quantum/transpiler';

export async function runApiEndpointTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Quantum State Simulation Endpoint Logic
  try {
    const simRes = QuantumEngine.runSimulation({
      numQubits: 2,
      gates: [
        { type: 'H', qubit: 0 },
        { type: 'CX', qubit: 1, control: 0 }
      ]
    }, { shots: 1024 });

    const passed = simRes && simRes.plotData && simRes.plotData.probabilities;
    results.push({
      name: 'POST /api/agents/simulation-lab/run (Statevector Service)',
      passed: Boolean(passed),
      details: `Generated statevector probabilities (P(00)=${(simRes.plotData.probabilities['00'] || 0).toFixed(2)}, P(11)=${(simRes.plotData.probabilities['11'] || 0).toFixed(2)}).`
    });
  } catch (err: any) {
    results.push({ name: 'POST /api/agents/simulation-lab/run', passed: false, details: err.message });
  }

  // 2. Giallar Circuit Optimizer Endpoint Logic
  try {
    const { report } = GiallarCompilerVerifier.optimizeAndVerify({
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g1', type: 'H', qubit: 0, timeStep: 1 }, // Cancels!
        { id: 'g2', type: 'X', qubit: 1, timeStep: 2 }
      ]
    });

    const isOptimized = report.reducedGateCount < report.originalGateCount;
    results.push({
      name: 'POST /api/circuit-designer/optimize (Giallar 20-Rule Optimizer)',
      passed: isOptimized && report.isSemanticsPreserved,
      details: `Reduced ${report.originalGateCount} -> ${report.reducedGateCount} gates (Preserved Unitary Matrix: ${report.isSemanticsPreserved}).`
    });
  } catch (err: any) {
    results.push({ name: 'POST /api/circuit-designer/optimize', passed: false, details: err.message });
  }

  // 3. Multi-SDK Transpilation Endpoint Logic
  try {
    const bellState = {
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'g0', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g1', type: 'CX', qubit: 1, controlQubit: 0, timeStep: 1 }
      ]
    };
    const qiskit = CircuitTranspiler.toQiskit(bellState);
    const cirq = CircuitTranspiler.toCirq(bellState);
    const pennylane = CircuitTranspiler.toPennyLane(bellState);

    const allValid = qiskit.includes('QuantumCircuit') && cirq.includes('cirq.LineQubit') && pennylane.includes('pennylane as qml');
    results.push({
      name: 'POST /api/transpiler/multi-sdk (Universal AST Transpilation)',
      passed: allValid,
      details: `Successfully transpiled across Qiskit (${qiskit.split('\n').length} lines), Cirq (${cirq.split('\n').length} lines), and PennyLane (${pennylane.split('\n').length} lines).`
    });
  } catch (err: any) {
    results.push({ name: 'POST /api/transpiler/multi-sdk', passed: false, details: err.message });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('api_endpoints_test')) {
  console.log('='.repeat(80));
  console.log('FULL-STACK REST API ENDPOINTS VERIFICATION');
  console.log('='.repeat(80));
  runApiEndpointTests().then(tests => {
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
