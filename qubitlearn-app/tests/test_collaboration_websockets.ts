/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Real-Time Collaboration & WebSocket Room Capacity Verification Suite
 * Tests Socket.io event broadcasting and the 2-5 users scalability limit.
 */

import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://127.0.0.1:3000";

export async function runCollaborationWebSocketTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  console.log("\n🧪 [SUITE 4/5] Testing Real-Time Collaboration & WebSocket Rooms (Socket.io)...");

  // Test 1: Room Creation & Multi-User State Synchronization
  try {
    const roomId = `TEST_ROOM_${Date.now()}`;
    const client1: Socket = io(SOCKET_URL, { reconnection: false });
    const client2: Socket = io(SOCKET_URL, { reconnection: false });

    await new Promise<void>((resolve) => client1.on("connect", () => resolve()));
    await new Promise<void>((resolve) => client2.on("connect", () => resolve()));

    client1.emit("join-room", roomId);
    client2.emit("join-room", roomId);

    // Test sending circuit update from Client 1 to Client 2
    const testCircuit = {
      numQubits: 2,
      timeSteps: 6,
      gates: [{ id: "g0", type: "H", qubit: 0, timeStep: 0 }]
    };

    const updateReceived = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 4000);
      client2.on("circuit-update", (incomingCircuit) => {
        clearTimeout(timeout);
        if (incomingCircuit.gates?.[0]?.type === "H") {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      // Broadcast from client 1
      client1.emit("circuit-update", { roomId, circuit: testCircuit });
    });

    client1.disconnect();
    client2.disconnect();

    results.push({
      name: "WebSocket Room State Sync (Client 1 -> Client 2 Live Broadcast)",
      passed: updateReceived,
      details: updateReceived
        ? "Broadcast verified: Client 2 instantly received quantum gate drop from Client 1."
        : "Failed: Client 2 did not receive broadcast within 4000ms."
    });
  } catch (err: any) {
    results.push({ name: "WebSocket Room State Sync", passed: false, details: err.message });
  }

  // Test 2: Room Capacity Limits (2-5 Max Collaborators)
  try {
    const roomId = `CAPACITY_TEST_${Date.now()}`;
    const sockets: Socket[] = [];

    // Connect 5 users (Allowed capacity)
    for (let i = 0; i < 5; i++) {
      const s = io(SOCKET_URL, { reconnection: false });
      await new Promise<void>((res) => s.on("connect", () => res()));
      s.emit("join-room", roomId);
      sockets.push(s);
    }

    // Try to connect a 6th user (Should be rejected with 'room-full')
    const sixthUser = io(SOCKET_URL, { reconnection: false });
    await new Promise<void>((res) => sixthUser.on("connect", () => res()));

    const roomFullReceived = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 3000);
      sixthUser.on("room-full", (err) => {
        clearTimeout(timeout);
        resolve(true);
      });
      sixthUser.emit("join-room", roomId);
    });

    // Cleanup all sockets
    sockets.forEach((s) => s.disconnect());
    sixthUser.disconnect();

    results.push({
      name: "Scalability Limit: Enforce Max 5 Users Per Collaboration Room",
      passed: roomFullReceived,
      details: roomFullReceived
        ? "Enforcement verified: 6th connection was rejected with 'room-full' event."
        : "Warning: Room allowed >5 users without triggering limit."
    });
  } catch (err: any) {
    results.push({ name: "WebSocket Room Capacity Limit", passed: false, details: err.message });
  }

  return results;
}
