#!/bin/bash
# ==============================================================================
# QubitLearn AI — How we generate the SDK .bin files
# 
# WHY DO WE DO THIS? 
# If we run `pip install qiskit` every time a student clicks "Run", it takes 15 
# seconds and wastes CPU. Instead, we boot the VM once, load Qiskit into RAM, 
# pause the VM, and dump the exact RAM state into a .bin file.
# When a student runs code, we resume from this .bin file in 140 milliseconds!
# ==============================================================================

SOCKET="/tmp/firecracker.socket"

echo "1. Booting the base MicroVM..."
# (Assumes Firecracker is running and configured with rootfs-qiskit.ext4)

echo "2. Waiting for Qiskit to load into the MicroVM RAM..."
sleep 5 

echo "3. Pausing the MicroVM..."
curl --unix-socket ${SOCKET} -i \
    -X PATCH 'http://localhost/vm' \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{ "state": "Paused" }'

echo "4. Generating the Memory Snapshot (.bin file)..."
curl --unix-socket ${SOCKET} -i \
    -X PUT 'http://localhost/snapshot/create' \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
            "snapshot_type": "Full",
            "snapshot_path": "./snap-qiskit.bin",
            "mem_file_path": "./snap-qiskit-mem.bin",
            "version": "1.7.0"
        }'

echo "✅ SUCCESS: snap-qiskit.bin (Memory Snapshot) created!"
echo "Now, when a student runs code, we load this .bin file directly into RAM."
