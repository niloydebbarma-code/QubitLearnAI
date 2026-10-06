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

  const parseStructured = (value: string): T | undefined => {
    try {
      const parsed = JSON.parse(value) as T;
      return parsed !== null && typeof parsed === 'object' ? parsed : undefined;
    } catch (_) {
      return undefined;
    }
  };

  // Step 2: Try native JSON.parse
  const nativeParsed = parseStructured(candidate);
  if (nativeParsed !== undefined) return nativeParsed;

  // Step 3: Try jsonrepair on the candidate string
  try {
    const repaired = jsonrepair(candidate);
    const parsed = parseStructured(repaired);
    if (parsed !== undefined) return parsed;
  } catch (_) {}

  // Step 4: Extract outermost { ... } or [ ... ] and repair
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const braceSubstring = candidate.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = parseStructured(jsonrepair(braceSubstring));
      if (parsed !== undefined) return parsed;
    } catch (_) {}
  }

  const firstBracket = candidate.indexOf('[');
  const lastBracket = candidate.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const bracketSubstring = candidate.substring(firstBracket, lastBracket + 1);
    try {
      const parsed = parseStructured(jsonrepair(bracketSubstring));
      if (parsed !== undefined) return parsed;
    } catch (_) {}
  }

  // Step 5: If truncated JSON missing closing brackets, attempt repair from first bracket
  if (firstBrace !== -1) {
    try {
      const openSubstring = candidate.substring(firstBrace);
      const parsed = parseStructured(jsonrepair(openSubstring));
      if (parsed !== undefined) return parsed;
    } catch (_) {}
  }

  return fallback;
}
