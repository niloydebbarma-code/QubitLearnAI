/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Master TypeScript Test Suite Runner
 * Executes all 11 modular TypeScript test suites in tests/
 */

import { runBrowserSecurityAndKatexTests } from './browser_security_katex_test';
import { runUniversalTranspilerTests } from './transpiler_ast_test';
import { runGiallarAll20RulesTests } from './giallar_formal_rules_test';
import { runQuantumEngineTests } from './quantum_state_engine_test';
import { runQubitScalabilityTests } from './qubit_scalability_test';
import { runLean4AutoformalizerTests } from './formal_verification_lean4_test';
import { runBoundingBoxAndPaperTests } from './document_layout_extraction_test';
import { runIsingColorCodeDecoderTests } from './ising_color_code_decoder_test';
import { runAblationFailureDomainsTests } from './ablation_failure_domains_test';
import { runUserPersonasTests } from './user_personas_workflow_test';
import { runEdgeCasesTests } from './edge_cases_fault_tolerance_test';
import { runRealWebSocketTests } from './websocket_synchronization_test';
import { runLiveCloudServicesTests } from './cloud_services_connection_test';
import { runApiEndpointTests } from './api_endpoints_test';

export async function runAllTypeScriptTests() {
  console.log('='.repeat(80));
  console.log('MASTER TYPESCRIPT & FULL-STACK VERIFICATION HARNESS');
  console.log('='.repeat(80));

  const suites = [
    { title: '1. KaTeX Mathematical Engine & Browser Security', fn: runBrowserSecurityAndKatexTests },
    { title: '2. Quantum AST & Universal Multi-SDK Transpiler', fn: runUniversalTranspilerTests },
    { title: '3. Giallar 20 Formal Rewrite Rules & Equivalence', fn: runGiallarAll20RulesTests },
    { title: '4. Quantum State Engine & Hilbert Space Truth', fn: runQuantumEngineTests },
    { title: '5. In-Browser State Simulation & Scalability Limits', fn: runQubitScalabilityTests },
    { title: '6. Lean 4 Formal Autoformalization & Mathlib4 Theorems', fn: runLean4AutoformalizerTests },
    { title: '7. Document Layout & 2D Bounding Box Extraction', fn: runBoundingBoxAndPaperTests },
    { title: '8. NVIDIA Ising 3D CNN Color Code Decoder', fn: runIsingColorCodeDecoderTests },
    { title: '9. 4-Column System Ablation & Failure Domains', fn: runAblationFailureDomainsTests },
    { title: '10. Multi-Persona User Workflows (Student/Researcher/Instructor)', fn: runUserPersonasTests },
    { title: '11. Edge Cases, Boundaries & Fault Tolerance', fn: runEdgeCasesTests },
    { title: '12. Real Full-Duplex WebSockets', fn: runRealWebSocketTests },
    { title: '13. Live Cloud Services & Supabase Connectivity', fn: runLiveCloudServicesTests },
    { title: '14. Full-Stack API Endpoints & Service Layer', fn: runApiEndpointTests },
  ];

  let totalTests = 0;
  let totalPassed = 0;

  for (const suite of suites) {
    console.log(`\n--- ${suite.title} ---`);
    try {
      const results = await suite.fn();
      for (const t of results) {
        totalTests++;
        if (t.passed) totalPassed++;
        console.log(`[${t.passed ? 'PASS' : 'FAIL'}] ${t.name}: ${t.details}`);
      }
    } catch (err: any) {
      console.log(`[FAIL] Suite execution error: ${err.message}`);
    }
  }

  const passPct = (totalPassed / totalTests) * 100;
  console.log('\n' + '='.repeat(80));
  console.log(`TYPESCRIPT SUITES SUMMARY: ${totalPassed}/${totalTests} tests passed (${passPct.toFixed(1)}%)`);
  console.log('='.repeat(80));
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('run_all_tests.ts')) {
  runAllTypeScriptTests();
}
