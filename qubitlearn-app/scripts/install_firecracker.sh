#!/usr/bin/env bash
# ==============================================================================
# QubitLearn AI — Linux KVM & Firecracker v1.7.0 Automated Installer
# Installs Firecracker microVM binary & configures /dev/kvm permissions.
# Compatible with Ubuntu, Debian, WSL2, and GCP Compute Engine N2 VMs.
# ==============================================================================

set -e

FIRECRACKER_VERSION="v1.7.0"
ARCH="$(uname -m)"
INSTALL_DIR="${HOME}/firecracker"

echo "================================================================"
echo "    QUBITLEARN AI — FIRECRACKER v1.7.0 & KVM SETUP SCRIPT       "
echo "================================================================"
echo "• Architecture: ${ARCH}"
echo "• Target Dir  : ${INSTALL_DIR}"
echo ""

# 1. Check Hardware Virtualization (/dev/kvm)
echo "[1/4] Checking Linux KVM hardware acceleration (/dev/kvm)..."
if [ -e /dev/kvm ]; then
    echo "  ✅ /dev/kvm exists on this host."
    # Ensure current user has permissions
    if [ ! -w /dev/kvm ]; then
        echo "  Granting /dev/kvm permissions to user ${USER}..."
        if command -v sudo >/dev/null 2>&1; then
            sudo usermod -aG kvm "${USER}" 2>/dev/null || true
            sudo chmod 666 /dev/kvm 2>/dev/null || true
        fi
    fi
else
    echo "  ⚠️ Warning: /dev/kvm not found! Nested virtualization may be disabled."
    echo "  For GCP: Use an N2 instance with nested virtualization enabled."
    echo "  For WSL2: Add 'nestedVirtualization=true' in %USERPROFILE%/.wslconfig."
fi

# 2. Download Firecracker Release Archive
echo "[2/4] Downloading Firecracker ${FIRECRACKER_VERSION} (${ARCH})..."
mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

RELEASE_URL="https://github.com/firecracker-microvm/firecracker/releases/download/${FIRECRACKER_VERSION}/firecracker-${FIRECRACKER_VERSION}-${ARCH}.tgz"
curl -sSL "${RELEASE_URL}" | tar -xz

# 3. Setup Executable Symlinks
echo "[3/4] Installing Firecracker and Jailer binaries..."
cp "release-${FIRECRACKER_VERSION}-${ARCH}/firecracker-${FIRECRACKER_VERSION}-${ARCH}" "${INSTALL_DIR}/firecracker"
cp "release-${FIRECRACKER_VERSION}-${ARCH}/jailer-${FIRECRACKER_VERSION}-${ARCH}" "${INSTALL_DIR}/jailer"
chmod +x "${INSTALL_DIR}/firecracker" "${INSTALL_DIR}/jailer"

# 4. Verification Test
echo "[4/4] Verifying Firecracker binary execution..."
FC_OUTPUT="$("${INSTALL_DIR}/firecracker" --version | head -n 1)"
echo "  ✅ Installed: ${FC_OUTPUT}"

echo ""
echo "================================================================"
echo "✅ Firecracker v1.7.0 successfully installed at: ${INSTALL_DIR}/firecracker"
echo "To configure QubitLearn AI to use this runtime, run: npm run setup:runtime"
echo "================================================================"
