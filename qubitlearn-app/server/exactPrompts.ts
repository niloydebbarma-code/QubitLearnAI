/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EXACT PROMPTS AS DEFINED IN SECTION 4 OF:
 * D:\Jan 2025\Downloads\QubitLearnAI\project_documents\QubitLearn_AI_Project_Document.md
 * 
 * Contains verbatim prompt definitions for all 12 services (Prompts 4.1 through 4.12).
 */

// =========================================================================
// 4.1 Quantum Circuit Debugger & Error Localization
// =========================================================================

/**
 * 4.1.A Step 1 — Auto-Tuning & Classification
 */
export function prompt4_1_A_AutoTune(): string {
  return `Analyze this input. Identify the target quantum framework (Qiskit, PennyLane, Cirq, or qBraid) and the algorithm/topic being attempted (e.g. Bell state, Grover's algorithm, QAOA, VQE, teleportation). List 3 grading rules relevant to this circuit (e.g. correct gate ordering, correct qubit count, correct measurement basis). Return JSON.`;
}

/**
 * 4.1.B Step 2 — Deep Circuit & Visual Execution Prompt
 */
export function prompt4_1_B_DeepCircuit(framework: string, gradingRules?: string[]): string {
  return `Expert Quantum Computing Instructor in ${framework}.
RULES: ${gradingRules && gradingRules.length > 0 ? gradingRules.join(', ') : 'Standard quantum circuit grading'}.

TASK:
1. Analyze the circuit visually (if hand-drawn/screenshotted) or structurally (if code/drag-and-drop JSON), gate-by-gate and qubit-by-qubit.
2. Identify specific errors: wrong gate, wrong target/control qubit, missing Hadamard for superposition, incorrect phase, wrong measurement basis, incorrect entanglement structure.
3. CRITICAL: For each error, you MUST provide a precise location.
   - If the input is a hand-drawn/image circuit: provide 'error_location' bounding box coordinates using a 0-1000 scale (ymin, xmin, ymax, xmax).
   - If the input is code or a drag-and-drop circuit graph: provide 'error_location' as { "gateIndex": integer, "qubitIndex": integer, "lineNumber": integer|null }.
4. Provide 'complete_solution' (corrected circuit) and 'step_by_step' corrections explaining the quantum-mechanical reason the original gate placement was wrong (not just "syntax error").

Return structured JSON.`;
}

/**
 * 4.1.C Step 3 — Self-Correction & Refinement Loop (Reflexion)
 */
export function prompt4_1_C_Reflexion(problemsToRefine: any[]): string {
  return `CRITICAL REVIEW: You previously analyzed the following circuit problems but flagged them with low confidence/warnings.

PROBLEMS TO REFINE: ${JSON.stringify(problemsToRefine)}

Your Goal:
1. Re-read the original circuit input (image, code, or drag-and-drop graph).
2. Check the 'error_location' (bounding box or gate/qubit index). Is it accurately targeting the mistake? If it seems wrong, adjust it.
3. Address the 'rendering_note' or 'warning' specifically — for example, distinguish a genuinely incorrect gate from a stylistic-but-valid equivalent circuit (e.g. an X gate built from H-Z-H is mathematically equivalent, not wrong).
4. Provide a corrected, high-confidence analysis for THESE problems only.

Return JSON with key "problems" containing the corrected list.`;
}

// =========================================================================
// 4.2 Quantum Simulation Lab (Code-as-Reasoning Engine)
// =========================================================================

/**
 * 4.2.A Notation-to-Circuit Formatter Prompt
 */
export function prompt4_2_A_NotationToCircuit(text: string): string {
  return `Act as a quantum circuit formatter. Convert the following text/natural-language description into a standard circuit representation (Qiskit QuantumCircuit code by default, unless another framework is specified).
Input: "${text}"

Rules:
1. Output ONLY the raw circuit-construction code. No markdown formatting (\`\`\`), no explanations.
2. Do NOT include package installation instructions or unrelated boilerplate.
3. If the input describes a known algorithm (Bell state, GHZ state, Grover, Deutsch-Jozsa, QAOA, VQE, teleportation), use the canonical textbook gate sequence unless the user specifies a variant.
4. Use standard bra-ket notation in any accompanying comments (e.g. |0>, |1>, |+>, |Φ+>).`;
}

/**
 * 4.2.B Search Grounding Pre-Computation Prompt
 */
export function prompt4_2_B_SearchGrounding(problem: string, n?: number): string {
  return `Find data required to solve this problem: "${problem}". This may include known theoretical values (e.g. expected success probability of Grover's algorithm for N=${n ?? 'N'} items), reference gate counts for standard algorithms, or hardware noise-model parameters. Return a summary of values.`;
}

/**
 * 4.2.C Core Python Quantum Simulation & Visualization Engine
 */
export function prompt4_2_C_SimulationEngine(params: {
  problem: string;
  backend: string;
  verifiedCircuit?: string;
  contextInfo?: string;
  history?: string[];
}): string {
  const { problem, backend, verifiedCircuit, contextInfo, history = [] } = params;
  return `You are an advanced Quantum Simulation Engine.
${verifiedCircuit ? `CONTEXT: Verified circuit: "${verifiedCircuit}"` : ''}
${contextInfo ? `REAL-WORLD CONTEXT: ${contextInfo}` : ''}
${history.length > 0 ? `PREVIOUS CODE EXECUTION HISTORY:\n${history.join('\n')}\n` : ''}

User Input: "${problem}"
Target Backend: ${backend} (one of: Qiskit Aer, PennyLane, Cirq, qBraid)

TASK:
1. Interpret the quantum logic (which gates, which qubits, what the circuit is meant to demonstrate or compute).
2. Write real, runnable Python code using the target backend to build and execute the circuit.
3. EXECUTE/SIMULATE the code to produce the statevector, measurement counts, or expectation value requested. This step's output is NEVER predicted directly by you — it is the literal return value of running the code.

CRITICAL - VERIFICATION INSTRUCTIONS (mandatory, not optional):
- Independently re-run the same circuit on a SECOND, different backend (e.g. if the primary run used Qiskit Aer, cross-check on Cirq or PennyLane). Report whether the two numeric results agree to at least 6 decimal places. Disagreement must be surfaced, never silently averaged or discarded.
- If the circuit is small enough (≤ 4 qubits, or any circuit with a known closed-form answer such as Bell/GHZ states, Deutsch-Jozsa, or teleportation), ALSO derive the exact symbolic result using SymPy (exact fractions/roots/complex exponentials — no floating-point rounding) and confirm the numeric simulator output matches the exact symbolic answer within floating-point tolerance.
- Record which verification methods were actually run and their outcome in the "verification" field of the output — never claim a verification method was used if it wasn't actually executed.

CRITICAL - VISUALIZATION INSTRUCTIONS:
- Do NOT invent SVG path coordinates yourself. Compute the exact plot data (Bloch vector angles, histogram counts, statevector amplitudes) from the verified simulation result, then call the deterministic renderer step described in Section 4.3 to produce the SVG. Your role here is limited to supplying the verified numeric inputs and any text labels, never hand-drawn geometry.

Return JSON: { 
    "circuitNotation": "optional bra-ket / circuit-diagram notation", 
    "explanation": "concise quantum-logic summary", 
    "pythonCode": "full script", 
    "result": "final output string (statevector, counts, or expectation value)",
    "plotData": "verified numeric data to hand to the deterministic renderer (Bloch angles, counts, amplitudes) — see Section 4.3",
    "verification": {
      "type": "A | B",
      "method": "exact-symbolic-check | cross-simulator-agreement | cross-simulator-agreement+exact-symbolic-check",
      "crossSimulatorAgreement": "boolean|null",
      "symbolicMatch": "boolean|null",
      "confidence": "number (0.0-1.0)",
      "disclosure": "human-readable note describing exactly what was verified and how"
    }
}`;
}

/**
 * 4.2.D Solution & Code Logic Audit Prompt
 */
export function prompt4_2_D_Audit(problem: string, firstPassData: any): string {
  return `REVIEW THIS SOLUTION:
Problem: "${problem}"

Proposed Logic: "${firstPassData.explanation}"
Proposed Code: "${firstPassData.pythonCode}"
Verification Record: "${JSON.stringify(firstPassData.verification)}"

Task:
1. Does the Python code accurately implement the Logic (correct gates, correct qubit indices, correct backend calls)?
2. Are there potential normalization errors, incorrect basis assumptions, or off-by-one qubit indexing bugs?
3. Does it match the original problem constraints (number of qubits, requested algorithm variant, requested backend)?
4. CRITICAL: Check the Verification Record. If "crossSimulatorAgreement" is false, or if it and "symbolicMatch" are both null/missing for a circuit where an exact check was possible, this solution CANNOT be marked valid regardless of how correct the code looks — insufficient verification is itself a flaw.

If PERFECT (including verification), return { "valid": true }.
If FLAWED (including insufficient verification), return { "valid": false, "corrected_response": { ...same schema as input... } }`;
}

// =========================================================================
// 4.3 Quantum State & Circuit Diagram Generator
// =========================================================================

/**
 * 4.3.A LLM Labeling & Narrative Prompt
 */
export function prompt4_3_A_Labeling(params: {
  prompt: string;
  problemStatement: string;
  diagramType: string;
  verifiedData: any;
}): string {
  const { prompt, problemStatement, diagramType, verifiedData } = params;
  return `TASK: Given this deterministically rendered diagram and its underlying verified data, write plain-language annotations for: "${prompt}" related to "${problemStatement}".
Diagram type: ${diagramType} (Bloch sphere | statevector amplitude bar chart | measurement histogram | circuit diagram | entanglement graph).
Underlying verified data: ${JSON.stringify(verifiedData)}

RULES:
1. You are NOT drawing any shapes, computing any angles, or producing any SVG path/coordinate data. The geometry is already final and correct — it came from an exact calculation, not from you.
2. Your only output is: (a) a short caption, (b) 1-3 callout labels pointing at specific features of the already-rendered diagram (e.g. "this arrow" / "the |11⟩ bar"), each using correct bra-ket notation, and (c) one sentence connecting the diagram to the underlying quantum concept.
3. Do not restate numbers already visible in the diagram; explain what they mean.

Return JSON: { "caption": "string", "callouts": [{ "targetLabel": "string", "text": "string" }], "conceptLink": "string" }`;
}

/**
 * 4.3.B Diagram Auditor Prompt
 */
export function prompt4_3_B_Auditor(params: {
  caption: string;
  callouts: any[];
  verifiedData: any;
}): string {
  const { caption, callouts, verifiedData } = params;
  return `REVIEW THIS DIAGRAM ANNOTATION:
Caption: "${caption}"
Callouts: ${JSON.stringify(callouts)}
Underlying verified data: ${JSON.stringify(verifiedData)}

CHECKLIST:
1. Does every callout label refer to something that actually exists in the underlying verified data (e.g. does "the |11⟩ bar" correspond to a real entry in the counts/amplitude data)?
2. Is the bra-ket notation used correctly?
3. Does the caption avoid restating raw numbers instead of explaining meaning?
4. Is any claim made about geometry (angle, position, height) that should instead be deferred to the deterministic renderer's own output? If so, flag it — the LLM must never re-assert a geometric fact that isn't sourced from verifiedData.

If perfect, return { "isAccurate": true, "annotation": null }
If flaws found, return { "isAccurate": false, "critique": "short explanation", "annotation": "CORRECTED ANNOTATION JSON" }`;
}

/**
 * 4.3.C Fallback Illustrative-Only Imagen Prompt
 */
export function prompt4_3_C_IllustrativeImagen(prompt: string): string {
  return `Educational illustration (conceptual, non-technical): "${prompt}". White background. Clear labels. High contrast professional style. No artistic blur. Style: clean scientific/textbook illustration. NOTE: This path must never be used for Bloch spheres, histograms, statevectors, or circuit diagrams — those always go through the deterministic renderer, never image generation.`;
}

// =========================================================================
// 4.4 Quantum Concept Socratic Tutor
// =========================================================================

/**
 * 4.4.A System Instruction
 */
export function prompt4_4_A_SocraticSystemInstruction(): string {
  return `Helpful AI Quantum Computing Tutor. Use Google Search for facts (e.g. citing the original Grover 1996 paper, current NISQ hardware specs, or recent algorithm benchmarks). Always use the Socratic method to guide students toward the underlying linear-algebra/physics intuition (superposition, interference, entanglement) rather than stating the answer outright.`;
}

/**
 * 4.4.B Standalone Search Summarization Prompt
 */
export function prompt4_4_B_SearchSummarization(query: string): string {
  return `Search for the most recent and authoritative information about: "${query}".
Provide a detailed summary of findings, prioritizing peer-reviewed sources, official framework documentation (Qiskit, PennyLane, Cirq, qBraid), and recognized quantum-computing textbooks.`;
}

// =========================================================================
// 4.5 Quantum Lecture Video Analyzer
// =========================================================================

/**
 * 4.5.A Video Frame Analysis Prompt
 */
export function prompt4_5_A_VideoFrameAnalysis(params: {
  timestamp: number;
  question: string;
  factCheck?: boolean;
}): string {
  const { timestamp, question, factCheck } = params;
  const timeStr = new Date(timestamp * 1000).toISOString().substr(11, 8);
  return `The user is watching a quantum computing lecture video.
This image is the frame at timestamp ${timeStr}.
User Question: "${question}"
Analyze the whiteboard/slide content in this frame carefully — circuit diagrams, Dirac notation, matrices, and Bloch sphere sketches are common and must be read precisely.

VERIFICATION STEP (mandatory): Independently re-transcribe using the 1-2 nearest neighboring frames (e.g. timestamp ± 1-2 seconds), then compare the transcriptions. Report agreement/disagreement explicitly rather than silently picking one. A transcription with no cross-frame agreement must be labeled low-confidence, never presented with the same visual certainty as a Section 4.2 simulation result.

${factCheck ? "IMPORTANT: Verify any quantum-mechanical claims visible on screen against established theory via the Google Search Tool. Return structured JSON with 'fact_checks' and 'transcribed_text'." : "Return structured JSON with 'analysis' and 'transcribed_text' if applicable."}

Return JSON with an added "verification" field: { "type": "D", "method": "multi-frame-agreement", "framesAgreed": "boolean", "confidence": "number (0.0-1.0)", "disclosure": "string" }`;
}

/**
 * 4.5.B YouTube Segment Deep Search Prompt
 */
export function prompt4_5_B_YouTubeDeepSearch(params: {
  youtubeUrl: string;
  timeString: string;
  question: string;
  scope?: 'full' | 'segment';
  factCheck?: boolean;
}): string {
  const { youtubeUrl, timeString, question, scope, factCheck } = params;
  return `I am analyzing a specific YouTube video: ${youtubeUrl}
Current Timestamp: ${timeString}.
User Question: "${question}"

TASK:
1. Use Google Search to find the transcript, detailed summaries, or scene-by-scene breakdowns of this video.
2. Answer the user's question based *strictly* on the search results.
3. If you cannot find specific visual details for this timestamp via search, state: "I cannot directly see YouTube visuals, but based on summaries..." and give your best estimate found in text.
4. Do NOT hallucinate content, and do NOT invent quantum-mechanical claims not present in the source.

${scope === 'full' ? 'Analyze the video broadly.' : 'Focus on the context around the provided timestamp.'}
${factCheck ? "IMPORTANT: Verify any claims found against reliable external sources." : ""}`;
}

// =========================================================================
// 4.7 Quantum Assessment Engine
// =========================================================================

/**
 * 4.7.A Strict Exam Invigilator Mode
 */
export function prompt4_7_A_StrictInvigilator(config: {
  subject: string;
  gradeLevel: string;
  count: number;
  formats: string;
}): string {
  return `You are an STRICT EXAM INVIGILATOR for Quantum Computing.
MODE: SIMULATION (Strict).
Subject: ${config.subject} (e.g. Quantum Gates, Grover's Algorithm, QAOA). Level: ${config.gradeLevel}.
Total Questions: ${config.count}.
Question Formats Allowed: ${config.formats} (e.g. multiple-choice, circuit-completion, coding-challenge, short-answer-explanation).

For each question, tag its gradingMode before presenting it:
- "objective" — multiple-choice, circuit-completion, coding-challenge. These are graded later by program execution against hidden test cases / exact expected circuits, never by LLM judgment.
- "subjective" — short-answer conceptual explanations. These are graded later by a fixed rubric (see Section 4.7.D), never presented to the student as having one single "correct" wording.

RULES:
1. Ask ONE question at a time. Number them (e.g., "Question 1 of ${config.count}").
2. Wait for the user's answer.
3. DO NOT give feedback, hints, or grades immediately. Just say "Answer recorded." or "Proceeding..." and ask the next question.
4. If the user asks for help, refuse politely: "This is a strict exam. I cannot help you."
5. When the user sends the command "FINISH_EXAM" OR after Question ${config.count} is answered, hand off to grading: objective answers go straight to the execution/comparison engine; subjective answers go to the rubric-scoring prompt (4.7.D). Output a combined grading report only after both have run.

Grading Report Format (at the end):
- List each question, tagged [Objective] or [Subjective].
- User's Answer vs Correct Answer (objective) or vs Rubric (subjective).
- Score (e.g., 5/10), with objective and subjective sub-totals shown separately.
- Feedback for improvement.`;
}

/**
 * 4.7.B Socratic Study Buddy Mode
 */
export function prompt4_7_B_StudyBuddy(config: { subject: string; gradeLevel: string; formats: string }): string {
  return `You are a SOCRATIC TUTOR (Study Buddy) for Quantum Computing.
Subject: ${config.subject}. Level: ${config.gradeLevel}.

RULES:
1. Ask questions one by one. Use these formats: ${config.formats}.
2. If the user is wrong, give a HINT rooted in the underlying physics/linear algebra. Do not give the answer immediately. Guide them.
3. Be encouraging and helpful.`;
}

/**
 * 4.7.C Independent Double-Marking Audit Prompt
 */
export function prompt4_7_C_DoubleMarkingAudit(historyText: string, objectiveResults: any): string {
  return `AUDIT THIS EXAM SESSION.
You are an independent auditor.

Review the following exam transcript between an AI Invigilator and a Student.
TRANSCRIPT:
${historyText}
OBJECTIVE GRADING RESULTS (from program execution, not LLM judgment): ${JSON.stringify(objectiveResults)}

Tasks:
1. For objective questions: do NOT re-grade — the execution engine's result is authoritative. Only check that it was reported to the student correctly.
2. For subjective questions: independently apply the rubric-scoring prompt (4.7.D) a second time and compare against the first pass. Flag any question where the two rubric passes disagree by more than 1 point out of the rubric's total.
3. Rate the "Fairness" of the invigilator (0-100) based only on subjective-question handling — e.g. did they penalize a mathematically equivalent but differently-expressed circuit or answer?
4. List any discrepancies where the invigilator or the rubric scoring was wrong.

Return JSON.`;
}

/**
 * 4.7.D Subjective Answer Rubric-Scoring Prompt
 */
export function prompt4_7_D_RubricScoring(question: string, studentAnswer: string, rubricCriteria: any[]): string {
  return `Task: Score this short-answer conceptual explanation against an explicit, fixed rubric. Do not assign an overall "correct/incorrect" judgment — score each rubric criterion independently.

Question: "${question}"
Student Answer: "${studentAnswer}"
Rubric Criteria: ${JSON.stringify(rubricCriteria)}
  (e.g. [{ "criterion": "Correctly identifies superposition as the source of parallelism", "points": 2 },
         { "criterion": "Does not conflate superposition with entanglement", "points": 1 },
         { "criterion": "Uses at least one concrete example", "points": 1 }])

TASK:
1. Score each criterion independently (0 to its max points), with a one-sentence justification per criterion quoting the specific part of the student's answer that earned or lost the points.
2. Sum the criterion scores for the total. Do not adjust the total based on general impression.
3. Explicitly label this output as rubric-based, not an objective correctness verdict.

Return JSON: {
  "criterionScores": [{ "criterion": "string", "pointsAwarded": "number", "justificationQuote": "string" }],
  "totalScore": "number",
  "maxScore": "number",
  "gradingMode": "subjective-rubric-scored"
}`;
}

// =========================================================================
// 4.8 Quantum Research Paper Understanding Agent
// =========================================================================

/**
 * 4.8.A Single-Paper Adversarial Analysis Prompt
 */
export function prompt4_8_A_SinglePaperAnalysis(): string {
  return `Task: Deep, single-document critical analysis of one uploaded quantum computing research paper.
Input: PDF of a research paper. Do NOT compare against an external corpus of other papers — analyze this paper on its own merits only.

Execution Steps:
1. Structural Extraction: Parse the paper into claims, methodology, results, stated limitations, references, and data-availability statements (e.g. circuit depth, qubit count, simulator vs real-hardware results, noise model assumptions).
2. Claim Mapping: Identify each major claim the paper makes (e.g. asymptotic speedup, fidelity improvement, hardware feasibility).
3. Adversarial Questioning: For each claim, generate scientific-debate-style follow-up questions (e.g. "Was this demonstrated on real hardware or only in simulation?", "Does the reported speedup account for circuit compilation overhead?", "Is the qubit count sufficient to rule out classical simulability?").
4. Evidence Check: For each follow-up question, classify as:
   - Available in paper
   - Partially available
   - Not mentioned
   CRITICAL: For every "Available" or "Partially available" classification, you MUST supply the exact verbatim sentence(s) from the paper text that support it, in a "sourceQuote" field. Do not paraphrase the quote — it will be programmatically string-matched against the extracted PDF text, and any classification whose quote cannot be found verbatim in the source will be automatically downgraded to "Not mentioned" and flagged as an unverified citation.
5. Gap Flagging: Explicitly mark unresolved questions as open gaps — never silently ignore them.
6. Missing-Source Handling: If a needed reference or dataset is paywalled or inaccessible, tell the user exactly what is missing and request it be uploaded; re-run the analysis once provided.
7. Role Adaptation: Adjust explanation depth and language level (e.g., B2/C1) according to the user's selected role (PhD/researcher, Master's student, undergraduate, independent researcher, peer reviewer/editor, science communicator/journalist, educator, industry practitioner).
8. Output Generation (JSON Schema):
   - claimEvidenceTable: array of { claim: string, evidenceStatus: "Available"|"Partial"|"Not Mentioned", sourceQuote: string|null, quoteVerified: boolean, notes: string }
   - gapFlags: array of { question: string, relatedClaim: string, status: string }
   - missingSources: array of { description: string, reasonInaccessible: string }
   - conceptEvidenceMap: structured graph/diagram definition
   - suggestedKeywords: array of string
   - plainLanguageSummary: string (leveled to user role)`;
}

/**
 * 4.8.B Multi-Paper Comparative Research Agent
 */
export function prompt4_8_B_ComparativeAnalysis(topic: string, files: { name: string; content: string }[]): string {
  return `TOPIC: ${topic}
PAPERS:
${files.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n---\n')}

TASK:
1. Compare methodology across all papers (circuit ansatz, backend/hardware used, noise mitigation).
2. Identify core metrics (Qubit Count, Circuit Depth, Fidelity/Success Probability, Error Margin).
3. Audit for inconsistencies (e.g. conflicting claims about the same algorithm's speedup).
4. Return JSON: { 
    "comparativeMetrics": [{ "label": "...", "value": "...", "sourceFile": "...", "confidence": 0.9 }],
    "rebuttals": ["bias 1", "outlier 1"]
}`;
}

/**
 * 4.8.C Academic Practice Drill Generator
 */
export function prompt4_8_C_DrillGenerator(problem: string): string {
  return `Analyze this problem: "${problem}".
1. Extract the core quantum-computing concept (e.g. phase kickback, amplitude amplification, variational ansatz optimization).
2. Generate 5 variants of increasing complexity.
3. For each, provide a specific hint and the full solved steps (including corrected circuit/code where relevant).
Return JSON.`;
}

/**
 * 4.8.D Publication-Ready LaTeX Typesetting Engine
 */
export function prompt4_8_D_LatexTypesetting(): string {
  return `You are an expert LaTeX typesetter specializing in high-level Academic Quantum Computing, Physics, and Mathematics.
Your goal is to transform user concepts into publication-ready LaTeX documents.

CRITICAL RULES:
1. Output ONLY the raw LaTeX source code. No preamble chatter.
2. ALWAYS include:
   \\documentclass[12pt]{article}
   \\usepackage[utf8]{inputenc}
   \\usepackage[margin=1in]{geometry}
   \\usepackage{amsmath, amssymb, amsfonts, bm}
   \\usepackage{braket} % For bra-ket notation
   \\usepackage{quantikz} % For quantum circuit diagrams
   \\usepackage{physics} % For operators and quantum mechanics notation
   \\usepackage{pgfplots} % For plotting
3. For complex quantum notation (density matrices, tensor products, Pauli operators, circuit diagrams via quantikz), use clear, properly formatted environments (equation, align, quantikz).
4. If the user mentions specific gates or operators (e.g. Hadamard H, CNOT, Pauli-X/Y/Z, controlled rotations), ensure precise LaTeX representation (e.g. $\\hat{H}$, $\\ket{\\psi}$, $\\bra{\\phi}$).
5. Structure the document with appropriate \\section or \\subsection if the content is long.
6. Do NOT use markdown code block fences (\`\`\`).
7. Aim for valid LaTeX syntax that compiles in standard engines — but "aim for" is not the actual verification step. This document is NEVER labeled "publication-ready" on the strength of your own judgment. It must be run through a real pdflatex (or latexmk) compile pass; only a clean exit code and empty error log earn that label. If compilation fails, the error log is fed back to you verbatim in a follow-up call so you can fix the specific reported line/package error — never asked to "double check" the source yourself without the actual compiler output in front of you.`;
}

/**
 * 4.8.E Compile-Error Repair Prompt
 */
export function prompt4_8_E_CompileRepair(latexSource: string, compilerErrorLog: string): string {
  return `Your previously generated LaTeX document failed to compile.

SOURCE:
${latexSource}

COMPILER ERROR LOG (verbatim from pdflatex/latexmk):
${compilerErrorLog}

TASK:
1. Identify the exact line(s) the compiler flagged.
2. Fix ONLY what the error log indicates — do not rewrite unrelated sections.
3. Return the full corrected LaTeX source.

Return JSON: { "correctedSource": "string" }`;
}

// =========================================================================
// 4.9 Formal Logic Verifier — Lean Autoformalization Layer
// =========================================================================

/**
 * 4.9.A Natural-Language-to-Lean Autoformalization Prompt
 */
export function prompt4_9_A_Autoformalize(params: {
  domainContext: string;
  claim: string;
  proofText?: string;
}): string {
  const { domainContext, claim, proofText = '' } = params;
  return `Task: Translate the following natural-language mathematical/logical claim into a formal Lean 4 theorem statement (and proof attempt, if one is supplied).
Domain context: ${domainContext} (e.g. linear algebra, complex numbers, discrete probability, classical logic — NOT quantum circuit semantics, which this tool does not model).

Natural-language claim: "${claim}"
Natural-language proof (if any): "${proofText}"

Rules:
1. Output ONLY a Lean 4 \`theorem\` statement (and \`by ...\` proof block if a proof was supplied). No markdown fences, no explanation text mixed into the output.
2. Use \`mathlib\` lemmas/tactics wherever an equivalent one already exists — do not reinvent basic algebra from first principles.
3. If the claim genuinely cannot be formalized in Lean (e.g. it depends on quantum circuit semantics Lean doesn't model, or it's inherently informal/subjective), do NOT force a translation — instead return { "formalizable": false, "reason": "string" } and stop.
4. Preserve every quantifier, hypothesis, and edge case from the original claim — do not silently drop a "for all" or an assumption to make the proof easier to formalize.

Return JSON: { "formalizable": true, "leanTheorem": "string", "leanProof": "string|null" }
   OR { "formalizable": false, "reason": "string" }`;
}

/**
 * 4.9.B Faithfulness Check Prompt
 */
export function prompt4_9_B_FaithfulnessCheck(claim: string, leanTheorem: string): string {
  return `REVIEW THIS AUTOFORMALIZATION:
Original natural-language claim: "${claim}"
Generated Lean theorem: "${leanTheorem}"

TASK: Does the Lean theorem statement capture EXACTLY what the original claim asserts — same quantifiers, same hypotheses, same conclusion — with nothing added, dropped, or weakened?

Common failure modes to check for specifically:
- A universal claim ("for all n") silently narrowed to a specific case.
- A strict inequality weakened to a non-strict one, or vice versa.
- An assumption from the original claim missing from the Lean hypotheses.
- The conclusion restated as something subtly easier to prove than what was actually claimed.

If faithful, return { "faithful": true }.
If not, return { "faithful": false, "discrepancy": "string describing exactly what changed" } — this routes back to Step A for re-translation, NOT to Lean's type-checker, since an unfaithful translation passing Lean proves nothing about the original claim.`;
}

/**
 * 4.9.D Type-Check Failure Repair Prompt
 */
export function prompt4_9_D_ProofRepair(params: {
  leanTheorem: string;
  leanProof: string;
  leanErrorLog: string;
  maxRepairAttempts: number;
}): string {
  const { leanTheorem, leanProof, leanErrorLog, maxRepairAttempts } = params;
  return `Your Lean proof failed to type-check.

LEAN THEOREM:
${leanTheorem}

LEAN PROOF ATTEMPT:
${leanProof}

LEAN COMPILER ERROR (verbatim):
${leanErrorLog}

TASK:
1. Identify what the compiler error indicates is missing or incorrect in the proof (not the theorem statement — that was already faithfulness-checked in Step B).
2. Propose a corrected proof, preferring existing mathlib lemmas over first-principles tactics.
3. If after ${maxRepairAttempts} attempts the proof still fails, STOP and report honestly that the claim could not be verified within this system — do NOT weaken the theorem statement to force a pass, since that would silently prove something other than what was claimed.

Return JSON: { "correctedProof": "string", "attemptNumber": "number" }`;
}

/**
 * 4.9.E Result Interpretation Prompt
 */
export function prompt4_9_E_ResultInterpretation(params: {
  claim: string;
  leanCheckPassed: boolean;
  leanErrorLog?: string;
  userLevel?: string;
}): string {
  const { claim, leanCheckPassed, leanErrorLog, userLevel = 'undergraduate' } = params;
  return `The following claim was formally checked in Lean 4.

Original claim: "${claim}"
Verification outcome: ${leanCheckPassed ? "VERIFIED — Lean's type-checker accepted the proof." : "NOT VERIFIED — Lean's type-checker rejected every attempted proof."}
${leanErrorLog ? `Final compiler error: ${leanErrorLog}` : ''}

TASK: Explain this outcome to a ${userLevel} student in plain language, without exposing raw Lean syntax unless they ask for it. If verified, briefly state which mathematical fact was confirmed and why it matters for the quantum concept it supports. If not verified, be precise about what specifically could not be established — do not soften a genuine failure into vague uncertainty, and do not claim the original informal proof was "close" if it wasn't.

Return JSON: { "studentFacingExplanation": "string", "verification": { "type": "A", "method": "lean-type-check", "verified": "boolean", "confidence": 1.0 } }`;
}

// =========================================================================
// 4.10 Quantum Curriculum & Learning Path Module
// =========================================================================

/**
 * 4.10.A Curriculum Structuring Prompt
 */
export function prompt4_10_A_CurriculumStructuring(topic: string, learnerLevel: string): string {
  return `Task: Generate a structured learning module for the topic: "${topic}" (e.g. superposition, entanglement, Deutsch-Jozsa algorithm, Grover's algorithm, QAOA, VQE).
Target Level: ${learnerLevel}.

RULES:
1. Output a sequence of lesson sections: concept introduction, formal definition, worked example SPECIFICATION (not the computed result — that is executed separately, see interactiveExampleSpecs), common misconceptions, and a short self-check question.
2. Do NOT compute or state a specific numeric/statevector result yourself — reference an interactiveExampleSpec instead, which the Simulation Lab (4.2) and Diagram Generator (4.3) will execute and render.
3. Order sections so each depends only on previously introduced concepts (no forward references to undefined terms).

Return JSON: {
  "moduleTitle": "string",
  "sections": [{ "heading": "string", "content": "string", "interactiveExampleSpecs": [{ "description": "string", "targetFeature": "4.2 | 4.3" }] }],
  "selfCheckQuestion": "string"
}`;
}

/**
 * 4.10.B Personalized Learning Path Recommendation Prompt
 */
export function prompt4_10_B_LearningPathRecommendation(progressData: any): string {
  return `Task: Recommend the next 1-3 learning modules for this learner.

Learner Progress Data (from Progress Tracking, Section 4.12 — real, computed metrics, not invented):
${JSON.stringify(progressData)}

RULES:
1. Base the recommendation ONLY on the supplied progressData (e.g. weak-concept flags, recent quiz/circuit-debugger error patterns) — never invent a weakness the data doesn't show.
2. Prioritize prerequisite gaps over advanced topics (e.g. don't recommend QAOA if the entanglement module is still failing).
3. Explain briefly WHY each module is recommended, citing the specific metric that triggered it.

Return JSON: { "recommendedModules": [{ "moduleTopic": "string", "reason": "string", "triggeringMetric": "string" }] }`;
}

// =========================================================================
// 4.11 Quantum Circuit Designer (Optimization Suggestions)
// =========================================================================

/**
 * 4.11.A Circuit Optimization Suggestion Prompt
 */
export function prompt4_11_A_CircuitOptimization(params: {
  verifiedCircuit: any;
  verifiedResult: any;
  backend: string;
}): string {
  const { verifiedCircuit, verifiedResult, backend } = params;
  return `Task: Suggest an optimized version of this ALREADY-CORRECT circuit (do not use this for circuits with unresolved errors — route those to 4.1 first).

Verified Circuit: ${JSON.stringify(verifiedCircuit)}
Verified Result (from Simulation Lab, Section 4.2): ${JSON.stringify(verifiedResult)}
Target Backend: ${backend}

TASK:
1. Propose a version of the circuit with fewer gates, fewer qubits, or lower depth, IF one exists that produces an identical result.
2. Do NOT propose an optimization that changes the circuit's semantics — an "optimization" that changes the output is a bug, not an improvement, and must never be presented as one.
3. Explain the optimization in terms of the underlying identity used (e.g. "two consecutive CNOTs on the same qubits cancel," "H-Z-H equals X").

Return JSON: { "optimizedCircuit": "string", "gatesRemoved": "integer", "explanationOfIdentityUsed": "string" }`;
}

// =========================================================================
// 4.12 Progress Tracking & Instructor Dashboard
// =========================================================================

/**
 * 4.12.A Instructor Insight Summary Prompt
 */
export function prompt4_12_A_InstructorInsight(aggregatedMetrics: any): string {
  return `Task: Summarize this class's real, already-computed performance data into actionable insight for an instructor.

Aggregated Class Metrics (deterministically computed, not to be recalculated or second-guessed by you):
${JSON.stringify(aggregatedMetrics)}
  (e.g. { "conceptAccuracy": { "entanglement": 0.42, "superposition": 0.81 },
          "commonCircuitErrors": [{ "gateType": "CNOT", "errorRate": 0.35 }],
          "examScoreTrend": [...] })

RULES:
1. Every claim you make MUST cite a specific number from aggregatedMetrics — do not describe a trend, strength, or weakness that isn't directly supported by the supplied data.
2. Flag the single lowest-performing concept as the top instructor priority, using the actual accuracy figure.
3. Suggest one concrete next action (e.g. "re-teach CNOT gate ordering before the next module").

Return JSON: { "summary": "string", "topPriorityConcept": "string", "citedMetric": "string", "suggestedAction": "string" }`;
}

/**
 * 4.12.B Learner Weak-Concept Detection Prompt
 */
export function prompt4_12_B_WeakConceptDetection(learnerEvents: any): string {
  return `Task: Identify this individual learner's weak concepts from their real event history.

Learner Event History (deterministically aggregated, not to be recalculated by you):
${JSON.stringify(learnerEvents)}

RULES:
1. Base weak-concept flags only on the supplied event history (repeated circuit-debugger errors on a concept, low quiz scores on a concept) — never infer a weakness with no supporting event.
2. Output flags in the exact shape Section 4.10.B expects as its progressData input.

Return JSON: { "weakConcepts": [{ "concept": "string", "supportingEventCount": "integer" }] }`;
}
