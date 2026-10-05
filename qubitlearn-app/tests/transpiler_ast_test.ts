/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantum Abstract Syntax Tree (AST) & Multi-SDK Transpiler Test Suite
 * Real execution of CircuitTranspiler across target quantum SDKs.
 */

import { CircuitTranspiler } from '../src/quantum/transpiler';
import { CircuitState } from '../src/types';

export async function runUniversalTranspilerTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  const bellCircuit: CircuitState = {
    numQubits: 2,
    gates: [
      { id: 'g0', type: 'H', qubit: 0, timeStep: 0 },
      { id: 'g1', type: 'CX', qubit: 1, controlQubit: 0, targetQubit: 1, timeStep: 1 }
    ]
  };

  // 1. Qiskit Transpilation
  try {
    const qiskitCode = CircuitTranspiler.toQiskit(bellCircuit);
    const valid = qiskitCode.includes('QuantumCircuit(2, 2)') && qiskitCode.includes('qc.h(0)') && qiskitCode.includes('qc.cx(0, 1)');
    results.push({
      name: 'Transpiler -> IBM Qiskit (Python)',
      passed: valid,
      details: `Generated ${qiskitCode.split('\n').length} lines of verified Qiskit code.`
    });
  } catch (err: any) {
    results.push({ name: 'Transpiler -> IBM Qiskit', passed: false, details: err.message });
  }

  // 2. Google Cirq Transpilation
  try {
    const cirqCode = CircuitTranspiler.toCirq(bellCircuit);
    const valid = cirqCode.includes('cirq.LineQubit') && cirqCode.includes('circuit.append(cirq.H') && cirqCode.includes('circuit.append(cirq.CNOT');
    results.push({
      name: 'Transpiler -> Google Cirq (NISQ)',
      passed: valid,
      details: `Generated ${cirqCode.split('\n').length} lines of verified Cirq code.`
    });
  } catch (err: any) {
    results.push({ name: 'Transpiler -> Google Cirq', passed: false, details: err.message });
  }

  // 3. Xanadu PennyLane Transpilation
  try {
    const pennylaneCode = CircuitTranspiler.toPennyLane(bellCircuit);
    const valid = pennylaneCode.includes('pennylane as qml') && pennylaneCode.includes('qml.Hadamard(wires=0)') && pennylaneCode.includes('qml.CNOT(wires=[0, 1])');
    results.push({
      name: 'Transpiler -> Xanadu PennyLane (QML)',
      passed: valid,
      details: `Generated ${pennylaneCode.split('\n').length} lines of verified PennyLane code.`
    });
  } catch (err: any) {
    results.push({ name: 'Transpiler -> Xanadu PennyLane', passed: false, details: err.message });
  }

  // 4. OpenQASM 3.0 / 2.0 Transpilation
  try {
    const qasmCode = CircuitTranspiler.toOpenQasm(bellCircuit);
    const valid = qasmCode.includes('OPENQASM') && qasmCode.includes('h q[0];') && qasmCode.includes('cx q[0], q[1];');
    results.push({
      name: 'Transpiler -> OpenQASM Standard Format',
      passed: valid,
      details: `Generated valid OpenQASM circuit (${qasmCode.split('\n').length} lines).`
    });
  } catch (err: any) {
    results.push({ name: 'Transpiler -> OpenQASM Standard Format', passed: false, details: err.message });
  }

  // 5. Publication LaTeX Quantikz Transpilation
  try {
    const quantikzCode = CircuitTranspiler.toQuantikz(bellCircuit);
    const valid = quantikzCode.includes('\\begin{quantikz}') && quantikzCode.includes('\\gate{H}') && quantikzCode.includes('\\ctrl{');
    results.push({
      name: 'Transpiler -> Publication LaTeX Quantikz',
      passed: valid,
      details: `Generated ${quantikzCode.split('\n').length} lines of verified Quantikz LaTeX diagram.`
    });
  } catch (err: any) {
    results.push({ name: 'Transpiler -> Publication LaTeX Quantikz', passed: false, details: err.message });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('transpiler_ast_test')) {
  console.log('='.repeat(80));
  console.log('QUANTUM AST & MULTI-SDK TRANSPILER VERIFICATION');
  console.log('='.repeat(80));
  runUniversalTranspilerTests().then(tests => {
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
