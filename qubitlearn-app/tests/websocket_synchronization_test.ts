/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Full-Duplex WebSockets & Real-Time Sync Test Suite
 * Real execution of Socket.IO server & client duplex event communication.
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';

export async function runRealWebSocketTests(): Promise<{ name: string; passed: boolean; details: string }[]> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  const httpServer = createServer();
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  const port = await new Promise<number>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => {
      const addr = httpServer.address();
      const p = typeof addr === 'object' && addr ? addr.port : 3001;
      resolve(p);
    });
  });

  // Setup server event handlers
  io.on('connection', (socket) => {
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      socket.emit('room_joined', { roomId, status: 'CONNECTED' });
    });

    socket.on('circuit_mutation', (data: any) => {
      io.to(data.roomId).emit('circuit_synced', {
        ...data,
        serverTimestamp: Date.now()
      });
    });
  });

  // Connect client 1 and client 2
  const client1: ClientSocketType = ClientSocket(`http://127.0.0.1:${port}`);
  const client2: ClientSocketType = ClientSocket(`http://127.0.0.1:${port}`);

  try {
    // 1. Connection & Handshake Test
    const client1Connected = await new Promise<boolean>((resolve) => {
      client1.on('connect', () => resolve(true));
      setTimeout(() => resolve(false), 2000);
    });

    results.push({
      name: 'Socket.IO Full-Duplex Connection Handshake',
      passed: client1Connected,
      details: client1Connected ? `Client connected to local duplex socket port ${port}.` : 'Connection timeout.'
    });

    // 2. Room Joining & Acknowledgement
    const roomJoined = await new Promise<boolean>((resolve) => {
      client1.emit('join_room', 'quantum-studio-room-1');
      client1.on('room_joined', (data) => {
        resolve(data.roomId === 'quantum-studio-room-1' && data.status === 'CONNECTED');
      });
      setTimeout(() => resolve(false), 2000);
    });

    results.push({
      name: 'WebSocket Room Subscription (join_room)',
      passed: roomJoined,
      details: roomJoined ? 'Subscribed to multi-user collaborative room.' : 'Room join timeout.'
    });

    // 3. Bidirectional Mutation Sync across 2 Clients
    const mutationReceived = await new Promise<boolean>((resolve) => {
      client2.on('connect', () => {
        client2.emit('join_room', 'quantum-studio-room-1');
      });

      if (client2.connected) {
        client2.emit('join_room', 'quantum-studio-room-1');
      }

      client2.on('room_joined', () => {
        client1.emit('circuit_mutation', {
          roomId: 'quantum-studio-room-1',
          gate: 'H',
          qubit: 0,
          userId: 'user-alice'
        });
      });
      
      client2.on('circuit_synced', (data) => {
        resolve(data.gate === 'H' && data.qubit === 0);
      });

      setTimeout(() => resolve(false), 3000);
    });

    results.push({
      name: 'Bidirectional Circuit State Synchronization',
      passed: mutationReceived,
      details: mutationReceived ? 'Full-duplex broadcast delivered between Client 1 and Client 2.' : 'Broadcast timeout.'
    });

  } finally {
    client1.disconnect();
    client2.disconnect();
    io.close();
    httpServer.close();
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('websocket_synchronization_test')) {
  console.log('='.repeat(80));
  console.log('FULL-DUPLEX WEBSOCKET SYNCHRONIZATION VERIFICATION');
  console.log('='.repeat(80));
  runRealWebSocketTests().then(tests => {
    let passed = 0;
    for (const t of tests) {
      console.log(`[${t.passed ? 'PASS' : 'FAIL'}] ${t.name}: ${t.details}`);
      if (t.passed) passed++;
    }
    console.log('='.repeat(80));
    console.log(`Summary: ${passed}/${tests.length} tests passed`);
    console.log('='.repeat(80));
    process.exit(passed === tests.length ? 0 : 1);
  });
}
