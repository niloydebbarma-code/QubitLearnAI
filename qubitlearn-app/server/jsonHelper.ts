/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI - Ultra-Robust AI JSON & LaTeX Parser
 * Uses `jsonrepair` + regex preprocessing to reliably parse malformed, unquoted,
 * or truncated AI model outputs.
 */

import { jsonrepair } from 'jsonrepair';

export function safeExtractJson<T = any>(rawInput: string | undefined | null, fallback: T): T {
  if (!rawInput || typeof rawInput !== 'string') {
    return fallback;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) return fallback;

  // Step 1: Strip Markdown code fences if present (```json ... ``` or ``` ...)
  let candidate = trimmed;
  const markdownFenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const fenceMatch = markdownFenceRegex.exec(candidate);
  if (fenceMatch && fenceMatch[1]) {
    candidate = fenceMatch[1].trim();
  }

  // Step 2: Try native JSON.parse
  try {
    return JSON.parse(candidate) as T;
  } catch (_) {}

  // Step 3: Try jsonrepair on the candidate string
  try {
    const repaired = jsonrepair(candidate);
    return JSON.parse(repaired) as T;
  } catch (_) {}

  // Step 4: Extract outermost { ... } or [ ... ] and repair
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const braceSubstring = candidate.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonrepair(braceSubstring)) as T;
    } catch (_) {}
  }

  const firstBracket = candidate.indexOf('[');
  const lastBracket = candidate.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const bracketSubstring = candidate.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(jsonrepair(bracketSubstring)) as T;
    } catch (_) {}
  }

  // Step 5: If truncated JSON missing closing brackets, attempt repair from first bracket
  if (firstBrace !== -1) {
    try {
      const openSubstring = candidate.substring(firstBrace);
      return JSON.parse(jsonrepair(openSubstring)) as T;
    } catch (_) {}
  }

  return fallback;
}
