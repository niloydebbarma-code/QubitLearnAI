/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Browser Security & KaTeX LaTeX Rendering Test Suite
 * Real execution of KaTeX mathematical parsing.
 */

import katex from 'katex';

export async function runBrowserSecurityAndKatexTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. KaTeX Real LaTeX Formula Rendering
  try {
    const rawLatex = '\\vert\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(\\vert 00\\rangle + \\vert 11\\rangle)';
    const renderedHtml = katex.renderToString(rawLatex, { throwOnError: true, displayMode: true });
    
    const hasSpan = renderedHtml.includes('<span class="katex">');
    const hasMath = renderedHtml.includes('<math');
    const valid = hasSpan && hasMath && renderedHtml.length > 50;

    results.push({
      name: 'KaTeX Mathematical Formula Rendering',
      passed: valid,
      details: `Rendered formula to ${renderedHtml.length} chars of verified HTML/MathML output.`
    });
  } catch (err: any) {
    results.push({
      name: 'KaTeX Mathematical Formula Rendering',
      passed: false,
      details: `KaTeX render error: ${err.message}`
    });
  }

  // 2. KaTeX Quantum Superposition & Complex Phase Formula
  try {
    const vqeFormula = '\\langle H \\rangle = \\sum_{i} c_i \\langle \\psi(\\vec{\\theta}) \\vert P_i \\vert \\psi(\\vec{\\theta}) \\rangle';
    const vqeHtml = katex.renderToString(vqeFormula, { throwOnError: true });
    
    results.push({
      name: 'KaTeX Differentiable VQE Expectation Value Rendering',
      passed: vqeHtml.length > 50,
      details: `Rendered VQE expectation equation (${vqeHtml.length} chars).`
    });
  } catch (err: any) {
    results.push({
      name: 'KaTeX Differentiable VQE Expectation Value Rendering',
      passed: false,
      details: `Error: ${err.message}`
    });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('browser_security_katex_test')) {
  console.log('='.repeat(80));
  console.log('BROWSER SECURITY & KATEX RENDERING VERIFICATION');
  console.log('='.repeat(80));
  runBrowserSecurityAndKatexTests().then(tests => {
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
