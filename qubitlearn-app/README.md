# QubitLearn AI — Web Application (`qubitlearn-app`)

This directory contains the full-stack web application for **QubitLearn AI: Interactive Quantum Computing & Algorithm Learning Platform**.

---

## 🛠️ Tech Stack Overview

* **Frontend:** React 18, TypeScript 5.8, Tailwind CSS v4, KaTeX (MathML & LaTeX rendering), Lucide Icons
* **Simulation Engine:** In-browser exact Hilbert space statevector simulator (<2ms)
* **Backend Gateway:** Node.js 20, Express, Socket.IO (Real-time collaboration)
* **Formal Verification:** Lean 4 Mathlib type kernel (`formal_engine/`) & Giallar 20-Rule optimizer
* **AI Vision & Services:** Google Cloud Vertex AI (Gemini 3.7 Flash) & Supabase PostgreSQL

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Modular TypeScript Test Suites (82 Tests)
```bash
npm test
```

---

## 📂 Directory Structure

```text
qubitlearn-app/
├── src/
│   ├── components/       # Visual Studio, Bloch Sphere, Mathematical Analysis, Transpiler
│   ├── quantum/          # Exact Simulator, Multi-SDK AST Transpiler, Giallar Verifier
│   ├── App.tsx           # Application Root & Vertical Pedagogical Flow
│   └── types.ts          # TypeScript Data Contracts
├── server/               # Express Backend Controllers, Database Helpers, Vertex AI Client
├── scripts/              # Setup and environment configuration scripts
├── infrastructure/       # Firecracker microVM snapshot builders (Dockerfile, Ext4 scripts)
├── formal_engine/        # Lean 4 formal verification kernel & Mathlib
├── tests/                # 82 Automated Modular TypeScript Test Suites
├── server.ts             # Express & Socket.IO Production Server
└── vite.config.ts        # Vite Build Configuration
```

---

*For full project documentation, architectural specifications, and test reports, see the master [README.md](../README.md).*
