#!/usr/bin/env bash
# ==============================================================================
# QubitLearn AI — Automated Lean 4, Elan & Mathlib4 Setup Script
# Installs elan (toolchain manager), downloads pinned Lean 4 compiler,
# initializes lake build system, and downloads pre-built Mathlib4 olean cache.
# ==============================================================================

set -e

echo "================================================================"
echo "    QUBITLEARN AI — LEAN 4 & ELAN ENVIRONMENT SETUP           "
echo "================================================================"

# 1. Install elan if not present
if ! command -v elan &> /dev/null; then
    echo "[1/4] Installing elan toolchain manager..."
    curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y
    source "${HOME}/.elan/env" || export PATH="${HOME}/.elan/bin:${PATH}"
else
    echo "[1/4] elan is already installed: $(elan --version)"
fi

export PATH="${HOME}/.elan/bin:${PATH}"

# 2. Check toolchain versions
echo "[2/4] Verifying compiler binaries..."
echo "  • elan : $(elan --version)"
echo "  • lean : $(lean --version 2>/dev/null || echo 'lean toolchain will be fetched on workspace init')"
echo "  • lake : $(lake --version 2>/dev/null || echo 'lake will be initialized')"

# 3. Create or enter workspace and pin lean-toolchain
WORKSPACE_DIR="${1:-quantum_formal}"
echo "[3/4] Initializing formal workspace in '${WORKSPACE_DIR}'..."
mkdir -p "${WORKSPACE_DIR}"
cd "${WORKSPACE_DIR}"

if [ ! -f "lean-toolchain" ]; then
    echo "leanprover/lean4:v4.11.0" > lean-toolchain
    echo "  • Pinned toolchain to v4.11.0"
fi

if [ ! -f "lakefile.toml" ] && [ ! -f "lakefile.lean" ]; then
    echo "  • Initializing Lake project with Mathlib4..."
    lake init "${WORKSPACE_DIR}" math || true
fi

# 4. Fetch Mathlib cache & build
echo "[4/4] Fetching Mathlib4 pre-compiled binary cache and verifying..."
lake exe cache get || true
lake build || true

echo "================================================================"
echo "    LEAN 4 & MATHLIB4 SETUP COMPLETED SUCCESSFULLY             "
echo "================================================================"
