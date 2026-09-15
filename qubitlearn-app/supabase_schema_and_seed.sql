-- =========================================================================
-- SUPABASE POSTGRESQL SCHEMA & SEED FOR QUBITLEARN AI
-- Multi-Perspective Schema: Learner, Instructor, Researcher, Accessibility
-- =========================================================================

-- 1. Users & Profiles
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    role TEXT DEFAULT 'student', -- 'student' | 'instructor' | 'researcher'
    xp_points INTEGER DEFAULT 0,
    badges_json JSONB DEFAULT '[]'::jsonb,
    accessibility_json JSONB DEFAULT '{"highContrast": false, "voiceInput": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Multi-Perspective Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    course_code TEXT UNIQUE NOT NULL, -- e.g. 'QC-101'
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    level TEXT NOT NULL, -- 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
    category TEXT,
    
    -- Learner Perspective
    prerequisites_json JSONB DEFAULT '[]'::jsonb,
    learning_objectives_json JSONB DEFAULT '[]'::jsonb,
    estimated_time_json JSONB DEFAULT '{"readingMin": 15, "labMin": 20, "quizMin": 5, "totalMin": 40}'::jsonb,
    xp_reward INTEGER DEFAULT 150,
    badge_awarded_json JSONB,
    real_world_use_cases_json JSONB DEFAULT '[]'::jsonb,
    common_pitfalls_json JSONB DEFAULT '[]'::jsonb,
    key_formulas_json JSONB DEFAULT '[]'::jsonb,
    community_stats_json JSONB DEFAULT '{"enrolledCount": 1200, "rating": 4.9, "reviewCount": 150}'::jsonb,
    
    -- Instructor Perspective
    instructor_json JSONB,
    accreditation_mapping TEXT,
    pedagogy_notes TEXT,
    
    -- Researcher & Hardware Perspective
    hardware_targets_json JSONB DEFAULT '[]'::jsonb,
    noise_resilience TEXT,
    academic_citations_json JSONB DEFAULT '[]'::jsonb,
    quantum_complexity_json JSONB,
    formal_proof_json JSONB,
    
    -- Accessibility Perspective
    voice_command_aliases_json JSONB DEFAULT '[]'::jsonb,
    closed_captions_available BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course Modules Table
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lessons Table (with Multi-SDK code snippets & verified video/image embeds)
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
    course_code TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    level TEXT,
    duration_min INTEGER DEFAULT 15,
    summary TEXT,
    concepts_json JSONB DEFAULT '[]'::jsonb,
    content_mdx TEXT NOT NULL,
    video_url TEXT,
    image_url TEXT,
    circuit_preset_id TEXT,
    sdk_code_snippets_json JSONB DEFAULT '{}'::jsonb,
    mathematical_derivations_json JSONB DEFAULT '[]'::jsonb,
    checkpoint_questions_json JSONB DEFAULT '[]'::jsonb,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Interactive Practice Challenges Table
CREATE TABLE IF NOT EXISTS practices (
    id TEXT PRIMARY KEY,
    lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_goal TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    num_qubits INTEGER DEFAULT 2,
    initial_circuit_json JSONB DEFAULT '[]'::jsonb,
    expected_state_desc TEXT,
    hints_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Learner Progress & Session History
CREATE TABLE IF NOT EXISTS learner_progress (
    user_id TEXT PRIMARY KEY,
    completed_lessons_json JSONB DEFAULT '[]'::jsonb,
    completed_challenges_json JSONB DEFAULT '[]'::jsonb,
    quiz_scores_json JSONB DEFAULT '{}'::jsonb,
    total_points INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Granular Learner Telemetry Events (for Recommendation Engine Section 7.12)
CREATE TABLE IF NOT EXISTS learner_progress_events (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    topic TEXT,
    concept_tag TEXT,
    score_pct REAL,
    time_spent_sec INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_events_user_created ON learner_progress_events(user_id, created_at DESC);

-- 8. Saved Circuits
CREATE TABLE IF NOT EXISTS circuits (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    json_graph JSONB NOT NULL,
    qiskit_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- SEED INITIAL DATA FOR ALL 20 COURSES (Multi-Perspective)
-- =========================================================================

INSERT INTO courses (id, course_code, title, subtitle, description, level, category, prerequisites_json, learning_objectives_json, xp_reward, real_world_use_cases_json, hardware_targets_json, instructor_json)
VALUES 
('c1', 'QC-101', '1. Introduction to Quantum Mechanics', 'From Classical Bits to Complex Hilbert Spaces', 'Foundational physical and mathematical principles of quantum computation.', 'Beginner', 'Foundations', '["Linear Algebra Basics", "Complex Numbers"]'::jsonb, '["Derive statevectors in C^2", "Calculate Born rule probabilities", "Represent states on Bloch sphere"]'::jsonb, 150, '["Quantum Key Distribution", "QRNG"]'::jsonb, '["IBM Quantum Eagle", "IonQ Forte"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c2', 'QC-102', '2. Qubits and Superposition', 'Linear Combinations and Coherent Relative Phases', 'Understanding probability amplitudes and phase degrees of freedom.', 'Beginner', 'Foundations', '["QC-101"]'::jsonb, '["Construct superposition via Hadamard", "Calculate phase interference"]'::jsonb, 150, '["True Quantum Random Number Generation"]'::jsonb, '["IBM Quantum Heron", "Quantinuum H2"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c3', 'QC-103', '3. Single Qubit Gates', 'Pauli Group, Phase Rotations, and Reversible Unitarity', 'Comprehensive unitary matrix algebra for 1-qubit manipulation.', 'Beginner', 'Quantum Logic', '["QC-102", "Matrix Multiplication"]'::jsonb, '["Prove U*U^dagger = I", "Decompose arbitrary rotations into Euler angles"]'::jsonb, 200, '["Dynamical Decoupling", "Pulse Calibration"]'::jsonb, '["Rigetti Ankaa-2", "IBM Eagle"]'::jsonb, '{"name": "Dr. Sarah Lin", "title": "Hardware Lead", "institution": "Quantum Research Institute"}'::jsonb),
('c4', 'QC-201', '4. Entanglement & Multi-Qubit Systems', 'Bell Basis States, Non-Locality, and EPR Pairs', 'Tensor products, CNOT entanglers, and Tsirelson bound correlations.', 'Beginner', 'Entanglement', '["QC-103", "Kronecker Products"]'::jsonb, '["Construct all 4 Bell states", "Explain EPR non-locality and Bell inequalities"]'::jsonb, 300, '["Superdense Coding", "Quantum Teleportation", "DI-QKD"]'::jsonb, '["IBM Quantum Eagle", "IonQ Aria"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c5', 'QC-202', '5. Quantum Measurements', 'Wavefunction Collapse, Density Matrices & POVMs', 'Projective measurements in arbitrary basis and partial trace reductions.', 'Beginner', 'Measurement', '["QC-201"]'::jsonb, '["Calculate density matrices rho = |psi><psi|", "Perform partial trace on entangled subsystems"]'::jsonb, 250, '["State Tomography", "Quantum Error Verification"]'::jsonb, '["Quantinuum H1", "Google Sycamore"]'::jsonb, '{"name": "Dr. Sarah Lin", "title": "Hardware Lead", "institution": "Quantum Research Institute"}'::jsonb),
('c6', 'QC-203', '6. Quantum Teleportation', 'State Transfer via Classical Channels & Shared EPR Pairs', 'Exact protocol walkthrough of transferring unknown quantum states.', 'Intermediate', 'Protocols', '["QC-201", "QC-202"]'::jsonb, '["Implement 3-qubit teleportation circuit", "Verify no-cloning theorem preservation"]'::jsonb, 350, '["Quantum Repeater Networks", "Distributed Quantum Computing"]'::jsonb, '["IBM Heron", "IonQ Forte"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c7', 'QC-204', '7. Superdense Coding', 'Transmitting 2 Classical Bits per 1 Entangled Qubit', 'Dense information packing using Pauli operations on EPR pairs.', 'Intermediate', 'Protocols', '["QC-201"]'::jsonb, '["Encode 2 classical bits with single-qubit Pauli gate", "Decode using CNOT + H in Bell basis"]'::jsonb, 300, '["High-Throughput Quantum Comms"]'::jsonb, '["IBM Quantum Eagle"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c8', 'QC-301', '8. Deutsch-Jozsa Algorithm', 'First Deterministic Exponential Quantum Speedup', 'Evaluating global properties of boolean functions in 1 query via phase kickback.', 'Intermediate', 'Algorithms', '["QC-201", "Phase Kickback"]'::jsonb, '["Construct phase oracle U_f", "Differentiate constant vs balanced functions in 1 query"]'::jsonb, 400, '["Query Complexity Proofs", "Supremacy Benchmarks"]'::jsonb, '["IBM Quantum Heron", "Quantinuum H2"]'::jsonb, '{"name": "Dr. David Deutsch", "title": "Quantum Pioneer", "institution": "Oxford University"}'::jsonb),
('c9', 'QC-302', '9. Bernstein-Vazirani Algorithm', 'Finding Hidden Bit Strings with O(1) Queries', 'Extracting an n-bit secret string in 1 query vs O(n) classically.', 'Intermediate', 'Algorithms', '["QC-301"]'::jsonb, '["Implement scalar product oracle f(x) = s.x", "Extract full secret bitstring in 1 shot"]'::jsonb, 350, '["Quantum Database Indexing", "Function Identification"]'::jsonb, '["Rigetti Ankaa", "IonQ Aria"]'::jsonb, '{"name": "Prof. Umesh Vazirani", "title": "Professor", "institution": "UC Berkeley"}'::jsonb),
('c10', 'QC-303', '10. Grover''s Search Algorithm', 'Quadratic Speedup for Unstructured Database Search', 'Amplitude amplification, oracle phase flips, and diffusion inversion about the mean.', 'Intermediate', 'Algorithms', '["QC-301", "Geometric Reflections"]'::jsonb, '["Derive pi/4 * sqrt(N) iteration count", "Construct multi-qubit diffusion operator"]'::jsonb, 500, '["Database Search", "Cryptographic Hash Inversion", "SAT Solvers"]'::jsonb, '["IBM Quantum Heron", "IonQ Forte"]'::jsonb, '{"name": "Dr. Lov Grover", "title": "Distinguished Scientist", "institution": "Bell Labs"}'::jsonb),
('c11', 'QC-401', '11. Quantum Fourier Transform (QFT)', 'Discrete Fourier Transform in O(n^2) Quantum Gates', 'Basis change from computational to Fourier basis via controlled phase rotations.', 'Advanced', 'Fourier Analysis', '["QC-201", "Euler Formulas"]'::jsonb, '["Construct QFT circuit using Hadamard and Controlled-R_k gates", "Prove exponential gate reduction vs classical FFT"]'::jsonb, 450, '["Period Finding", "Phase Estimation", "Signal Processing"]'::jsonb, '["IBM Eagle", "Quantinuum H2"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c12', 'QC-402', '12. Quantum Phase Estimation (QPE)', 'Extracting Unitary Eigenvalues to High Precision', 'Using inverse QFT and controlled-U powers to extract eigenphases.', 'Advanced', 'Algorithms', '["QC-401", "Unitary Diagonalization"]'::jsonb, '["Construct QPE circuit with t counting qubits", "Analyze error bounds and phase resolution"]'::jsonb, 500, '["Molecular Energy Calculations", "Shor Factoring"]'::jsonb, '["Quantinuum H1", "IBM Heron"]'::jsonb, '{"name": "Prof. Ronald de Wolf", "title": "Professor", "institution": "CWI / Univ. of Amsterdam"}'::jsonb),
('c13', 'QC-501', '13. Shor''s Algorithm', 'Polynomial-Time Integer Factoring & Discrete Logarithms', 'Breaking RSA encryption using period finding via QPE and continued fractions.', 'Expert', 'Algorithms', '["QC-402", "Modular Arithmetic", "Continued Fractions"]'::jsonb, '["Construct modular exponentiation circuit a^x mod N", "Extract order r using QFT and continued fractions"]'::jsonb, 1000, '["Post-Quantum Cryptography", "RSA Vulnerability Analysis"]'::jsonb, '["Fault-Tolerant Logical Qubits"]'::jsonb, '{"name": "Prof. Peter Shor", "title": "Morss Professor of Applied Mathematics", "institution": "MIT"}'::jsonb),
('c14', 'QC-403', '14. Variational Quantum Eigensolver (VQE)', 'NISQ Hybrid Quantum-Classical Chemistry Algorithm', 'Finding ground state molecular energies with shallow parameterized ansätze.', 'Advanced', 'NISQ Algorithms', '["QC-201", "Expectation Values", "Classical Optimizers (COBYLA/SPSA)"]'::jsonb, '["Map molecular Hamiltonian to Pauli strings (Jordan-Wigner)", "Implement hardware-efficient ansatz and optimize parameters"]'::jsonb, 600, '["Drug Discovery", "Catalyst Design", "Battery Chemistry"]'::jsonb, '["IBM Quantum Heron", "Google Sycamore"]'::jsonb, '{"name": "Dr. Alán Aspuru-Guzik", "title": "Professor of Chemistry & CS", "institution": "Univ. of Toronto"}'::jsonb),
('c15', 'QC-404', '15. Quantum Approximate Optimization (QAOA)', 'Combinatorial Graph Optimization on Near-Term Devices', 'Alternating cost and mixer Hamiltonian unitary evolution for MaxCut.', 'Advanced', 'NISQ Algorithms', '["QC-403", "Graph Theory (MaxCut)"]'::jsonb, '["Formulate Ising Hamiltonian from graph adjacency matrix", "Optimize gamma and beta angles for p layers"]'::jsonb, 600, '["Portfolio Optimization", "Logistics Routing", "Scheduling"]'::jsonb, '["Quantinuum H2", "Rigetti Ankaa"]'::jsonb, '{"name": "Dr. Edward Farhi", "title": "Senior Theorist", "institution": "MIT / Google"}'::jsonb),
('c16', 'QC-502', '16. Quantum Error Correction', 'Stabilizer Codes, Syndrome Measurements & Surface Codes', 'Protecting fragile quantum information against bit-flip and phase-flip errors.', 'Expert', 'Fault Tolerance', '["QC-201", "Group Theory", "Pauli Stabilizers"]'::jsonb, '["Implement 3-qubit bit flip code", "Construct 9-qubit Shor code and surface code lattice"]'::jsonb, 900, '["Fault-Tolerant Quantum Computing"]'::jsonb, '["Google Sycamore (Logical Qubits)", "Quantinuum H2"]'::jsonb, '{"name": "Prof. John Preskill", "title": "Richard P. Feynman Professor", "institution": "Caltech"}'::jsonb),
('c17', 'QC-304', '17. Quantum Key Distribution (BB84)', 'Information-Theoretically Secure Cryptography', 'Using non-orthogonal photon polarization states and eavesdropper detection.', 'Intermediate', 'Cryptography', '["QC-101", "Measurement Collapse"]'::jsonb, '["Implement BB84 protocol with random basis choice", "Calculate Quantum Bit Error Rate (QBER) to detect Eve"]'::jsonb, 400, '["Government & Banking Secret Comms", "Quantum Satellite Links"]'::jsonb, '["Photonic Quantum Hardware"]'::jsonb, '{"name": "Dr. Charles Bennett & Dr. Gilles Brassard", "title": "Founders of Quantum Cryptography", "institution": "IBM Research & Univ. de Montréal"}'::jsonb),
('c18', 'QC-405', '18. Quantum Machine Learning (QML)', 'Quantum Neural Networks, QSVM & Kernel Methods', 'Encoding classical data into Hilbert space for enhanced classification.', 'Advanced', 'AI & Machine Learning', '["QC-403", "Machine Learning (SVM, Neural Nets)"]'::jsonb, '["Construct ZZFeatureMap for non-linear data embedding", "Train Variational Quantum Classifier (VQC) with PyTorch"]'::jsonb, 700, '["Financial Fraud Detection", "Medical Image Classification", "Genomics"]'::jsonb, '["IBM Quantum Eagle", "PennyLane Cloud"]'::jsonb, '{"name": "Dr. Maria Schuld", "title": "Senior QML Researcher", "institution": "Xanadu / Univ. of KwaZulu-Natal"}'::jsonb),
('c19', 'QC-503', '19. Hardware: Superconducting Qubits', 'Transmon Design, Josephson Junctions & Microwaves', 'Physical engineering of superconducting LC circuits and dispersive readout.', 'Expert', 'Hardware Engineering', '["Circuit QED", "Superconductivity Basics"]'::jsonb, '["Explain Josephson inductance non-linearity", "Analyze T1 relaxation and T2 dephasing mechanisms"]'::jsonb, 800, '["IBM, Google, Rigetti Superconducting Foundries"]'::jsonb, '["Cryogenic Dilution Refrigerators (15 mK)"]'::jsonb, '{"name": "Dr. Sarah Lin", "title": "Hardware Lead", "institution": "Quantum Research Institute"}'::jsonb),
('c20', 'QC-504', '20. Hardware: Trapped Ion Qubits', 'Laser Cooling, Phonon Motional Modes & Mølmer–Sørensen Gates', 'Atomic physics of Ytterbium and Barium ions in Paul traps.', 'Expert', 'Hardware Engineering', '["Atomic Physics Basics", "Laser Optics"]'::jsonb, '["Explain Doppler and Raman sideband cooling", "Implement Mølmer–Sørensen two-qubit entangling gates"]'::jsonb, 800, '["IonQ, Quantinuum, Alpine Quantum Technologies"]'::jsonb, '["Ultra-High Vacuum Ion Traps"]'::jsonb, '{"name": "Dr. Chris Monroe", "title": "Co-founder & Professor", "institution": "IonQ & Duke University"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  course_code = EXCLUDED.course_code,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  category = EXCLUDED.category,
  prerequisites_json = EXCLUDED.prerequisites_json,
  learning_objectives_json = EXCLUDED.learning_objectives_json,
  xp_reward = EXCLUDED.xp_reward,
  real_world_use_cases_json = EXCLUDED.real_world_use_cases_json,
  hardware_targets_json = EXCLUDED.hardware_targets_json,
  instructor_json = EXCLUDED.instructor_json;
