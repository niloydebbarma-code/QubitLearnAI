#!/usr/bin/env python3
"""
Tensor Inference Engine & ONNX Runtime Verification Suite
Platform Verification

Validates authentic ONNX computational graph construction, execution via
onnxruntime.InferenceSession, tensor numerical verification against
independent mathematical convolution reference, and PyTorch coexistence.
"""

import sys
import subprocess
import json
import numpy as np

def run_test(name, fn):
    try:
        details = fn()
        print(f"[PASS] {name}: {details}", flush=True)
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False

def test_onnx_graph_execution():
    import onnx
    from onnx import helper, TensorProto
    import onnxruntime as ort
    
    rng = np.random.default_rng(42)
    # Authentic NVIDIA Ising 3D space-time syndrome tensor: (Batch=1, InChannels=4, Time=5, nRows=7, nCols=5)
    x = rng.standard_normal((1, 4, 5, 7, 5)).astype(np.float32)
    w = (rng.standard_normal((8, 4, 3, 3, 3)) * 0.05).astype(np.float32)
    
    node = helper.make_node("Conv", ["x", "w"], ["y"], kernel_shape=[3, 3, 3], pads=[1, 1, 1, 1, 1, 1])
    graph = helper.make_graph(
        [node],
        "ising_3d_conv_test",
        [helper.make_tensor_value_info("x", TensorProto.FLOAT, x.shape),
         helper.make_tensor_value_info("w", TensorProto.FLOAT, w.shape)],
        [helper.make_tensor_value_info("y", TensorProto.FLOAT, [1, 8, 5, 7, 5])],
    )
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)], ir_version=10)
    onnx.checker.check_model(model)
    
    sess = ort.InferenceSession(model.SerializeToString(), providers=["CPUExecutionProvider"])
    onnx_out = sess.run(["y"], {"x": x, "w": w})[0]
    
    # Independent 3D NumPy reference convolution
    xp = np.pad(x, ((0, 0), (0, 0), (1, 1), (1, 1), (1, 1)))
    ref = np.zeros((1, 8, 5, 7, 5), dtype=np.float32)
    for oc in range(8):
        for t in range(5):
            for r in range(7):
                for c in range(5):
                    patch = xp[0, :, t:t + 3, r:r + 3, c:c + 3]
                    ref[0, oc, t, r, c] = float(np.sum(patch * w[oc]))
                    
    max_diff = float(np.max(np.abs(onnx_out - ref)))
    if max_diff > 1e-4:
        raise ValueError(f"Max difference {max_diff:.2e} exceeded threshold")
        
    return f"NVIDIA Ising 3D CNN (Input: [1, 4, 5, 7, 5] -> Output: {list(onnx_out.shape)}) | Max diff vs 3D math reference: {max_diff:.2e}"

def test_pytorch_coexistence():
    code = "import onnx, onnxruntime, torch; print(f'PyTorch {torch.__version__} + ONNX {onnx.__version__}')"
    res = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, timeout=15)
    if res.returncode == 0:
        return f"Coexistence verified: {res.stdout.strip()}"
    raise RuntimeError(res.stderr.strip()[:200])

def main():
    print("=" * 80)
    print("TENSOR INFERENCE ENGINE & ONNX RUNTIME VERIFICATION")
    print("=" * 80)
    
    tests = [
        ("ONNX Graph Build & ORT InferenceSession", test_onnx_graph_execution),
        ("PyTorch & ONNX Process Coexistence", test_pytorch_coexistence),
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
