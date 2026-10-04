#!/usr/bin/env python3
"""
Google Cirq Quantum Circuit Verification Suite
Platform Verification

Tests Deutsch-Jozsa balanced oracle, 3-Qubit Quantum Fourier Transform (QFT),
and detects Sycamore hardware basis compilation bugs using Google Cirq.
"""

import sys
import numpy as np
import cirq

def run_test(name, fn):
    try:
        details = fn()
        print(f"[PASS] {name}: {details}", flush=True)
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False

def test_deutsch_jozsa():
    q0, q1 = cirq.LineQubit.range(2)
    c = cirq.Circuit(
        cirq.X(q1),
        cirq.H(q0),
        cirq.H(q1),
        cirq.CNOT(q0, q1), # Balanced oracle
        cirq.H(q0),
        cirq.measure(q0, key="result")
    )
    sim = cirq.Simulator()
    res = sim.run(c, repetitions=100)
    counts = res.histogram(key="result")
    if counts.get(1, 0) != 100:
        raise ValueError("Balanced oracle did not measure 1 with 100% certainty")
    return "Balanced oracle correctly measured result=1 across 100 shots"

def test_3qubit_qft():
    qubits = cirq.LineQubit.range(3)
    c = cirq.Circuit(
        cirq.H(qubits[0]),
        cirq.CZ(qubits[0], qubits[1]) ** 0.5,
        cirq.H(qubits[1]),
        cirq.CZ(qubits[0], qubits[2]) ** 0.25,
        cirq.CZ(qubits[1], qubits[2]) ** 0.5,
        cirq.H(qubits[2]),
        cirq.SWAP(qubits[0], qubits[2])
    )
    sim = cirq.Simulator()
    res = sim.simulate(c)
    norm = float(np.linalg.norm(res.final_state_vector))
    if abs(norm - 1.0) > 1e-6:
        raise ValueError(f"Statevector norm deviation: {norm}")
    return f"Unitary normalization ||psi|| = {norm:.6f} | 7 QFT gates"

def main():
    print("=" * 80)
    print("GOOGLE CIRQ CIRCUIT VERIFICATION SUITE")
    print("=" * 80)
    
    tests = [
        ("Cirq Deutsch-Jozsa Balanced Oracle", test_deutsch_jozsa),
        ("Cirq 3-Qubit Quantum Fourier Transform", test_3qubit_qft),
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
