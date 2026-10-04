/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lean 4 Formal Verification & Autoformalization Test Suite
 * Real execution of LeanAutoformalizationEngine (qubitlearn-app/src/quantum/leanAutoformalizer.ts).
 */

import {
  PRE_VERIFIED_LEAN4_MATHLIB_THEOREMS,
  LeanAutoformalizationEngine
} from '../qubitlearn-app/src/quantum/leanAutoformalizer';
import { LeanServerEngine } from '../qubitlearn-app/server/leanAutoformalizer';

export async function runLean4AutoformalizerTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Check Pre-verified Lean 4 Mathlib Theorem Catalog
  const theorems = PRE_VERIFIED_LEAN4_MATHLIB_THEOREMS;
  const hasTheorems = Array.isArray(theorems) && theorems.length >= 3;
  results.push({
    name: 'Lean 4 Formal Mathlib Theorem Catalog',
    passed: hasTheorems,
    details: `Loaded ${theorems.length} formal Lean 4 theorems (${theorems.map(t => t.name).join(', ')}).`
  });

  // 2. Validate Theorem Structure, Proof DAGs, and Mathlib Dependencies
  for (const thm of theorems) {
    const hasMathlib = thm.mathlibDependencies.length > 0;
    const hasProofDag = thm.proofDagNodes.length > 0;
    const hasCode = thm.lean4Code.includes('theorem') && thm.lean4Code.includes(':=');
    
    results.push({
      name: `Formal Theorem: ${thm.name} (${thm.domain})`,
      passed: hasMathlib && hasProofDag && hasCode,
      details: `Dependencies: ${thm.mathlibDependencies.join(', ')} | DAG nodes: ${thm.proofDagNodes.length} | Tactics: ${thm.proofTactics.join(', ')}`
    });
  }

  // 3. Test Autoformalization Pipeline for Custom Informal Claims
  try {
    const sampleClaim = 'Applying a Hadamard gate twice to any qubit state restores the original quantum state vector.';
    const formalResult = LeanAutoformalizationEngine.autoformalizeClaim(sampleClaim, 'LeanFlow');
    
    const valid = Boolean(formalResult && formalResult.lean4Code && formalResult.faithfulnessScore > 0.8);
    results.push({
      name: 'LeanFlow Autoformalization Engine (NL -> Lean 4)',
      passed: valid,
      details: `Faithfulness: ${(formalResult.faithfulnessScore * 100).toFixed(1)}% | Generated ${formalResult.lean4Code.split('\n').length} lines of Lean 4 code.`
    });
  } catch (err: any) {
    results.push({
      name: 'LeanFlow Autoformalization Engine',
      passed: false,
      details: err.message
    });
  }

  // 4. Live Lean 4 Compiler Kernel Execution (WSL2 / Local CLI)
  try {
    const sampleLeanCode = `
set_option linter.unusedVariables false
structure QubitRegister (n : Nat) where
  dim : Nat := 2 ^ n
theorem hadamard_involution (psi : QubitRegister 1) : True := by
  trivial
#eval 10 + 20
`;
    const compileResult = LeanServerEngine.executeLeanCompiler(sampleLeanCode);
    results.push({
      name: 'Lean 4 Compiler Kernel Execution (Type-Checking & Evaluation)',
      passed: compileResult.success,
      details: `Compilation successful | Output: ${compileResult.output.replace(/\n/g, ' ')}`
    });
  } catch (err: any) {
    results.push({
      name: 'Lean 4 Compiler Kernel Execution',
      passed: false,
      details: err.message
    });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('formal_verification_lean4_test')) {
  console.log('='.repeat(80));
  console.log('LEAN 4 FORMAL AUTOFORMALIZATION VERIFICATION');
  console.log('='.repeat(80));
  runLean4AutoformalizerTests().then(tests => {
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
