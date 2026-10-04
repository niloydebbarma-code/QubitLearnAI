#!/usr/bin/env bash
# ==============================================================================
# QubitLearn AI — Automated Lean 4 & Elan Setup Script
# Configures formal verification toolchain for application runtime
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="${DIR}/../.."

if [ -f "${ROOT_DIR}/scripts/setup_lean4_elan_environment.sh" ]; then
    bash "${ROOT_DIR}/scripts/setup_lean4_elan_environment.sh" "${ROOT_DIR}/quantum_formal"
else
    echo "Root setup script not found. Installing elan directly..."
    curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y
fi
