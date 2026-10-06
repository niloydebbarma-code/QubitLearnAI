<div align="center">

<img src="project_documents/readme_banner.svg" alt="QubitLearn AI" width="100%" />

<br/><br/>

[![Demonstration Video](https://img.shields.io/badge/Demo%20Video-Watch%20on%20YouTube-dc2626?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/1YdqxLEdkoQ?si=pOfLQWTAeqO7cJRy)
[![Architecture PDF](https://img.shields.io/badge/Architecture-System%20Report-09479e?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](project_documents/System_Architecture_and_Verification_Report.pdf)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](#-docker-quickstart)
[![Test Suite](https://img.shields.io/badge/Tests-113%20Core%20Tests%20Passed-15803d?style=for-the-badge)](project_documents/Test_Results.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Overview & Key Links

**QubitLearn AI** is an interactive quantum computing and algorithm education platform designed to make quantum concepts practical and verifiable for learners. 

By pairing an **in-browser statevector simulation engine (<2ms up to 10 qubits, supporting up to 15 qubits in browser)** with **server-side microVM execution for high-qubit workloads (138ms cold-boot)**, **multimodal spatial vision for circuit error localization**, and a **4-Tier AI Trust Framework backed by Lean 4 theorem proving**, the platform helps students move from abstract linear algebra to validated quantum circuit implementation.

* 📺 **Project Demonstration Video:** [https://youtu.be/1YdqxLEdkoQ?si=pOfLQWTAeqO7cJRy](https://youtu.be/1YdqxLEdkoQ?si=pOfLQWTAeqO7cJRy)
* 📑 **System Architecture & Formal Bounds:** [`project_documents/System_Architecture_and_Verification_Report.pdf`](project_documents/System_Architecture_and_Verification_Report.pdf)
* 🔬 **113-Test Suite Audit Report:** [`project_documents/Test_Results.md`](project_documents/Test_Results.md)
* 📚 **Official Bibliography & Citation Index:** [`project_documents/REFERENCES.md`](project_documents/REFERENCES.md)
* 📐 **Multi-SDK Giallar Formal Proof Theory:** [`project_documents/Giallar_Multi_SDK_Universal_Verification_Architecture.md`](project_documents/Giallar_Multi_SDK_Universal_Verification_Architecture.md)
* ☁️ **Cloud Runtime & VM Specifications:** [`project_documents/Cloud_VM_and_Runtime_Architecture.md`](project_documents/Cloud_VM_and_Runtime_Architecture.md)

---

## 🔍 Context & Educational Objectives

### 1. Bridging the Theory-to-Practice Gap
While thousands of engineering students learn quantum mechanics, textbook instruction frequently centers on abstract matrix algebra ($2^n \times 2^n$) without accessible, immediate simulation tools (*arXiv:2108.01311*). QubitLearn AI provides instant visual feedback and step-by-step state tracking on standard student laptops.

### 2. Addressing AI Quantum Code Generation Errors
Empirical benchmarks from **QuanBench** (*arXiv:2510.16779*) indicate that generic Large Language Models show $>60\%$ error rates on quantum algorithm synthesis, generating invalid gate orders, phase inversions, and broken AST mappings. QubitLearn AI mitigates these issues through formal mathematical checks and automated unit tests.

### 3. Curriculum & Workforce Alignment
The platform is structured to support practical units from the **AICTE QT-03 Quantum Technologies Curriculum** and aligns with the workforce goals of India's **National Quantum Mission (NQM 2030)**, aiming to train 100,000+ engineers and developers in vendor-neutral quantum programming.

---

## 🏛️ System Architecture

QubitLearn AI organizes quantum education into three complementary tiers:

```text
+=============================================================================================+
| [Layer 3] MicroVM Sandbox Tier                                                             |
| • Firecracker Linux KVM Sandbox Execution (Pre-warmed snapshots, memory isolation)          |
+=============================================================================================+
                                              ▲
                                              │  AST Invariant Dispatch
+=============================================================================================+
| [Layer 2] AI Reasoning & Formal Logic Tier                                                  |
| • Google Gemini on Vertex AI (2D Bounding-Box Error Localization on Circuit Graphs)         |
| • Lean 4 Dependent Type Proof Kernel (Autoformalization & 20 Giallar AST Rewrite Rules)      |
| • Universal Multi-SDK Transpiler (IBM Qiskit, Google Cirq, Xanadu PennyLane, OpenQASM)     |
+=============================================================================================+
                                              ▲
                                              │  State Invariant Match
+=============================================================================================+
| [Layer 1] Quantum Simulation Engine Tier                                                    |
| • Client-Side In-Memory Statevector Engine (<2ms Latency for circuits up to 15 qubits)      |
| • Memory bounds management routing larger circuits to server-side sandboxes                 |
+=============================================================================================+
```

---

## ⚡ Technical Workflow

```text
 [ Student Web Interface ]
 (Interactive Circuit Studio, Code Editor, Bloch Sphere, Mathematical Analysis)
         │
         ▼  (HTTP / WebSocket Protocol)
 [ API Gateway & Router ]
         │
         ├───► [ 1. In-Browser Statevector Engine (|ψ⟩) ] ── Real-time matrix simulation (<2ms)
         ├───► [ 2. Multimodal Spatial Vision ]          ── 2D Bounding-Box Error Localization
         ├───► [ 3. Universal Multi-SDK Transpiler ]     ── Bidirectional AST (Qiskit, Cirq, PennyLane)
         ├───► [ 4. Firecracker Linux KVM MicroVM ]      ── Isolated Sandbox (<140ms cold-boot)
         └───► [ 5. Formal Logic Verifier (Lean 4) ]     ── State Invariant Checking (20 Giallar Rules)
                                                               │
                                                               ▼
                                                    [ State Verification Gate ]
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         ▼ (Verified)                                ▼ (Diagnostic)
                                [ Active State Display ]                    [ Socratic AI Guidance ]
                                (Dirac Math & 3D Bloch Orbitals)            (2D Bounding Box & Gate Auto-Fix)
```

---

## 🌟 Core Features

### 1. Interactive Quantum Circuit Studio
* **Gate Palette:** Hadamard ($H$), Pauli ($X, Y, Z$), Phase ($S, S^\dagger, T, T^\dagger$), Rotation ($R_x, R_y, R_z$), CNOT, CZ, SWAP, Toffoli (CCX), and Measurement ($M$).
* **Flexible Wire Routing:** Interactive gate drawer to configure control, target, and swap wires across any qubit channels.
* **Real-Time Bloch Sphere:** 3D vector coordinates with pure/mixed state orbital projections.
* **Statevector Probability Analysis:** Computational basis distributions, amplitudes, and KaTeX Dirac formulas.

### 2. Multi-SDK Transpilation & Execution Console
* **Bidirectional AST:** Instant code generation across **IBM Qiskit 1.x, Google Cirq, Xanadu PennyLane, OpenQASM, and LaTeX Quantikz**.
* **MicroVM Execution Console:** Terminal environment simulating memory snapshot execution (`<140ms`).

### 3. Spatial Vision & 2D Bounding Box Debugger
* **Circuit Photo Scanner:** Transcribes hand-drawn whiteboard or notebook diagrams into digital circuits.
* **Visual Bounding Boxes:** Marks and pinpoints misplaced gates or phase errors directly on the wire grid ($0\text{--}1000$ coordinate scale).

### 4. Mathematical & Formal Verification
* **Giallar 20-Rule Optimizer:** Applies sound rewrite rules based on PLDI '22 research to reduce gate depth without modifying unitary matrices.
* **Lean 4 Mathlib Autoformalizer:** Autoformalizes quantum state claims into machine-checked Proof DAGs.
* **NVIDIA Ising 3D CNN QEC Suite:** Interactive triangular color code error correction benchmark comparing against baseline decoders.

---

## 📊 Verification & Test Summary (113 Domain Tests Passed)

The platform is backed by **113 automated algorithmic and system tests** verified with a **100% pass rate** (detailed in [`project_documents/Test_Results.md`](project_documents/Test_Results.md)):

| Domain / Suite Category | Checks | Benchmark Metric | Status |
| :--- | :---: | :--- | :---: |
| **KaTeX Mathematical Engine** | 2 / 2 | Statevector & VQE MathML AST rendering | `PASSED ✓` |
| **Universal Multi-SDK Transpiler** | 5 / 5 | AST concordance across Qiskit, Cirq, PennyLane | `PASSED ✓` |
| **Giallar 20 Formal Rewrite Rules** | 22 / 22 | 20 verified rewrite rules + compiler pass equivalence | `PASSED ✓` |
| **Quantum State Engine & Physics** | 8 / 8 | Bell state, GHZ, CHSH non-locality ($\langle S \rangle = 2.8284$), purity | `PASSED ✓` |
| **In-Browser Scalability & Limits** | 9 / 9 | 1–5 Qubit statevectors (<2ms up to 10Q) and memory limits | `PASSED ✓` |
| **Lean 4 Autoformalization** | 7 / 7 | Mathlib 4 theorem catalog, proof DAGs, live kernel | `PASSED ✓` |
| **2D Bounding Box Document Extraction** | 3 / 3 | Paper claim audit and normalized 0–1000 spatial boxes | `PASSED ✓` |
| **NVIDIA Ising 3D CNN QEC** | 3 / 3 | 3D space-time syndrome generation & LER suppression (~347.7x benchmark) | `PASSED ✓` |
| **Executable System Ablation** | 6 / 6 | Failure domain analysis across pure SDK, AI, and hybrid | `PASSED ✓` |
| **Multi-Persona User Workflows** | 4 / 4 | Student, researcher, and instructor workflows | `PASSED ✓` |
| **Edge Cases & Boundary Tests** | 6 / 6 | Empty circuits, clamping, out-of-order execution, Pauli anti-commutation | `PASSED ✓` |
| **Five-User Full-Duplex WebSockets** | 5 / 5 | Five-client Socket.IO handshake and room state sync | `PASSED ✓` |
| **Live Cloud Services Connectivity** | 3 / 3 | Vertex AI & Supabase configuration checks | `PASSED ✓` |
| **Full-Stack API Endpoints** | 3 / 3 | Simulation, Giallar optimization, and transpiler services | `PASSED ✓` |
| **AI Output Validation Boundaries** | 8 / 8 | JSON parsing, markdown fences, repair, and sorry rejection | `PASSED ✓` |
| **Python SDK & Isolation Suites** | 19 / 19 | Qiskit, Cirq, PennyLane, Stim QEC, ONNX Runtime, KVM (138ms) | `PASSED ✓` |

---

## 🐳 Quickstart & Local Setup

### Prerequisites
* Node.js $\ge 20.0$ and npm $\ge 10.0$
* Or Docker Engine $\ge 24.0$ with Docker Compose

### Option A: Run Locally via Node.js

```bash
# 1. Clone the repository
git clone https://github.com/niloydebbarma-code/QubitLearnAI.git
cd QubitLearnAI/qubitlearn-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in your browser
# http://localhost:3000
```

### Option B: Run via Docker Compose

```bash
# From repository root:
docker compose up --build -d

# Open in browser:
# http://localhost:3000
```

### Option C: Run Automated Test Suites

```bash
# Run all TypeScript modular test suites (94 tests):
cd qubitlearn-app && npm test

# Run all Python and end-to-end infrastructure test suites:
python tests/run_all_tests.py
```

---

## 📂 Repository Structure

```text
QubitLearnAI/
├── Dockerfile                             # Multi-stage production Docker build
├── docker-compose.yml                     # Container orchestration definition
├── package.json                           # Root package descriptor
├── requirements.txt                       # Pinned Python scientific dependencies
├── README.md                              # Main project documentation
│
├── qubitlearn-app/                        # Core Full-Stack Application
│   ├── src/
│   │   ├── components/                    # React UI (Circuit Studio, Bloch Sphere, Math)
│   │   ├── quantum/                       # Simulator, Transpiler, Giallar, Lean Prover
│   │   ├── App.tsx                        # Application Root & Vertical Flow
│   │   └── types.ts                       # TypeScript Interfaces
│   ├── server/                            # Backend Engine, Vertex AI, Database Helpers
│   ├── scripts/                           # Setup and environment automation scripts
│   ├── infrastructure/                    # Firecracker microVM snapshot builders
│   ├── formal_engine/                     # Lean 4 formal verification kernel & Mathlib
│   ├── tests/                             # 94 Automated TypeScript Test Suites
│   ├── server.ts                          # Production Server & WebSocket Gateway
│   └── package.json                       # Application build scripts
│
├── tests/                                 # 19 Python Quantum, QEC & Host Test Suites
│   ├── quantum_sdk_simulation_test.py
│   ├── quantum_error_correction_test.py
│   ├── tensor_inference_engine_test.py
│   ├── symbolic_algebra_test.py
│   ├── microvm_snapshot_isolation_test.py
│   └── run_all_tests.py                   # Automated test orchestrator
│
└── project_documents/                     # Technical Documentation & References
    ├── readme_banner.svg                  # Architecture Banner
    ├── REFERENCES.md                      # Official 23-Item Bibliography
    ├── Test_Results.md                    # 113-Test Audit Report
    ├── System_Architecture_and_Verification_Report.pdf # Architecture Specs (PDF)
    ├── Giallar_Multi_SDK_Universal_Verification_Architecture.md
    ├── Cloud_VM_and_Runtime_Architecture.md
    └── Browser_Quantum_Simulation_Memory_Limits.md
```

---

## 📚 Primary Academic Citations

1. **QuanBench Benchmark:** Guo et al. *"QuanBench: Benchmarking Quantum Code Generation with Large Language Models"*, *arXiv:2510.16779* (2025).
2. **Giallar Compiler Verification:** Tao et al. *"Giallar: Push-Button Verification for the Qiskit Quantum Compiler"*, *ACM PLDI '22 / arXiv:2205.00661* (2022).
3. **Lean 4 Interactive Prover:** de Moura & Ullrich. *"The Lean 4 Theorem Prover and Programming Language"*, *CADE-28* (2021).
4. **MerLean Quantum Formalization:** Ren et al. *"MerLean: An Agentic Framework for Autoformalization in Quantum Computation"*, *arXiv:2602.16554* (2026).
5. **NVIDIA Ising QEC Decoding:** Olle et al. *"Fast and Accurate AI-Based Pre-Decoders for Color Codes"*, *NVIDIA Quantum / arXiv:2607.10058* (2026).
6. **Firecracker Lightweight Virtualization:** Agache et al. *"Firecracker: Lightweight Virtualization for Serverless Applications"*, *USENIX NSDI* (2020).
7. **Full 23-Item Reference Index:** See [`project_documents/REFERENCES.md`](project_documents/REFERENCES.md).

---

## 👥 Project & License

* **Platform Name:** **QubitLearn AI**
* **Project Scope:** Interactive Quantum Computing & Formal Algorithm Verification
* **License:** [Apache-2.0](LICENSE)
* **Demo Video:** [YouTube Demonstration](https://youtu.be/1YdqxLEdkoQ?si=pOfLQWTAeqO7cJRy)
