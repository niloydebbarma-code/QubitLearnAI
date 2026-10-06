/**
 * Full-duplex collaboration tests with five independent users and isolation
 * checks. These tests use a real Socket.IO server and real client sockets.
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';

type TestResult = { name: string; passed: boolean; details: string };

export async function runRealWebSocketTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const httpServer = createServer();
  const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });
  const roomId = 'quantum-studio-room-1';

  io.on('connection', (socket) => {
    socket.on('join_room', (requestedRoom: string) => {
      socket.join(requestedRoom);
      socket.emit('room_joined', { roomId: requestedRoom, status: 'CONNECTED' });
    });
    socket.on('circuit_mutation', (data: { roomId: string }) => {
      io.to(data.roomId).emit('circuit_synced', {
        ...data,
        serverTimestamp: Date.now(),
      });
    });
  });

  const port = await new Promise<number>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => {
      const address = httpServer.address();
      resolve(typeof address === 'object' && address ? address.port : 3001);
    });
  });
  const clients = Array.from({ length: 5 }, () =>
    ClientSocket(`http://127.0.0.1:${port}`)
  );

  const waitForJoin = (client: ClientSocketType): Promise<boolean> =>
    new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 3000);
      client.once('room_joined', (data) => {
        clearTimeout(timeout);
        resolve(data.roomId === roomId && data.status === 'CONNECTED');
      });
      if (client.connected) client.emit('join_room', roomId);
      else client.once('connect', () => client.emit('join_room', roomId));
    });

  try {
    const connected = await Promise.all(clients.map((client) =>
      new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000);
        client.once('connect', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      })
    ));
    results.push({
      name: 'C01 Five-User Socket.IO Handshake',
      passed: connected.every(Boolean),
      details: `${connected.filter(Boolean).length}/5 independent clients connected to port ${port}.`,
    });

    const joined = await Promise.all(clients.map(waitForJoin));
    results.push({
      name: 'C02 Five-User Room Membership',
      passed: joined.every(Boolean),
      details: `${joined.filter(Boolean).length}/5 clients received the expected room acknowledgement.`,
    });

    const peerReceipts = await new Promise<number>((resolve) => {
      let receipts = 0;
      const handler = (data: { gate: string; qubit: number; userId: string }) => {
        if (data.gate === 'H' && data.qubit === 0 && data.userId === 'user-alice') receipts++;
        if (receipts === 4) resolve(receipts);
      };
      clients.slice(1).forEach((client) => client.once('circuit_synced', handler));
      clients[0].emit('circuit_mutation', {
        roomId, gate: 'H', qubit: 0, userId: 'user-alice',
      });
      setTimeout(() => resolve(receipts), 3000);
    });
    results.push({
      name: 'C03 Full-Duplex Fan-Out to Four Peers',
      passed: peerReceipts === 4,
      details: `One mutation was delivered exactly once to ${peerReceipts}/4 peers.`,
    });

    const privateClient = ClientSocket(`http://127.0.0.1:${port}`);
    let leaked = false;
    try {
      await new Promise<void>((resolve) => {
        privateClient.once('connect', () => privateClient.emit('join_room', 'private-room-2'));
        privateClient.once('room_joined', () => resolve());
        setTimeout(resolve, 3000);
      });
      privateClient.once('circuit_synced', () => { leaked = true; });
      clients[1].emit('circuit_mutation', {
        roomId, gate: 'X', qubit: 1, userId: 'user-bob',
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      privateClient.disconnect();
    }
    results.push({
      name: 'C04 Cross-Room Isolation',
      passed: !leaked,
      details: leaked ? 'Mutation leaked to a different room.' : 'No cross-room mutation was observed.',
    });

    const order = await new Promise<string[]>((resolve) => {
      const observed: string[] = [];
      const onMutation = (data: { gate: string; userId: string }) => {
        if (data.userId !== 'user-order') return;
        observed.push(data.gate);
        if (observed.length === 2) resolve(observed);
      };
      clients[2].on('circuit_synced', onMutation);
      clients[0].emit('circuit_mutation', { roomId, gate: 'Y', qubit: 0, userId: 'user-order' });
      clients[0].emit('circuit_mutation', { roomId, gate: 'Z', qubit: 0, userId: 'user-order' });
      setTimeout(() => resolve(observed), 3000);
    });
    results.push({
      name: 'C05 Ordered Mutation Delivery',
      passed: order.join(',') === 'Y,Z',
      details: `Peer observed ordered mutations: ${order.join(',') || 'none'}.`,
    });
  } finally {
    clients.forEach((client) => client.disconnect());
    io.close();
    httpServer.close();
  }

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('websocket_synchronization_test')) {
  runRealWebSocketTests().then((tests) => {
    const passed = tests.filter((test) => test.passed).length;
    tests.forEach((test) => console.log(`[${test.passed ? 'PASS' : 'FAIL'}] ${test.name}: ${test.details}`));
    console.log(`Summary: ${passed}/${tests.length} tests passed`);
    process.exit(passed === tests.length ? 0 : 1);
  });
}
