/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Quantum Runtime & VM Configuration CLI
 * Allows developers and judges to check host capabilities and select the execution mode.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';

interface HostDiagnostics {
  wslInstalled: boolean;
  kvmActive: boolean;
  firecrackerInstalled: boolean;
  firecrackerVersion: string | null;
  pythonInstalled: boolean;
  pythonVersion: string | null;
  qiskitInstalled: boolean;
}

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 4000 }).trim();
  } catch {
    return '';
  }
}

function inspectHost(): HostDiagnostics {
  // 1. Check WSL
  let wslInstalled = false;
  const wslUname = runCommand('wsl.exe -e uname -s');
  if (wslUname.toLowerCase().includes('linux') || process.platform === 'linux') {
    wslInstalled = true;
  }

  // 2. Check /dev/kvm
  let kvmActive = false;
  if (process.platform === 'linux') {
    const kvm = runCommand('ls -la /dev/kvm');
    kvmActive = kvm.includes('/dev/kvm');
  } else if (wslInstalled) {
    const kvm = runCommand('wsl.exe -e sh -c "test -e /dev/kvm && echo KVM_OK"');
    kvmActive = kvm.includes('KVM_OK');
  }

  // 3. Check Firecracker binary
  let firecrackerInstalled = false;
  let firecrackerVersion: string | null = null;
  let fcCheck = runCommand('firecracker --version');
  if (!fcCheck && wslInstalled) {
    fcCheck = runCommand('wsl.exe -e sh -c "$HOME/firecracker/firecracker --version 2>/dev/null || firecracker --version 2>/dev/null"');
  }
  if (fcCheck.includes('Firecracker v')) {
    firecrackerInstalled = true;
    firecrackerVersion = fcCheck.split('\n')[0].trim();
  }

  // 4. Check Python & Qiskit
  let pythonInstalled = false;
  let pythonVersion: string | null = null;
  let qiskitInstalled = false;
  const pyCheck = runCommand('python3 --version') || runCommand('python --version');
  if (pyCheck.includes('Python 3')) {
    pythonInstalled = true;
    pythonVersion = pyCheck;
    const qiskitCheck = runCommand('python3 -c "import qiskit; print(qiskit.__version__)"') || runCommand('python -c "import qiskit; print(qiskit.__version__)"');
    if (qiskitCheck) qiskitInstalled = true;
  }

  return {
    wslInstalled,
    kvmActive,
    firecrackerInstalled,
    firecrackerVersion,
    pythonInstalled,
    pythonVersion,
    qiskitInstalled,
  };
}

function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.join(process.cwd(), '.env');
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}="${value}"`);
    } else {
      content += `\n${key}="${value}"`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
}

async function main() {
  console.log('\n===============================================================');
  console.log('       QUBITLEARN AI — QUANTUM RUNTIME & VM CONFIGURATOR       ');
  console.log('===============================================================\n');
  console.log('Scanning host system hardware & virtualization capabilities...\n');

  const diag = inspectHost();

  console.log('--- Host Diagnostics ---');
  console.log(`• Windows WSL2 / Linux Kernel: ${diag.wslInstalled ? '✅ ACTIVE' : '❌ Not Detected'}`);
  console.log(`• Hardware KVM (/dev/kvm)    : ${diag.kvmActive ? '✅ ACTIVE (Hardware Virtualization Supported!)' : '❌ Inactive'}`);
  console.log(`• Firecracker MicroVM v1.7.0 : ${diag.firecrackerInstalled ? `✅ INSTALLED (${diag.firecrackerVersion})` : '⚠️ Not installed yet in WSL/Linux'}`);
  console.log(`• Host Python Runtime        : ${diag.pythonInstalled ? `✅ ${diag.pythonVersion}` : '❌ Not Found'}`);
  console.log(`• IBM Qiskit Package         : ${diag.qiskitInstalled ? '✅ INSTALLED' : '⚠️ Not Found (In-Memory Engine active)'}`);
  console.log('------------------------\n');

  console.log('Select target execution runtime for QubitLearn AI:');
  console.log('------------------------------------------------------------------');
  console.log(' [1] Google Cloud Run (Default Serverless Mode)');
  console.log('     • In-memory TypeScript statevector engine (< 2ms simulation)');
  console.log('     • Zero external cost ($0.00 compute charges)');
  console.log('     • Vertex AI Gemini 3.7 Flash integration');
  console.log('');
  console.log(' [2] Google Compute Engine N2 VM (Production Cloud MicroVM)');
  console.log('     • Dedicated n2-standard-2 VM running Firecracker v1.7.0 over VPC');
  console.log('     • Real hardware KVM microVM isolation for jury demo');
  console.log('');
  console.log(' [3] Local WSL2 Linux KVM (Development / Local Hardware Firecracker)');
  console.log('     • Uses your local PC /dev/kvm inside WSL2');
  console.log('     • Real hardware microVM execution right on your laptop');
  console.log('');
  console.log(' [4] Precompiled Standalone Binary (.bin Runtime Mode)');
  console.log('     • Executes standalone precompiled SDK binaries');
  console.log('     • Compatible with cheap E2 VMs (e2-micro/e2-medium)');
  console.log('------------------------------------------------------------------\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Enter option [1-4] (default: 1): ', (ans) => {
      resolve(ans.trim() || '1');
    });
  });

  if (answer === '1') {
    console.log('\nConfiguring for Google Cloud Run (In-Memory V8 Sandbox)...');
    updateEnvFile({
      QUANTUM_EXECUTION_MODE: 'IN_MEMORY_V8',
      VM_PROVIDER: 'CLOUD_RUN',
      FIRECRACKER_SERVICE_URL: '',
    });
    console.log('✅ Configuration saved to .env (Mode: IN_MEMORY_V8 / CLOUD_RUN)\n');
  } else if (answer === '2') {
    const n2Url = await new Promise<string>((resolve) => {
      rl.question('Enter Compute Engine N2 Internal or External URL (e.g. http://10.128.0.2:8080): ', (url) => {
        resolve(url.trim() || 'http://10.128.0.2:8080');
      });
    });
    console.log(`\nConfiguring for Compute Engine N2 Firecracker daemon at ${n2Url}...`);
    updateEnvFile({
      QUANTUM_EXECUTION_MODE: 'FIRECRACKER_KVM',
      VM_PROVIDER: 'GCP_N2_KVM',
      FIRECRACKER_SERVICE_URL: n2Url,
    });
    console.log(`✅ Configuration saved to .env (Mode: FIRECRACKER_KVM at ${n2Url})\n`);
  } else if (answer === '3') {
    console.log('\nConfiguring for Local WSL2 Linux KVM...');
    if (!diag.firecrackerInstalled && diag.kvmActive) {
      console.log('\n💡 /dev/kvm is ACTIVE in your WSL2! Would you like to install Firecracker v1.7.0 now?');
      const installFc = await new Promise<string>((resolve) => {
        rl.question('Download & Install Firecracker v1.7.0 in WSL2? [Y/n]: ', (ans) => {
          resolve((ans.trim() || 'y').toLowerCase());
        });
      });
      if (installFc === 'y') {
        console.log('Downloading Firecracker v1.7.0 into WSL2 ($HOME/firecracker)...');
        try {
          execSync('wsl.exe -e sh -c "mkdir -p $HOME/firecracker && cd $HOME/firecracker && curl -sSL https://github.com/firecracker-microvm/firecracker/releases/download/v1.7.0/firecracker-v1.7.0-x86_64.tgz | tar -xz && cp release-v1.7.0-x86_64/firecracker-v1.7.0-x86_64 ./firecracker && chmod +x ./firecracker"', { stdio: 'inherit' });
          console.log('✅ Firecracker v1.7.0 installed successfully in WSL2!');
        } catch (e: any) {
          console.error('⚠️ Could not download Firecracker automatically:', e?.message);
        }
      }
    }
    updateEnvFile({
      QUANTUM_EXECUTION_MODE: 'FIRECRACKER_KVM',
      VM_PROVIDER: 'LOCAL_WSL2',
      FIRECRACKER_SERVICE_URL: '',
    });
    console.log('✅ Configuration saved to .env (Mode: FIRECRACKER_KVM / LOCAL_WSL2)\n');
  } else if (answer === '4') {
    console.log('\nConfiguring for Precompiled Standalone Binary (.bin) Mode...');
    updateEnvFile({
      QUANTUM_EXECUTION_MODE: 'BINARY_RUNTIME',
      VM_PROVIDER: 'GCP_E2',
      FIRECRACKER_SERVICE_URL: '',
      SDK_BINARY_DIR: './bin',
    });
    console.log('✅ Configuration saved to .env (Mode: BINARY_RUNTIME / GCP_E2)\n');
  } else {
    console.log('Invalid option. Keeping current settings.');
  }

  rl.close();
}

main().catch(console.error);
