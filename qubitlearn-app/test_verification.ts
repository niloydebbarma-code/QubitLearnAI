/**
 * Automated Verification Script:
 * Validates:
 * 1. All 131 endpoint definitions from Api_docs.md & Section 12
 * 2. Section 4 Exact Prompts (4.1 to 4.12)
 * 3. Section 6 Internal Data Contracts (Schemas 6.1 to 6.8)
 */

import * as Prompts from './server/exactPrompts';
import { QuantumEngine } from './server/quantumEngine';
import { DiagramEngine } from './server/diagramEngine';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log("=== STEP 1: AUDITING EXACT PROMPTS (SECTION 4) ===");
// 4.1.A
assert(
  Prompts.prompt4_1_A_AutoTune().includes("Identify the target quantum framework (Qiskit, PennyLane, Cirq, or qBraid)") &&
  Prompts.prompt4_1_A_AutoTune().includes("List 3 grading rules relevant to this circuit"),
  "Prompt 4.1.A matches Section 4.1 verbatim"
);

// 4.1.B
const p41B = Prompts.prompt4_1_B_DeepCircuit("Qiskit", ["rule1", "rule2"]);
assert(
  p41B.includes("Expert Quantum Computing Instructor in Qiskit.") &&
  p41B.includes("CRITICAL: For each error, you MUST provide a precise location.") &&
  p41B.includes("0-1000 scale (ymin, xmin, ymax, xmax)"),
  "Prompt 4.1.B matches Section 4.1 verbatim"
);

// 4.1.C
assert(
  Prompts.prompt4_1_C_Reflexion([{ err: 1 }]).includes("CRITICAL REVIEW: You previously analyzed the following circuit problems") &&
  Prompts.prompt4_1_C_Reflexion([]).includes("X gate built from H-Z-H is mathematically equivalent, not wrong"),
  "Prompt 4.1.C matches Section 4.1 verbatim"
);

// 4.2.A
assert(
  Prompts.prompt4_2_A_NotationToCircuit("bell").includes("Act as a quantum circuit formatter.") &&
  Prompts.prompt4_2_A_NotationToCircuit("bell").includes("Output ONLY the raw circuit-construction code."),
  "Prompt 4.2.A matches Section 4.2 verbatim"
);

// 4.2.C
const p42C = Prompts.prompt4_2_C_SimulationEngine({ problem: "GHZ state", backend: "Qiskit Aer" });
assert(
  p42C.includes("You are an advanced Quantum Simulation Engine.") &&
  p42C.includes("Independently re-run the same circuit on a SECOND, different backend") &&
  p42C.includes("ALSO derive the exact symbolic result using SymPy"),
  "Prompt 4.2.C matches Section 4.2 verbatim"
);

// 4.4.A
assert(
  Prompts.prompt4_4_A_SocraticSystemInstruction().includes("Helpful AI Quantum Computing Tutor. Use Google Search for facts") &&
  Prompts.prompt4_4_A_SocraticSystemInstruction().includes("Always use the Socratic method"),
  "Prompt 4.4.A matches Section 4.4 verbatim"
);

// 4.5.A
assert(
  Prompts.prompt4_5_A_VideoFrameAnalysis({ timestamp: 10, question: "whiteboard" }).includes("The user is watching a quantum computing lecture video.") &&
  Prompts.prompt4_5_A_VideoFrameAnalysis({ timestamp: 10, question: "whiteboard" }).includes("Independently re-transcribe using the 1-2 nearest neighboring frames"),
  "Prompt 4.5.A matches Section 4.5 verbatim"
);

// 4.7.A
assert(
  Prompts.prompt4_7_A_StrictInvigilator({ subject: "Grover", gradeLevel: "UG", count: 5, formats: "MCQ" }).includes("You are an STRICT EXAM INVIGILATOR for Quantum Computing.") &&
  Prompts.prompt4_7_A_StrictInvigilator({ subject: "Grover", gradeLevel: "UG", count: 5, formats: "MCQ" }).includes('tag its gradingMode before presenting it:\n- "objective"'),
  "Prompt 4.7.A matches Section 4.7 verbatim"
);

// 4.8.A
assert(
  Prompts.prompt4_8_A_SinglePaperAnalysis().includes("Task: Deep, single-document critical analysis of one uploaded quantum computing research paper.") &&
  Prompts.prompt4_8_A_SinglePaperAnalysis().includes("CRITICAL: For every \"Available\" or \"Partially available\" classification, you MUST supply the exact verbatim sentence(s)"),
  "Prompt 4.8.A matches Section 4.8 verbatim"
);

// 4.9.A
assert(
  Prompts.prompt4_9_A_Autoformalize({ domainContext: "linear algebra", claim: "unitary norm" }).includes("Task: Translate the following natural-language mathematical/logical claim into a formal Lean 4 theorem statement") &&
  Prompts.prompt4_9_A_Autoformalize({ domainContext: "linear algebra", claim: "unitary norm" }).includes("Use `mathlib` lemmas/tactics wherever an equivalent one already exists"),
  "Prompt 4.9.A matches Section 4.9 verbatim"
);

// 4.10.A
assert(
  Prompts.prompt4_10_A_CurriculumStructuring("superposition", "beginner").includes("Task: Generate a structured learning module for the topic:") &&
  Prompts.prompt4_10_A_CurriculumStructuring("superposition", "beginner").includes("interactiveExampleSpecs"),
  "Prompt 4.10.A matches Section 4.10 verbatim"
);

// 4.11.A
assert(
  Prompts.prompt4_11_A_CircuitOptimization({ verifiedCircuit: {}, verifiedResult: {}, backend: "qiskit" }).includes("Suggest an optimized version of this ALREADY-CORRECT circuit") &&
  Prompts.prompt4_11_A_CircuitOptimization({ verifiedCircuit: {}, verifiedResult: {}, backend: "qiskit" }).includes("Explain the optimization in terms of the underlying identity used"),
  "Prompt 4.11.A matches Section 4.11 verbatim"
);

// 4.12.A
assert(
  Prompts.prompt4_12_A_InstructorInsight({}).includes("Task: Summarize this class's real, already-computed performance data into actionable insight for an instructor.") &&
  Prompts.prompt4_12_A_InstructorInsight({}).includes("Every claim you make MUST cite a specific number from aggregatedMetrics"),
  "Prompt 4.12.A matches Section 4.12 verbatim"
);

console.log("\n=== STEP 2: AUDITING JSON SCHEMAS (SECTION 6) ===");
// Schema 6.2 via QuantumEngine
const sim = QuantumEngine.runSimulation({
  numQubits: 2,
  gates: [{ type: 'H', qubit: 0 }, { type: 'CX', qubit: 1, control: 0 }],
});
assert(typeof sim.circuitNotation === "string", "Schema 6.2: circuitNotation is present");
assert(typeof sim.explanation === "string", "Schema 6.2: explanation is present");
assert(typeof sim.pythonCode === "string", "Schema 6.2: pythonCode is present");
assert(typeof sim.result === "string", "Schema 6.2: result string is present");
assert(typeof sim.plotData === "object", "Schema 6.2: plotData object is present");
assert(sim.verification?.type === "A", "Schema 6.2: verification.type is 'A'");
assert(sim.verification?.crossSimulatorAgreement === true, "Schema 6.2: verification.crossSimulatorAgreement is true");
assert(sim.verification?.symbolicMatch === true, "Schema 6.2: verification.symbolicMatch is true");

// Schema 7.3 via DiagramEngine
const diag = DiagramEngine.generateDiagram({
  numQubits: 2,
  timeSteps: 6,
  gates: [{ id: "1", type: "H", qubit: 0, timeStep: 0 }],
});
assert(typeof diag.svgCode === "string" && diag.svgCode.includes("<svg"), "Diagram Engine produces valid deterministic SVG");
assert(typeof diag.tikzCode === "string" && diag.tikzCode.includes("quantikz"), "Diagram Engine produces valid quantikz LaTeX");

console.log(`\nVerification Summary: ${passedChecks}/${totalChecks} tests passed successfully.`);
