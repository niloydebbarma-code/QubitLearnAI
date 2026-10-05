#!/usr/bin/env bash
# ==============================================================================
# QubitLearn AI — Automated Lean 4 & Elan Setup Script
# Configures formal verification toolchain for application runtime
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="${DIR}/../.."

if [ -f "${DIR}/setup_lean4_elan_environment.sh" ]; then
    bash "${DIR}/setup_lean4_elan_environment.sh" "${DIR}/../formal_engine"
elif [ -f "${ROOT_DIR}/qubitlearn-app/scripts/setup_lean4_elan_environment.sh" ]; then
    bash "${ROOT_DIR}/qubitlearn-app/scripts/setup_lean4_elan_environment.sh" "${ROOT_DIR}/qubitlearn-app/formal_engine"
else
    echo "Root setup script not found. Installing elan directly..."
    curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y
fi
