/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Full-Stack API Endpoints Verification Suite
 * Tests REST API routes against the local/cloud backend.
 */

const BASE_URL = 'http://127.0.0.1:3000';

export async function runApiEndpointTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Health Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    results.push({
      name: 'GET /api/health (Server Uptime)',
      passed: res.ok && data.status === 'ok',
      details: `Status: ${data.status}, Server timestamp: ${data.timestamp}`
    });
  } catch (err: any) {
    results.push({ name: 'GET /api/health', passed: false, details: `Server offline: ${err.message}` });
  }

  // 2. Curriculum Modules
  try {
    const res = await fetch(`${BASE_URL}/api/curriculum`);
    const data = await res.json();
    results.push({
      name: 'GET /api/curriculum (Curriculum Catalog)',
      passed: res.ok && Array.isArray(data),
      details: `Retrieved ${Array.isArray(data) ? data.length : 0} curriculum modules.`
    });
  } catch (err: any) {
    results.push({ name: 'GET /api/curriculum', passed: false, details: err.message });
  }

  // 3. Coding Challenges
  try {
    const res = await fetch(`${BASE_URL}/api/challenges`);
    const data = await res.json();
    results.push({
      name: 'GET /api/challenges (Interactive Challenges)',
      passed: res.ok && Array.isArray(data),
      details: `Retrieved ${Array.isArray(data) ? data.length : 0} quantum coding challenges.`
    });
  } catch (err: any) {
    results.push({ name: 'GET /api/challenges', passed: false, details: err.message });
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
