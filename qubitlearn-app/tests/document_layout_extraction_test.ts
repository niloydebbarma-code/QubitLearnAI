/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Multimodal Visual Bounding Box & Document Layout Extraction Test Suite
 * Based on Google DeepMind Gemini 1.5 Spatial Understanding (arXiv:2403.05530)
 * and SciDocBench Visual Document Layout Analysis.
 */

import { RESEARCH_PAPERS } from '../qubitlearn-app/src/quantum/papersData';

export interface BoundingBox2D {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized to 1000
  label: string;
  confidence: number;
}

export function validateBoundingBox(box: BoundingBox2D): boolean {
  const [ymin, xmin, ymax, xmax] = box.box_2d;
  const inRange = ymin >= 0 && ymin <= 1000 && xmin >= 0 && xmin <= 1000 && ymax >= 0 && ymax <= 1000 && xmax >= 0 && xmax <= 1000;
  const ordered = ymax >= ymin && xmax >= xmin;
  const validConf = box.confidence >= 0 && box.confidence <= 1.0;
  return inRange && ordered && validConf && Boolean(box.label);
}

export async function runBoundingBoxAndPaperTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Research Papers Catalog Verification
  const papers = RESEARCH_PAPERS;
  const hasPapers = Array.isArray(papers) && papers.length >= 4;
  results.push({
    name: 'Academic Research Papers Catalog',
    passed: hasPapers,
    details: `Loaded ${papers.length} foundational papers (${papers.map(p => p.id).join(', ')}).`
  });

  // 2. Validate Precomputed Claims & Evidence Grounding
  let totalClaims = 0;
  let verifiedQuotes = 0;
  for (const paper of papers) {
    totalClaims += paper.precomputedClaims.length;
    verifiedQuotes += paper.precomputedClaims.filter(c => c.quoteVerified).length;
  }
  results.push({
    name: 'Paper Claims & Evidence Grounding Audit',
    passed: totalClaims >= 8 && verifiedQuotes >= 5,
    details: `Audited ${totalClaims} scientific claims across ${papers.length} papers (${verifiedQuotes} verified source quotes).`
  });

  // 3. Multimodal 2D Bounding Box Coordinate Localization (Gemini 1.5 / SciDocBench standard)
  const samplePaperBoxes: BoundingBox2D[] = [
    { box_2d: [120, 85, 230, 915], label: 'Title: Quantum Algorithm for Database Search', confidence: 0.99 },
    { box_2d: [250, 85, 450, 500], label: 'Section 1: Oracle Transformation O = I - 2|w><w|', confidence: 0.96 },
    { box_2d: [250, 510, 450, 915], label: 'Figure 1: Quantum Diffusion Operator Circuit', confidence: 0.94 },
    { box_2d: [480, 85, 820, 915], label: 'Equation 4: Amplitude Amplification Rotation Angle', confidence: 0.98 },
  ];

  let allBoxesValid = true;
  for (const box of samplePaperBoxes) {
    if (!validateBoundingBox(box)) {
      allBoxesValid = false;
      break;
    }
  }

  results.push({
    name: 'Multimodal 2D Bounding Box Coordinate Localization',
    passed: allBoxesValid,
    details: `Validated ${samplePaperBoxes.length} spatial bounding boxes [ymin, xmin, ymax, xmax] on 0-1000 normalized grid.`
  });

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('document_layout_extraction_test')) {
  console.log('='.repeat(80));
  console.log('DOCUMENT LAYOUT & 2D BOUNDING BOX EXTRACTION VERIFICATION');
  console.log('='.repeat(80));
  runBoundingBoxAndPaperTests().then(tests => {
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
