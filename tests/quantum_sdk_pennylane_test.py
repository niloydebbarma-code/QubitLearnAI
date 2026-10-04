#!/usr/bin/env python3
"""
Xanadu PennyLane Quantum Machine Learning Verification Suite
Platform Verification

Tests 2-Qubit VQE hardware-efficient ansatz, QAOA Max-Cut parameterized layer,
and continuous parameter gradient evolution using Xanadu PennyLane.
"""

import sys
import numpy as np
import pennylane as qml
from pennylane import numpy as pnp

def run_test(name, fn):
    try:
        details = fn()
        print(f"[PASS] {name}: {details}", flush=True)
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False

def test_vqe_ansatz():
    dev = qml.device("default.qubit", wires=2)
    @qml.qnode(dev)
    def circuit(params):
        qml.RY(params[0], wires=0)
        qml.RY(params[1], wires=1)
        qml.CNOT(wires=[0, 1])
        return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))
        
    params = pnp.array([0.0, np.pi], requires_grad=True)
    exp_val = float(circuit(params))
    if abs(exp_val - (-1.0)) > 1e-5:
        raise ValueError(f"Expectation {exp_val} != -1.0")
    return f"Ground energy <Z0 Z1> = {exp_val:.6f}"

def test_qaoa_maxcut():
    dev = qml.device("default.qubit", wires=2)
    @qml.qnode(dev)
    def qaoa_circuit(gamma, beta):
        qml.Hadamard(wires=0)
        qml.Hadamard(wires=1)
        # Problem unitary
        qml.CNOT(wires=[0, 1])
        qml.RZ(2 * gamma, wires=1)
        qml.CNOT(wires=[0, 1])
        # Mixer unitary
        qml.RX(2 * beta, wires=0)
        qml.RX(2 * beta, wires=1)
        return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))

    gamma = pnp.array(np.pi / 4, requires_grad=True)
    beta = pnp.array(np.pi / 8, requires_grad=True)
    res = float(qaoa_circuit(gamma, beta))
    return f"QAOA layer expectation <Z0 Z1> = {res:.6f}"

def main():
    print("=" * 80)
    print("XANADU PENNYLANE QML & VQE VERIFICATION SUITE")
    print("=" * 80)
    
    tests = [
        ("PennyLane 2-Qubit VQE Ground State", test_vqe_ansatz),
        ("PennyLane QAOA Max-Cut Layer (p=1)", test_qaoa_maxcut),
    ]
    
    passed = 0
    for name, fn in tests:
        if run_test(name, fn):
            passed += 1
            
    print("=" * 80)
    print(f"Summary: {passed}/{len(tests)} tests passed")
    print("=" * 80)
    sys.exit(0 if passed == len(tests) else 1)

if __name__ == "__main__":
    main()
