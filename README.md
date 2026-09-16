<div align="center">

<img src="project_documents/readme_banner.svg" alt="QubitLearn AI" width="100%" />

<br/><br/>

[![Live Web Application](https://img.shields.io/badge/Live%20Platform-Deployed%20MVP-0284c7?style=for-the-badge&logo=render&logoColor=white)](#-live-mvp--demo-video)
[![Pitch Video Demonstration](https://img.shields.io/badge/Demo%20Video-Full%20HD%20Pitch-dc2626?style=for-the-badge&logo=youtube&logoColor=white)](#-live-mvp--demo-video)
[![Architecture PDF](https://img.shields.io/badge/Architecture-Vector%20PDF%20Report-09479e?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](project_documents/System_Architecture_and_Verification_Report.pdf)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](#-docker-quickstart)
[![Lean 4 Verified](https://img.shields.io/badge/Formal%20Prover-Lean%204%20Verified-882d2d?style=for-the-badge)](project_documents/Test_Results.md)
[![Status](https://img.shields.io/badge/Status-Functional%20MVP%20(55%25%20Done)-15803d?style=for-the-badge)](#)

</div>

---

## 📌 Executive Summary & Submission Deliverables

**QubitLearn AI** is an indigenous, full-stack interactive quantum computing and algorithm education platform engineered to democratize quantum education across universities (Tier-1, Tier-2, and Tier-3 institutions). By integrating an **in-memory sparse statevector simulator (<2ms latency)**, **Gemini 3.7 Flash spatial vision for 2D circuit error localization**, and a **Lean 4 formal verification proof kernel**, QubitLearn AI eliminates the steep mathematical barrier and guarantees zero AI hallucinations.

| Deliverable | Description | Location / Access |
| :--- | :--- | :--- |
| 🌐 **Live Deployed MVP** | Production Web Application deployed on cloud infrastructure | *[Evaluator Access Provided via Official Portal]* |
| 🎬 **Pitch Video Demo** | 54-Second Motion-Graphics & Working Prototype Showcase | *[Evaluator Access Provided via Official Portal]* |
| 📑 **Architecture & Verification Report** | Formal System Specifications & Proof Bounds (Vector PDF) | [`project_documents/System_Architecture_and_Verification_Report.pdf`](project_documents/System_Architecture_and_Verification_Report.pdf) |
| ☁️ **Cloud VM & Runtime Specification** | Multi-VM Topology, Hardware KVM, Cost & Sizing Analysis | [`project_documents/Cloud_VM_and_Runtime_Architecture.md`](project_documents/Cloud_VM_and_Runtime_Architecture.md) |
| 🔬 **System Audit & Test Suite** | 24-Module Automated Verification Report ($F \ge 0.999$, Latency Benchmark) | [`project_documents/Test_Results.md`](project_documents/Test_Results.md) |
| 🐳 **Dockerized Deployment** | Reproducible multi-stage Dockerfile & Compose stack | [`Dockerfile`](Dockerfile) • [`docker-compose.yml`](docker-compose.yml) |

---

## 🔍 The Problem & National Quantum Context

### 1. The Theory-to-Practice Skill Barrier
While India produces over **91,000 STEM graduates annually** (2021 baseline), the **Office of Principal Scientific Adviser (PSA 2025 Report)** revealed that **only 2.6% of scholars receive industry R&D absorption**. Traditional academic instruction relies on dense linear algebra and abstract matrix multiplication ($2^n \times 2^n$) without hands-on, zero-cost visual simulation tools (*arXiv:2108.01311*).

### 2. The AI Quantum Code Reliability Gap
Recent empirical evaluations from **QuanBench** (*arXiv:2510.16779*) prove that state-of-the-art Large Language Models (LLMs) achieve **<40% accuracy on quantum algorithm code generation**, frequently generating invalid gate sequences, phase angle inversions, and broken compiler ASTs.

### 3. National Quantum Mission (NQM) Alignment
Under India's **₹6,000 Crore (~$750M) National Quantum Mission** and the **AICTE QT-03 Model Curriculum Mandate**, India requires **25,000+ trained quantum engineers by 2030**. QubitLearn AI delivers a hardware-free, browser-accessible software stack to achieve this national scaling goal.

```
+-----------------------------------------------------------------------------------------------+
|                                  THE QUANTUM LEARNING PARADOX                                 |
+-------------------------------+-------------------------------+-------------------------------+
|  Theoretical Brilliance       |  Tooling & Lab Deficit        |  QubitLearn AI Solution       |
|  • 91k STEM Graduates/year    |  • <2.6% Industry Absorption  |  • In-Memory Statevector <2ms |
|  • Strong Math Foundation     |  • <5% Physical Lab Access    |  • Gemini 2D Spatial Vision   |
|  • High Research Interest     |  • LLMs Hallucinate (<40% Acc)|  • Lean 4 Formal Verification |
+-------------------------------+-------------------------------+-------------------------------+
```

---

## 🏛️ 3-Layer System Architecture

QubitLearn AI decouples quantum education into three resilient architectural tiers:

```
+=============================================================================================+
| [Layer 3] MicroVM Sandbox Tier                                                             |
| • Firecracker Linux KVM Sandbox Execution (Pre-compiled .bin/SDK, zero network access)      |
+=============================================================================================+
                                              ▲
                                              │  AST Invariant Dispatch
+=============================================================================================+
| [Layer 2] AI Reasoning & Formal Logic Tier                                                  |
| • Gemini 3.7 Flash Spatial Vision (2D Bounding-Box Error Localization on Circuit Graphs)    |
| • Lean 4 Dependent Type Proof Kernel (Autoformalization & 20 Giallar AST Rewrite Rules)      |
| • Multi-SDK Transpiler (Universal AST across Qiskit, Cirq, PennyLane & OpenQASM 3.0)       |
+=============================================================================================+
                                              ▲
                                              │  State Invariant Match
+=============================================================================================+
| [Layer 1] Quantum Simulation Engine Tier                                                    |
| • Sparse O(2ⁿ) Bitmask In-Memory Statevector Engine (<2ms Latency, Client-Side WASM)         |
| • 14-Qubit Dense Matrix vs. 28-Qubit Statevector Browser Memory Limit Bounds                |
+=============================================================================================+
```

---

## ⚡ 5-Engine Orchestration Flowchart

```
 [ Student Web UI ]
 (Circuit Lab, Arena, Dashboard, Vision Upload)
         │
         ▼  (HTTP / WebSocket Protocol)
 [ API Gateway & Router ]
 (AST Parsing, Token Rate Limiting & RLS)
         │
         ├───► [ 1. Hilbert Simulator (|ψ⟩) ] ────── In-Memory Bitmask Evolution (<2ms)
         ├───► [ 2. Gemini 3.7 Flash AI ]     ────── 2D Bounding-Box Error Vision & Socratic Hints
         ├───► [ 3. Multi-SDK Transpiler ]    ────── Universal AST (Qiskit, Cirq, PennyLane)
         ├───► [ 4. Firecracker MicroVM ]     ────── Isolated Linux KVM Sandbox Execution
         └───► [ 5. Formal Prover (Lean 4) ]  ────── Dependent-Type Invariants (20 Giallar Passes)
                                                               │
                                                               ▼
                                                    [ Fidelity Gate (F ≥ 0.99?) ]
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         ▼ (PASS ✓)                                  ▼ (FAIL ✗)
                                [ Supabase Database ]                   [ 3-Attempt Socratic Loop ]
                                (State Hash Ledger & WS Sync)           (Causal Error Hints to Student)
```

---

## 🌟 Core Feature Modules

### 1. Interactive Quantum Circuit Lab
* **16-Gate Palette:** Drag-and-drop Hadamard ($H$), Pauli ($X, Y, Z$), Phase ($S, S^\dagger, T, T^\dagger$), Rotation ($R_x, R_y, R_z$), CNOT, CZ, SWAP, Toffoli (CCX), and Measurement ($M$).
* **Real-Time Bloch Sphere:** 3D interactive qubit vector orbital state evolution.
* **Statevector Probability Histogram:** Instantaneous measurement distribution calculation.

### 2. Quantum Coding Arena & Competitions
* **Algorithmic Challenges:** Superposition preparation, Bell state generation, Quantum Teleportation, Deutsch-Jozsa, Grover search ($O(\sqrt{N})$), and Quantum Phase Estimation (QPE).
* **Dual-Agent Exam Invigilator:** Anti-cheat code execution with automated test case validation.

### 3. Gemini 3.7 Multimodal Spatial Vision
* **Hand-Drawn Circuit Transcriber:** Upload camera photos of handwritten quantum circuits.
* **2D Bounding-Box Localizer:** Accurately draws spatial coordinates around misplaced gates, incorrect target qubits, or inverted control lines.

### 4. Lean 4 Formal Verification Prover
* **Mathematical Proof DAG:** Autoformalizes circuit ASTs into Lean 4 dependent-type theorems.
* **20 Giallar Rewrite Rules:** Proves semantic equivalence across compiler optimization passes (*PLDI '22*), completely eliminating LLM hallucinations.

### 5. Research & Literature Verification
* **Adversarial Claim Auditor:** Validates quantum computational claims against peer-reviewed literature (*Grover 1996, Shor 1994, VQE Peruzzo 2014, QAOA Farhi 2014*).

### 6. Student Progress & AI Trust Dashboard
* **Quantum XP & Learning Milestones:** Tracks linear algebra competencies, coding submissions, and invariant health ($96\%$ verified).
* **AI Trust Diagnostic:** Categorizes failure telemetry into learner mistakes, AI slips, and unsolvable edge cases.

---

## 📊 Empirical Benchmarks & Verification

Comprehensive system audits verified across 24 core modules (detailed in `project_documents/Test_Results.md`):

| Test Category | Suite Target | Benchmark Metric | Status |
| :--- | :--- | :--- | :---: |
| **Statevector Engine** | Bitmask tensor simulation | Latency $< 2.0\text{ ms}$ up to 14 qubits | `PASSED ✓` |
| **Circuit Transpiler** | AST concordance | State Fidelity $F \ge 0.999$ across Qiskit/Cirq | `PASSED ✓` |
| **Gemini 3.7 Vision** | 2D bounding-box localization | IoU $\ge 0.82$ on hand-drawn circuits | `PASSED ✓` |
| **Lean 4 Proof Kernel** | AST invariant equivalence | 20 Giallar compiler rewrite passes proven | `PASSED ✓` |
| **Reflexion Loop** | Causal fault localization | Max 3 attempts with adaptive Socratic hints | `PASSED ✓` |
| **Platform Scalability** | Browser memory limits | 14-qubit dense matrix vs. 28-qubit statevector | `PASSED ✓` |

---

## ☁️ Execution Modes & Cloud VM Topology

QubitLearn AI dynamically routes quantum execution across four interchangeable runtime modes based on environment configuration (`.env`):

| Mode (`QUANTUM_EXECUTION_MODE`) | Target Infrastructure | Nested KVM Required? | Typical Cost | Security Boundary |
| :--- | :--- | :---: | :---: | :--- |
| **`IN_MEMORY_V8`** *(Default)* | Google Cloud Run / Local Node | **No** | **$0.00** (Free Tier) | Fast in-memory V8 sandbox with deterministic Hilbert space simulation ($<2\text{ ms}$). |
| **`FIRECRACKER_KVM`** | GCP Compute Engine N2 (`n2-standard-2`) or Local WSL2 | **Yes** (`/dev/kvm`) | ~$0.097/hr (~$5–7 for judging) | Hardware-level microVM jail (5ms cold start, zero network access, ephemeral cleanup). |
| **`CLOUD_RUN_SANDBOX`** | Google Cloud Run Container Sandbox | **No** | Free tier / Pay-per-req | Managed container isolation for executing sandboxed Python code. |
| **`BINARY_RUNTIME`** | GCP Compute Engine E2 (`e2-micro` / `e2-medium`) | **No** | $0 to ~$7/month | Standalone precompiled SDK binary execution on standard VMs. |

---

## 🐳 Docker Quickstart & Local Deployment

### Prerequisites
* Docker Engine $\ge 24.0$ and Docker Compose $\ge 2.20$
* Or Node.js $\ge 20.0$ and npm $\ge 10.0$

### Option A: Run via Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/niloydebbarma-code/QubitLearnAI.git
cd QubitLearnAI

# 2. Build and launch the containerized application
docker compose up --build -d

# 3. Open in your browser
open http://localhost:3000
```

### Option B: Run Locally via Node.js

```bash
# 1. Navigate to the application directory
cd qubitlearn-app

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start the development server
npm run dev

# 5. Build for production
npm run build
```

### Option C: 1-Click Firecracker & KVM Setup (Local WSL2 / Linux)

```bash
cd qubitlearn-app

# 1. Install Firecracker v1.7.0 & configure /dev/kvm permissions
npm run setup:firecracker

# 2. Launch the interactive runtime selector & diagnostic scanner
npm run setup:runtime
# Automatically detects WSL2, /dev/kvm, Firecracker, Python & configures .env
```

### Option D: Run the Complete Verification Test Suite

```bash
cd qubitlearn-app
npx tsx tests/run_all_tests.ts
```

---

## 🚀 Google Cloud Production Deployment & Vertex AI Integration (`gcloud` CLI)

### 1. Local Development with Google Cloud Vertex AI (Application Default Credentials)

To run Vertex AI Gemini 3.7 Flash locally without hardcoding API keys in `.env`:

```bash
# 1. Initialize and authenticate Google Cloud CLI
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Authenticate Application Default Credentials (ADC)
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID

# 3. Enable Vertex AI & Cloud Run APIs
gcloud services enable aiplatform.googleapis.com run.googleapis.com compute.googleapis.com
```

### 2. Deploy Main Application to Google Cloud Run (Keyless IAM Authentication)

Cloud Run uses a dedicated runtime service account with `roles/aiplatform.user` for credential-free inference with Vertex AI:

```bash
# 1. Create a dedicated Cloud Run runtime service account
gcloud iam service-accounts create qubitlearn-runner \
  --display-name="QubitLearn AI Cloud Run Runtime" \
  --project=YOUR_PROJECT_ID

# 2. Grant Vertex AI User role to the service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:qubitlearn-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 3. Deploy container directly to Cloud Run
gcloud run deploy qubitlearn-app \
  --source . \
  --region us-central1 \
  --project YOUR_PROJECT_ID \
  --service-account=qubitlearn-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 20 \
  --max-instances 3 \
  --set-env-vars="NODE_ENV=production,GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=global,QUANTUM_EXECUTION_MODE=IN_MEMORY_V8,VM_PROVIDER=CLOUD_RUN"
```

### 3. (Optional) Deploy Dedicated Compute Engine N2 VM for Hardware Firecracker MicroVMs

```bash
# 1. Create base disk with Ubuntu 22.04 LTS
gcloud compute disks create disk-base \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --zone=us-central1-a

# 2. Create custom image with Nested Virtualization (Intel VMX) enabled
gcloud compute images create nested-ubuntu-2204 \
  --source-disk=disk-base \
  --source-disk-zone=us-central1-a \
  --licenses="https://www.googleapis.com/compute/v1/projects/vm-options/global/licenses/enable-vmx"

# 3. Launch n2-standard-2 instance with hardware KVM support
gcloud compute instances create firecracker-sandbox-host \
  --zone=us-central1-a \
  --machine-type=n2-standard-2 \
  --image=nested-ubuntu-2204 \
  --tags=firecracker-sandbox

# 4. Update Cloud Run to route sandboxed execution to the N2 host over private VPC
gcloud run services update qubitlearn-app \
  --region us-central1 \
  --update-env-vars="QUANTUM_EXECUTION_MODE=FIRECRACKER_KVM,VM_PROVIDER=GCP_N2_KVM,FIRECRACKER_SERVICE_URL=http://<INTERNAL_N2_IP>:8080"
```

---

## 📂 Repository Structure

```
QubitLearnAI/
├── Dockerfile                             # Multi-stage production Docker build
├── docker-compose.yml                     # Container orchestration & service definition
├── .dockerignore                          # Docker build exclusion rules
├── .gitignore                             # Comprehensive Git privacy rules
├── README.md                              # Master project documentation
│
├── qubitlearn-app/                        # Full-Stack Application Source Code
│   ├── src/
│   │   ├── components/                    # React UI (Circuit Lab, Arena, Bloch, Dashboard)
│   │   ├── quantum/                       # Simulator, Transpiler, Lean Prover, Curricula
│   │   ├── App.tsx                        # Application Root
│   │   └── types.ts                       # TypeScript Data Contracts & Interfaces
│   ├── server/                            # Express Backend, Vertex AI, MicroVM Router
│   ├── scripts/                           # Runtime & VM Setup Configurator CLI
│   ├── server.ts                          # Production Entry Point & WebSocket Gateway
│   ├── tests/                             # 24 Automated Test Suites
│   ├── package.json                       # Dependencies & build scripts
│   └── vite.config.ts                     # Vite build configuration
│
└── project_documents/                     # Technical Specifications & Audits
    ├── readme_banner.svg                  # Brand Architecture Banner Graphic
    ├── System_Architecture_and_Verification_Report.pdf # Formal Architecture & Invariant Bounds (PDF)
    ├── Cloud_VM_and_Runtime_Architecture.md # Multi-VM Topology, Hardware KVM & Cost Analysis
    ├── Test_Results.md                    # 24-Module Verification Test Suite Report
    └── Browser_Quantum_Simulation_Memory_Limits.md # V8 & WASM 14 vs 28 Qubit Bounds
```

---

## 📚 References & Research Citations

1. **QuanBench Benchmark:** Hu et al. *"QuanBench: Benchmarking Large Language Models on Quantum Program Synthesis"*, *arXiv:2510.16779* (2025).
2. **Giallar Compiler Verification:** Tao et al. *"Giallar: Push-Button Verification for the Qiskit Quantum Compiler"*, *ACM PLDI '22 / arXiv:2205.00661* (2022).
3. **Quantum Education Skill Gap:** Asfaw et al. *"Building a Quantum Engineering Undergraduate Curriculum"*, *arXiv:2108.01311* (2021).
4. **Lean 4 / LeanDojo Formal Reasoning:** Yang et al. *"LeanDojo: Theorem Proving with Retrieval-Augmented Language Models"*, *NeurIPS / arXiv:2406.01940v1* (2024).
5. **Office of Principal Scientific Adviser (PSA):** Government of India Report on *Quantum Science & Human Capital Reforms* (2025).
6. **AICTE QT-03 Model Curriculum:** All India Council for Technical Education, *Model Curriculum for Minor Degree in Quantum Technologies* (2024).
7. **National Quantum Mission (NQM):** Department of Science & Technology, Government of India (*dst.gov.in / pib.gov.in PRID: 1917992*).

---

## 👥 Project Information

* **Platform Name:** **QubitLearn AI**
* **Domain:** Interactive Quantum Computing & Formal Algorithm Verification
* **License:** Apache-2.0
* **Deployment & Verification Access:** Access links provided directly in the official evaluation submission portal.
