/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GateType =
  | 'H'
  | 'X'
  | 'Y'
  | 'Z'
  | 'S'
  | 'T'
  | 'Sdg'
  | 'Tdg'
  | 'Rx'
  | 'Ry'
  | 'Rz'
  | 'CX'
  | 'CZ'
  | 'SWAP'
  | 'CCX'
  | 'M';

export interface GatePlacement {
  id: string;
  type: GateType | string;
  qubit: number; // Primary or target qubit
  timeStep: number; // Column index (0 to N-1)
  controlQubit?: number; // For CX, CZ
  controlQubit2?: number; // For CCX (Toffoli)
  targetQubit?: number; // For SWAP
  param?: number; // Rotation angle theta in radians for Rx, Ry, Rz
}

export type Gate = GatePlacement;

export interface CircuitState {
  numQubits: number;
  timeSteps: number;
  gates: GatePlacement[];
  initialState?: number[]; // [0, 1] sets q[0]=|0⟩, q[1]=|1⟩
}

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface StatevectorComponent {
  index: number;
  binary: string;
  braKet: string;
  amplitude: ComplexNumber;
  magnitude: number;
  probability: number;
  phaseRad: number;
  phaseDeg: number;
}

export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
  theta: number; // polar angle [0, pi]
  phi: number; // azimuthal angle [-pi, pi]
  purity: number; // length of Bloch vector in [0, 1]
  isEntangled: boolean;
}

export interface SimulationResult {
  statevector: StatevectorComponent[];
  probabilities: Record<string, number>;
  blochSpheres: BlochCoordinates[];
  blochCoordinates?: BlochCoordinates[];
  verification?: VerificationReport;
  shotsSampled: Record<string, number>;
  totalShots: number;
  isNormalized: boolean;
  activeQubits: number;
  executionTimeMs: number;
}

export type QuantumBackend = 'qiskit' | 'pennylane' | 'cirq' | 'qbraid';

export interface VerificationReport {
  type: 'A' | 'B' | 'C' | 'D';
  method: string;
  confidence: number;
  verified: boolean;
  disclosure: string;
  crossSimulatorAgreement?: boolean;
  symbolicMatch?: boolean;
}

export interface CurriculumLesson {
  id: string;
  courseCode?: string;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
  durationMin: number;
  summary: string;
  concepts: string[];
  theoryHtml: string;
  mathematicalDerivations: string[];
  videoUrl?: string;
  imageUrl?: string;
  circuitPresetId?: string;
  
  // Learner Perspective
  prerequisites?: string[];
  learningObjectives?: string[];
  estimatedTime?: {
    readingMin: number;
    labMin: number;
    quizMin: number;
    totalMin: number;
  };
  xpReward?: number;
  badgeAwarded?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  realWorldUseCases?: string[];
  commonPitfalls?: string[];
  keyFormulas?: {
    name: string;
    latex: string;
    description: string;
  }[];
  sdkCodeSnippets?: {
    qiskit?: string;
    cirq?: string;
    pennylane?: string;
    openqasm?: string;
  };
  communityStats?: {
    enrolledCount: number;
    rating: number;
    reviewCount: number;
  };

  // Instructor Perspective
  instructor?: {
    name: string;
    title: string;
    institution: string;
    avatarUrl?: string;
    bio?: string;
  };
  accreditationMapping?: string;
  pedagogyNotes?: string;

  // Researcher Perspective
  hardwareTargets?: string[];
  noiseResilience?: 'Low' | 'Medium' | 'High' | 'Fault-Tolerant';
  academicCitations?: {
    authors: string;
    title: string;
    journal: string;
    year: number;
    doiOrArxiv: string;
  }[];
  quantumComplexity?: {
    timeComplexity: string;
    spaceComplexity: string;
    speedupType: 'Exponential' | 'Quadratic' | 'Polynomial' | 'Constant' | 'None';
  };
  formalProofLink?: {
    theoremName: string;
    lean4File: string;
  };

  // Accessibility Perspective
  voiceCommandAliases?: string[];
  closedCaptionsAvailable?: boolean;

  checkpointQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  targetGoal: string;
  numQubits: number;
  initialGates?: GatePlacement[];
  testCondition: (result: SimulationResult) => { passed: boolean; message: string };
  expectedStateDescription: string;
  hint: string;
}

export interface ResearchPaperItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  abstract: string;
  fullExcerpt: string;
  precomputedClaims: {
    claim: string;
    evidenceStatus: 'Available' | 'Partial' | 'Not Mentioned';
    sourceQuote: string | null;
    quoteVerified: boolean;
    notes: string;
  }[];
  openGaps: string[];
  leanTheoremExample: string;
}

// ==========================================
// SECTION 6: INTERNAL DATA CONTRACTS
// ==========================================

export interface UniversalVerifierSidecar {
  verificationType:
    | 'Type A - Deterministic Computational'
    | 'Type B - Grounded Search Consensus'
    | 'Type C - Adversarial Cross-Check'
    | 'Type D - Multi-Frame Visual Agreement'
    | string;
  method: string;
  verified: boolean;
  confidence: number;
  disclosure: string;
}

export interface QuantumCircuitDebuggerResult {
  analysisId: string;
  timestamp: string;
  circuitBreakerActive: boolean;
  targetGoal: string;
  isCorrect: boolean;
  errorLocalization?: {
    gateIndex: number;
    qubitIndex: number;
    errorType: string;
    actualOperation: string;
    expectedOperation: string;
    mathematicalImpact: string;
  };
  physicalExplanation: {
    intuition: string;
    braKetWalkthrough: string;
    phaseCancellationAnalysis: string;
  };
  stepByStepFix: {
    stepNumber: number;
    action: string;
    targetQubit: number;
    gateType: string;
    parameterValue?: number;
    rationale: string;
  }[];
  correctedCircuit: {
    format: 'openqasm' | 'qiskit' | 'cirq';
    code: string;
  };
  reflexionLog: {
    loopCount: number;
    iterations: {
      iteration: number;
      proposedFix: string;
      simulatedStateMatchesGoal: boolean;
      errorRemaining: string;
    }[];
  };
  verificationSidecar: UniversalVerifierSidecar;
}

export interface SimulationLabResult {
  simulationId: string;
  timestamp: string;
  frameworkExecuted: string;
  executionMode: 'ideal_statevector' | 'shot_sampling' | 'noisy_density_matrix';
  backendEngine: string;
  shots: number;
  seed?: number;
  measurementCounts?: Record<string, number>;
  circuitNotation?: string;
  explanation?: string;
  pythonCode?: string;
  result?: string;
  plotData?: any;
  verification?: {
    type: string;
    method: string;
    crossSimulatorAgreement?: boolean | null;
    symbolicMatch?: boolean | null;
    confidence: number;
    disclosure?: string;
    verified?: boolean;
  };
  parsedCircuit: {
    qubitCount: number;
    classicalBitCount: number;
    depth: number;
    gateCount: number;
    nonCliffordCount: number;
    TCount: number;
  };
  statevector: {
    dimension: number;
    amplitudes: {
      basisState: string;
      binaryLabel: string;
      real: number;
      imag: number;
      probability: number;
      phaseRadians: number;
      phaseDegrees: number;
    }[];
  };
  densityMatrix?: {
    dimension: number;
    isPure: boolean;
    trace: number;
    purity: number;
    vonNeumannEntropy: number;
    schmidtRank: number;
  };
  probabilities: Record<string, number>;
  blochVectors: {
    qubitIndex: number;
    x: number;
    y: number;
    z: number;
    theta: number;
    phi: number;
    purity: number;
  }[];
  entanglementAnalysis: {
    isEntangled: boolean;
    entangledPairs: {
      qubits: [number, number];
      concurrence: number;
      mutualInformation: number;
      ebitValue: number;
    }[];
  };
  exactSymbolicDerivation: {
    analyticalState: string;
    sympyExpression: string;
    stepByStepMatrixMultiplication: string[];
  };
  crossSimulatorAgreement: {
    qiskitAerAgreed: boolean;
    cirqAgreed: boolean;
    pennyLaneAgreed: boolean;
    maxNormDeviation: number;
    withinTolerance: boolean;
  };
  verificationSidecar: UniversalVerifierSidecar;
}

export interface PaperUnderstandingResult {
  paperMetadata: {
    title: string;
    authors: string[];
    publicationDate: string;
    arxivId?: string;
    doi?: string;
    conferenceOrJournal?: string;
    userRole: string;
  };
  claimEvidenceTable: {
    claimId: string;
    claimText: string;
    claimCategory: string;
    evidenceStatus: 'Supported' | 'Partially Supported' | 'Unsubstantiated' | 'Refuted';
    exactQuote: string | null;
    pageNumber?: number;
    section?: string;
    confidenceScore: number;
    auditorNote: string;
  }[];
  gapFlags: {
    gapId: string;
    title: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    affectedClaims: string[];
    suggestedFutureWork: string;
  }[];
  practiceDrills: {
    drillId: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    problemStatement: string;
    starterCircuitQASM: string;
    hints: string[];
    solutionQiskitCode: string;
    learningObjective: string;
  }[];
  latexTypesetting: {
    rawLatex: string;
    compiledSnippetUrl?: string;
    renderableTikzDiagram: string;
  };
  autoformalization: {
    leanTheoremDraft: string;
    mathlibImports: string[];
    typeCheckPassed: boolean;
    autoformalizationConfidence: number;
  };
  verificationSidecar: UniversalVerifierSidecar;
}

export interface LeanAutoformalizationResult {
  claimId: string;
  originalTextClaim: string;
  formalDomain: string;
  lean4Code: string;
  faithfulnessAudit: {
    isFaithful: boolean;
    droppedQuantifiers: string[];
    introducedAssumptions: string[];
    alignmentScore: number;
  };
  typeCheckResult: {
    compiledSuccessfully: boolean;
    compilerVersion: string;
    leanStderr: string | null;
    tacticsUsed: string[];
    sorryCount: number;
  };
  plainEnglishExplanation: string;
  verificationSidecar: UniversalVerifierSidecar;
}

export interface DiagramGeneratorResult {
  diagramId: string;
  timestamp: string;
  svgCode: string;
  tikzCode: string;
  labeling: {
    title: string;
    caption: string;
    conceptLink: string;
    callouts: {
      x: number;
      y: number;
      text: string;
      arrowDirection: 'top' | 'bottom' | 'left' | 'right';
    }[];
  };
  auditorReport: {
    wireCountMatches: boolean;
    unitaryValid: boolean;
    allGatesAligned: boolean;
    confidenceScore: number;
  };
  illustrativeImagenPrompt: string;
  verificationSidecar: UniversalVerifierSidecar;
}

export interface AsyncJobStatus {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressPercent: number;
  serviceName: string;
  createdAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface SystemStatus {
  circuitBreakers: {
    geminiService: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    simulatorEngine: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    leanCompiler: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  };
  semanticCache: {
    entriesCount: number;
    hitRatePercent: number;
    savedTokenCount: number;
  };
  rateLimiter: {
    tokensRemaining: number;
    maxTokens: number;
    resetInSeconds: number;
  };
  activeJobsCount: number;
}

// ==========================================
// SECTION 6.6: CURRICULUM MODULE AI SCHEMA
// ==========================================

export interface CurriculumSubLesson {
  lessonId: string;
  title: string;
  theoryMarkdown: string;   // KaTeX-enabled markdown
  requiredInteractiveCircuit?: {
    description: string;
    presetId?: string;
    numQubits: number;
  };
  checkpointQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CurriculumModuleAI {
  moduleId: string;
  title: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisiteModuleIds: string[];
  subLessons: CurriculumSubLesson[];
  verificationSidecar: UniversalVerifierSidecar;
}

// ==========================================
// SECTION 6.7: CIRCUIT OPTIMIZATION SCHEMA
// ==========================================

export interface CircuitOptimizationSuggestion {
  gateIndices: number[];      // gate IDs or positions to act on
  reason: string;             // human-readable justification
  action: 'remove' | 'replace' | 'optimize' | string;
  replacementGates?: string[]; // gate types to insert if action=replace
  unitaryPreserved?: boolean;  // AI asserts unitary is unchanged
}

export interface CircuitOptimizationResult {
  originalGateCount: number;
  optimizedGateCount: number;
  suggestions: CircuitOptimizationSuggestion[];
  transpiledCircuitJson: object | null; // full circuit JSON after applying all suggestions
  verificationSidecar: UniversalVerifierSidecar;
}

// ==========================================
// SECTION 6.8: PERSONALIZED PATH SCHEMA
// ==========================================

export interface RecommendedModule {
  moduleId: string;
  title: string;
  justification: string;
  priority: 'Remedial' | 'Next' | 'Stretch';
}

export interface PersonalizedPathResult {
  studentId: string;
  weaknessesIdentified: string[];
  strengthsIdentified: string[];
  recommendedModules: RecommendedModule[];
  generatedAt: string;
  verificationSidecar: UniversalVerifierSidecar;
}

// =========================================================================
// SECTION 6 EXACT CANONICAL DATA CONTRACTS (Sections 6.1 to 6.8)
// =========================================================================

/**
 * 6.1 Quantum Circuit Debugger Schema
 */
export interface CircuitDebuggerProblemSection6_1 {
  problem_statement: string;
  is_correct: boolean;
  error_location: {
    mode: 'pixel' | 'structural';
    ymin?: number;
    xmin?: number;
    ymax?: number;
    xmax?: number;
    gateIndex?: number;
    qubitIndex?: number;
    lineNumber?: number | null;
  };
  explanation: string;
  validation_check: {
    status: 'verified' | 'warning';
    confidence_score: number;
  };
  verification: {
    type: 'A' | 'D' | string;
    method: 'fix-and-reexecute' | 'vision-pointing' | string;
    reexecutionConfirmed: boolean | null;
    confidence: number;
  };
}

export interface CircuitDebuggerResultSection6_1 {
  problems: CircuitDebuggerProblemSection6_1[];
}

/**
 * 6.2 Quantum Simulation Lab Schema
 */
export interface SimulationLabResultSection6_2 {
  circuitNotation?: string;
  explanation: string;
  pythonCode: string;
  result: string;
  plotData: any;
  verification: {
    type: 'A' | 'B';
    method: 'exact-symbolic-check' | 'cross-simulator-agreement' | 'cross-simulator-agreement+exact-symbolic-check' | string;
    crossSimulatorAgreement: boolean | null;
    symbolicMatch: boolean | null;
    confidence: number;
    disclosure: string;
  };
}

/**
 * 6.3 Quantum Paper Understanding Agent Schema
 */
export interface PaperUnderstandingResultSection6_3 {
  claimEvidenceTable: {
    claim: string;
    evidenceStatus: 'Available' | 'Partial' | 'Not Mentioned';
    sourceQuote: string | null;
    quoteVerified: boolean;
    notes: string;
  }[];
  gapFlags: {
    question: string;
    relatedClaim: string;
    status: string;
  }[];
  missingSources: {
    description: string;
    reasonInaccessible: string;
  }[];
  conceptEvidenceMap: any;
  suggestedKeywords: string[];
  plainLanguageSummary: string;
}

/**
 * 6.4 Universal Verifier Sidecar (attached to every agent's output)
 */
export interface UniversalVerifierSidecarSection6_4 {
  verification: {
    type: 'A' | 'B' | 'C' | 'D';
    method: 'exact-execution' | 'cross-simulator-agreement' | 'quote-matched-citation' | 'rubric-scored' | 'compiler-verified' | 'lean-type-check' | 'multi-frame-agreement' | 'unverifiable' | string;
    confidence: number;
    verified: boolean;
    disclosure: string;
  };
}

/**
 * 6.5 Formal Logic Verifier (Lean Autoformalization) Schema
 */
export interface LeanVerifierResultSection6_5 {
  formalizable: boolean;
  reason: string | null;
  leanTheorem: string | null;
  faithfulnessCheck: {
    faithful: boolean;
    discrepancy: string | null;
  };
  typeCheckResult: {
    passed: boolean;
    compilerErrorLog: string | null;
    repairAttemptsUsed: number;
  };
  studentFacingExplanation: string;
  verification: {
    type: 'A';
    method: 'lean-type-check';
    verified: boolean;
    confidence: number;
  };
}

/**
 * 6.6 Quantum Curriculum & Learning Path Schema
 */
export interface CurriculumModuleResultSection6_6 {
  moduleTitle: string;
  sections: {
    heading: string;
    content: string;
    interactiveExampleSpecs: {
      description: string;
      targetFeature: '4.2' | '4.3' | string;
    }[];
  }[];
  selfCheckQuestion: string;
  recommendedModules: {
    moduleTopic: string;
    reason: string;
    triggeringMetric: string;
  }[];
}

/**
 * 6.7 Quantum Circuit Designer & Optimization Schema
 */
export interface CircuitDesignerOptimizationResultSection6_7 {
  circuitGraph: any;
  optimizedCircuit: string | null;
  gatesRemoved: number | null;
  explanationOfIdentityUsed: string | null;
  optimizationVerification: {
    reexecutedAgainstOriginal: boolean;
    resultsIdentical: boolean;
  };
  collaborativeSession: {
    sessionId: string | null;
    activeParticipants: (string | null)[];
  };
  verification: {
    type: 'A';
    method: 'reexecution-confirmed-optimization';
    confidence: number;
  };
}

/**
 * 6.8 Progress Tracking & Instructor Dashboard Schema
 */
export interface ProgressTrackingDashboardResultSection6_8 {
  aggregatedClassMetrics: {
    conceptAccuracy: Record<string, number>;
    commonCircuitErrors: { gateType: string; errorRate: number }[];
    examScoreTrend: any[];
  };
  instructorSummary: {
    summary: string;
    topPriorityConcept: string;
    citedMetric: string;
    suggestedAction: string;
  };
  learnerWeakConcepts: {
    concept: string;
    supportingEventCount: number;
  }[];
  verification: {
    type: string;
    confidence: number;
  };
}

