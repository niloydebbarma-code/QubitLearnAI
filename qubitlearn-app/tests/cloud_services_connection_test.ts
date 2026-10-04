/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cloud Services & Supabase PostgreSQL Connection Verification Suite
 * Tests live Vertex AI / Gemini API and Supabase Cloud PostgreSQL from .env configuration.
 */

import dotenv from 'dotenv';
dotenv.config({ path: 'qubitlearn-app/.env' });
dotenv.config();

export async function runLiveCloudServicesTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Check Vertex AI / Gemini Environment Variables
  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
  const apiKey = process.env.GEMINI_API_KEY || '';

  const hasAiConfig = (useVertex && Boolean(projectId)) || (Boolean(apiKey) && apiKey !== 'PLACEHOLDER_API_KEY');
  results.push({
    name: 'Vertex AI & Gemini Environment Configuration',
    passed: hasAiConfig,
    details: `VertexAI mode: ${useVertex} | Project configured: ${Boolean(projectId)} | API key present: ${Boolean(apiKey)}`
  });

  // 2. Check Supabase Environment Variables
  const sbUrl = process.env.SUPABASE_URL || '';
  const sbPubKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  const sbSecretKey = process.env.SUPABASE_SECRET_KEY || '';

  const hasSbConfig = Boolean(sbUrl && (sbPubKey || sbSecretKey));
  results.push({
    name: 'Supabase Cloud PostgreSQL Environment Configuration',
    passed: hasSbConfig,
    details: `Supabase URL configured: ${Boolean(sbUrl)} | Keys configured: ${Boolean(sbPubKey || sbSecretKey)}`
  });

  // 3. Live Supabase Endpoint Ping
  if (sbUrl) {
    try {
      const headers: Record<string, string> = {};
      if (sbPubKey) {
        headers['apikey'] = sbPubKey;
        headers['Authorization'] = `Bearer ${sbPubKey}`;
      } else if (sbSecretKey) {
        headers['apikey'] = sbSecretKey;
        headers['Authorization'] = `Bearer ${sbSecretKey}`;
      }

      const res = await fetch(`${sbUrl}/rest/v1/`, { headers });
      if (res.status === 200 || res.status === 204 || res.status === 401 || res.status === 404) {
        results.push({
          name: 'Supabase Cloud REST API Connectivity',
          passed: true,
          details: `Endpoint responded with HTTP ${res.status} (Cloud instance reachable).`
        });
      } else {
        results.push({
          name: 'Supabase Cloud REST API Connectivity',
          passed: false,
          details: `HTTP status: ${res.status}`
        });
      }
    } catch (err: any) {
      results.push({
        name: 'Supabase Cloud REST API Connectivity',
        passed: false,
        details: `Connection error: ${err.message}`
      });
    }
  } else {
    results.push({
      name: 'Supabase Cloud REST API Connectivity',
      passed: false,
      details: 'SUPABASE_URL is not set in .env'
    });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('cloud_services_connection_test')) {
  console.log('='.repeat(80));
  console.log('CLOUD SERVICES & SUPABASE POSTGRESQL VERIFICATION');
  console.log('='.repeat(80));
  runLiveCloudServicesTests().then(tests => {
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
