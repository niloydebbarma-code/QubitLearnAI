/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MASTER TEST ORCHESTRATOR & SYSTEM AUDIT RUNNER
 * Executes all 5 test suites across:
 * - Suite 1: Exact Hilbert Space Matrix Mathematics (Type A)
 * - Suite 2: API Endpoints & Supabase Cloud Deliveries
 * - Suite 3: Multi-Persona Real-Time AI Workflows (Vertex AI)
 * - Suite 4: Real-Time WebSockets & Collaboration Room Capacity
 * - Suite 5: Edge Cases, Boundary Conditions & Fault Tolerance
 */

import { runQuantumEngineTests } from "./test_quantum_engine";
import { runApiEndpointTests } from "./test_api_endpoints";
import { runPersonaTests } from "./test_personas";
import { runCollaborationWebSocketTests } from "./test_collaboration_websockets";
import { runEdgeCaseTests } from "./test_edge_cases";
import fs from "fs";
import path from "path";
import { spawn, ChildProcess } from "child_process";

async function ensureServerRunning(): Promise<ChildProcess | null> {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/health");
    if (res.ok) return null; // already running
  } catch (_) {}

  console.log("⚡ Starting background QubitLearn backend server for automated testing...");
  const serverProc = spawn("node", [path.join(process.cwd(), "dist", "server.cjs")], {
    env: { ...process.env, PORT: "3000" },
    stdio: "ignore",
  });

  // Poll until healthy
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch("http://127.0.0.1:3000/api/health");
      if (res.ok) {
        console.log("✅ QubitLearn server online and ready for testing.");
        return serverProc;
      }
    } catch (_) {}
  }
  return serverProc;
}

async function runMasterTestSuite() {
  const startTime = Date.now();
  console.log("==========================================================================");
  console.log("🔬 QUBITLEARN AI — COMPREHENSIVE END-TO-END SYSTEM TEST RUNNER");
  console.log("==========================================================================");
  console.log("Target Server: http://127.0.0.1:3000");
  console.log("Database:      Supabase Cloud PostgreSQL (clwoxrihtyszkgvndhok)");
  console.log("AI Engine:     Google Cloud Vertex AI (gemini-2.5-flash @ global)");
  console.log("Execution:     Real-time interactive requests across all user personas");
  console.log("==========================================================================");

  const serverProc = await ensureServerRunning();

  // Run all 5 suites
  const suite1 = await runQuantumEngineTests();
  const suite2 = await runApiEndpointTests();
  const suite3 = await runPersonaTests();
  const suite4 = await runCollaborationWebSocketTests();
  const suite5 = await runEdgeCaseTests();

  const allTests = [
    { category: "1. Quantum Mathematical Truth (Type A)", tests: suite1 },
    { category: "2. Cloud Endpoints & Supabase Delivery", tests: suite2 },
    { category: "3. Multi-Persona Vertex AI Real-Time Workflows", tests: suite3 },
    { category: "4. Real-Time WebSockets & Room Limits", tests: suite4 },
    { category: "5. Edge Cases, Boundaries & Fault Tolerance", tests: suite5 },
  ];

  let totalCount = 0;
  let passedCount = 0;

  console.log("\n==========================================================================");
  console.log("📊 COMPREHENSIVE TEST AUDIT RESULTS TABLE");
  console.log("==========================================================================");

  let markdownReport = `# QubitLearn AI — Comprehensive System Test Audit Report\n\n`;
  markdownReport += `**Executed At:** ${new Date().toISOString()}\n`;
  markdownReport += `**Environment:** Supabase Cloud PostgreSQL + Google Cloud Vertex AI\n\n`;

  allTests.forEach((suite) => {
    console.log(`\n📂 ${suite.category}`);
    markdownReport += `### ${suite.category}\n\n| Test Name | Status | Verification Details |\n| :--- | :---: | :--- |\n`;

    suite.tests.forEach((t) => {
      totalCount++;
      if (t.passed) passedCount++;
      const icon = t.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`  ${icon} | ${t.name}`);
      console.log(`         ↳ ${t.details}`);
      markdownReport += `| **${t.name}** | ${t.passed ? '✅ PASSED' : '❌ FAILED'} | ${t.details} |\n`;
    });
  });

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log("\n==========================================================================");
  console.log(`🏆 FINAL SCORE: ${passedCount} / ${totalCount} PASSED (${passRate}%) in ${totalDuration}s`);
  console.log("==========================================================================");

  markdownReport += `\n## Summary\n- **Total Tests:** ${totalCount}\n- **Passed:** ${passedCount}\n- **Failed:** ${totalCount - passedCount}\n- **Pass Rate:** ${passRate}%\n- **Execution Duration:** ${totalDuration}s\n`;

  const reportPath = path.join(process.cwd(), '..', 'project_documents', 'Comprehensive_Test_Results.md');
  try {
    fs.writeFileSync(reportPath, markdownReport);
    console.log(`📄 Detailed Markdown Report saved to: project_documents/Comprehensive_Test_Results.md`);
  } catch (e) {
    fs.writeFileSync(path.join(process.cwd(), 'Comprehensive_Test_Results.md'), markdownReport);
  }

  if (serverProc) {
    try {
      serverProc.kill();
    } catch (_) {}
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runMasterTestSuite().catch((err) => {
  console.error("Master Test Runner Error:", err);
  process.exit(1);
});
