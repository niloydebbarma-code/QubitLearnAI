/**
 * Deterministic AI-output boundary tests.
 *
 * These tests validate parsing and rejection behavior only. They do not claim
 * that an AI model is less hallucinatory; that requires the controlled
 * baseline evaluation documented in TEST.md.
 */

import { safeExtractJson } from '../server/jsonHelper';
import { PRE_VERIFIED_LEAN4_MATHLIB_THEOREMS } from '../src/quantum/leanAutoformalizer';

type TestResult = { name: string; passed: boolean; details: string };

export async function runAiOutputValidationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const record = (name: string, passed: boolean, details: string) =>
    results.push({ name, passed, details });

  const parsed = safeExtractJson<{ answer: number }>('{ "answer": 42 }', { answer: 0 });
  record('V01 Valid JSON is parsed without substitution', parsed.answer === 42, `answer=${parsed.answer}`);

  const fenced = safeExtractJson<{ gates: string[] }>(
    '```json\n{"gates":["H","CX"]}\n```',
    { gates: [] },
  );
  record('V02 Markdown-fenced JSON is parsed', fenced.gates.join(',') === 'H,CX', `gates=${fenced.gates.join(',')}`);

  const repaired = safeExtractJson<{ enabled: boolean }>(
    '{ enabled: true, }',
    { enabled: false },
  );
  record('V03 Repairable JSON remains structurally equivalent', repaired.enabled === true, `enabled=${repaired.enabled}`);

  const fallback = { status: 'REJECTED' };
  const invalid = safeExtractJson('model output with no JSON object', fallback);
  record('V04 Unparseable model output uses explicit fallback', invalid === fallback, `status=${invalid.status}`);

  const emptyFallback = { status: 'EMPTY' };
  const empty = safeExtractJson('', emptyFallback);
  record('V05 Empty model output is not treated as success', empty === emptyFallback, `status=${empty.status}`);

  const theoremWithSorry = PRE_VERIFIED_LEAN4_MATHLIB_THEOREMS.find((theorem) =>
    /\b(sorry|admit)\b/.test(theorem.lean4Code),
  );
  record(
    'V06 Lean catalog does not label sorry proofs as proven',
    !theoremWithSorry || theoremWithSorry.typeCheckStatus !== 'PROVEN',
    theoremWithSorry ? `${theoremWithSorry.name} contains an unclosed proof` : 'no sorry/admit entries',
  );

  const theoremWithPlaceholder = PRE_VERIFIED_LEAN4_MATHLIB_THEOREMS.find((theorem) =>
    /:\s*True\s*:=/.test(theorem.lean4Code),
  );
  record(
    'V07 Lean catalog rejects trivial True placeholders',
    !theoremWithPlaceholder || theoremWithPlaceholder.typeCheckStatus !== 'PROVEN',
    theoremWithPlaceholder ? `${theoremWithPlaceholder.name} is a True placeholder` : 'no True placeholders',
  );

  const malformedArray = safeExtractJson<{ values: number[] }>(
    '{"values":[1,2,]} trailing text',
    { values: [] },
  );
  record(
    'V08 Repaired arrays preserve all values',
    malformedArray.values.join(',') === '1,2',
    `values=${malformedArray.values.join(',')}`,
  );

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ai_output_validation_test')) {
  runAiOutputValidationTests().then((tests) => {
    const passed = tests.filter((test) => test.passed).length;
    tests.forEach((test) => console.log(`[${test.passed ? 'PASS' : 'FAIL'}] ${test.name}: ${test.details}`));
    console.log(`Summary: ${passed}/${tests.length} tests passed`);
    process.exit(passed === tests.length ? 0 : 1);
  });
}
