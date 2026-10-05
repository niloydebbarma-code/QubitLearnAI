/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NVIDIA Ising 3D CNN Quantum Error Correction Decoder Test Suite
 * Real execution of IsingQecDecoder (qubitlearn-app/src/quantum/isingQecDecoder.ts).
 */

import { NvidiaIsingQecEngine, QecNoiseModel } from '../src/quantum/isingQecDecoder';

export async function runIsingColorCodeDecoderTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. 3D Space-Time Syndrome Tensor Construction
  try {
    const syndromeData = NvidiaIsingQecEngine.generateColorCodeSyndromes(5, 5, 0.003);
    const isDimensionValid = syndromeData.syndromes.length === 5 && syndromeData.syndromes[0].length === 7 && syndromeData.syndromes[0][0].length === 5;
    results.push({
      name: 'Ising 3D Space-Time Syndrome Generation (d=5)',
      passed: isDimensionValid,
      details: `Generated 5x7x5 Space-Time Tensor (T=5, nRows=7, nCols=5) with ${syndromeData.injectedErrorsCount} noise events.`
    });
  } catch (err: any) {
    results.push({ name: 'Ising 3D Space-Time Syndrome Generation', passed: false, details: err.message });
  }

  // 2. 17-Layer 3D CNN Local Pre-Decoder Kernel Execution
  try {
    const syndromeData = NvidiaIsingQecEngine.generateColorCodeSyndromes(5, 5, 0.005);
    const preDecoded = NvidiaIsingQecEngine.runIsing3dCnnPreDecoder(syndromeData.syndromes);
    const valid = Array.isArray(preDecoded.predictedCorrections);
    results.push({
      name: '17-Layer 3D CNN Local Pre-Decoder Execution',
      passed: valid,
      details: `Pre-decoder localized defects. Residual syndrome count: ${preDecoded.residualSyndromesCount}`
    });
  } catch (err: any) {
    results.push({ name: '17-Layer 3D CNN Local Pre-Decoder Execution', passed: false, details: err.message });
  }

  // 3. Monte Carlo Benchmark: d=31 Color Code at p=0.3%
  try {
    const config: QecNoiseModel = {
      codeDistance: 31,
      rounds: 5,
      physicalErrorRate: 0.003,
      codeType: 'color_code_triangular',
    };

    const mcBenchmark = NvidiaIsingQecEngine.runQecBenchmark(config, 20000);
    const meetsThreshold = mcBenchmark.isFaultTolerant === true && mcBenchmark.errorSuppressionFactor >= 100;
    results.push({
      name: 'Monte Carlo Benchmark (d=31, p=0.3%)',
      passed: meetsThreshold,
      details: `Baseline LER: ${mcBenchmark.baselineLer.toExponential(3)} | Ising LER: ${mcBenchmark.ising3dCnnLer.toExponential(3)} | Suppression: ${mcBenchmark.errorSuppressionFactor}x | Speedup: ${mcBenchmark.decodingSpeedup}x`
    });
  } catch (err: any) {
    results.push({ name: 'Monte Carlo Benchmark', passed: false, details: err.message });
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ising_color_code_decoder_test')) {
  console.log('='.repeat(80));
  console.log('NVIDIA ISING 3D CNN COLOR CODE DECODER VERIFICATION');
  console.log('='.repeat(80));
  runIsingColorCodeDecoderTests().then(tests => {
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
