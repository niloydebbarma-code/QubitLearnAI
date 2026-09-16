"""
PennyLane Test Code 03 [BUGGY CODE / COMPILER BUG]:
Represents Parameter Shift Rotation Fusion Inversion Bug (Sign Flip in RZ Chain)
Flawed continuous parameter optimization merges RZ(theta1) and RZ(theta2) with subtraction instead of addition.
"""
import pennylane as qml
import numpy as np

theta1 = 0.5
theta2 = 0.3

# INTENDED ROTATION FUSION: RZ(theta1 + theta2) = RZ(0.8) [Giallar Rule R16_1Q_ROTATION_MERGE]

# BUGGY COMPILER MERGER PASS:
# Optimizer incorrectly subtracts angles: RZ(theta1 - theta2) = RZ(0.2)
dev = qml.device('default.qubit', wires=1)

@qml.qnode(dev)
def buggy_fused_circuit():
    qml.Hadamard(wires=0)
    qml.RZ(theta1 - theta2, wires=0) # Bug: theta1 - theta2 = 0.2 instead of 0.8!
    return qml.state()

result = {
    "framework": "pennylane",
    "name": "PennyLane Parameterized Rotation Fusion Sign Bug",
    "bugCategory": "ROTATION_ANGLE_FUSION_ERROR",
    "violation": "R_z(theta1) * R_z(theta2) = R_z(theta1 + theta2), not R_z(theta1 - theta2).",
    "phaseDiscrepancyRad": 0.60,
    "giallarRuleTarget": "R16_1Q_ROTATION_MERGE",
    "status": "DETECTED_COMPILER_BUG"
}
