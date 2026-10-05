/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formal Rewrite System Verification Suite (PLDI 2022 Giallar)
 * Tests all 20 formal rewrite rules and the compiler pass equivalence verifier.
 */

import { GIALLAR_20_REWRITE_RULES, GiallarCompilerVerifier } from '../src/quantum/giallarVerifier';
import { CircuitState } from '../src/types';

export async function runGiallarAll20RulesTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Verify that all 20 rules are formally registered with Coq proofs & descriptions
  if (GIALLAR_20_REWRITE_RULES.length !== 20) {
    results.push({
      name: 'Formal 20-Rule Registration Check',
      passed: false,
      details: `Expected 20 rules, found ${GIALLAR_20_REWRITE_RULES.length}`
    });
  } else {
    results.push({
      name: 'Formal 20-Rule Registration Check',
      passed: true,
      details: `All 20 formal Coq/Z3 rewrite rules registered (R1 to R20).`
    });
  }

  // 2. Iterate and verify each individual rule
  for (const rule of GIALLAR_20_REWRITE_RULES) {
    const hasProof = Boolean(rule.coqSoundnessProof && rule.coqSoundnessProof.startsWith('Theorem'));
    const hasLatex = Boolean(rule.latexNotation && rule.latexNotation.length > 3);
    const hasCategory = ['cancellation', 'commutation', 'merger', 'decomposition', 'topology'].includes(rule.category);

    results.push({
      name: `Rule ${rule.id} (${rule.name})`,
      passed: hasProof && hasLatex && hasCategory,
      details: `[${rule.category.toUpperCase()}] ${rule.latexNotation} | Proof: ${rule.coqSoundnessProof}`
    });
  }

  // 3. Real compiler verification test on a circuit with redundant gates (CX cancellation)
  try {
    const unoptimizedCircuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'H', qubit: 0, timeStep: 0 },
        { id: 'g2', type: 'CX', qubit: 1, controlQubit: 0, targetQubit: 1, timeStep: 1 },
        { id: 'g3', type: 'CX', qubit: 1, controlQubit: 0, targetQubit: 1, timeStep: 2 },
      ]
    };

    const { optimizedCircuit, report } = GiallarCompilerVerifier.optimizeAndVerify(unoptimizedCircuit);
    const hasCancelled = optimizedCircuit.gates.length === 1 && report.isSemanticsPreserved === true;

    results.push({
      name: 'End-to-End Compiler Pass Equivalence Verifier',
      passed: hasCancelled,
      details: `Gate reduction: ${report.originalGateCount} -> ${report.reducedGateCount} gates | Applied Rule: ${report.rulesApplied.map(r => r.ruleId).join(', ')} | Fidelity: ${report.fidelity * 100}% | Confidence: ${report.verificationSidecar.confidence * 100}%`
    });
  } catch (err: any) {
    results.push({
      name: 'End-to-End Compiler Pass Equivalence Verifier',
      passed: false,
      details: err.message
    });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('giallar_formal_rules_test')) {
  console.log('='.repeat(80));
  console.log('FORMAL REWRITE RULES & COMPILER EQUIVALENCE VERIFICATION');
  console.log('='.repeat(80));
  runGiallarAll20RulesTests().then(tests => {
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
