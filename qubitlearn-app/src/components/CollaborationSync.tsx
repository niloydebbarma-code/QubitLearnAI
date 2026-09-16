/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Google Classroom-Style Quantum Lab Collaboration Engine
 * Modern White-First Design with Vibrant Emerald / Teal Interactive Accents
 */

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Users,
  Check,
  AlertCircle,
  Plus,
  Share2,
  X,
  Copy,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CircuitState } from '../types';

interface RoomMember {
  socketId: string;
  name: string;
  role: string;
  isHost?: boolean;
}

interface OpenRoom {
  id: string;
  name: string;
  hostName: string;
  maxUsers: number;
  userCount: number;
}

interface CollaborationSyncProps {
  circuit: CircuitState;
  setCircuit: React.Dispatch<React.SetStateAction<CircuitState>>;
}

/**
 * Google Classroom-style code generation algorithm:
 * Uses a safe 30-character alphabet omitting visually ambiguous characters (0, O, o, 1, I, l).
 */
function generateClassroomCode(): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  let code = 'qc-';
  for (let i = 0; i < 5; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return code;
}

export const CollaborationSync: React.FC<CollaborationSyncProps> = ({ circuit, setCircuit }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [activeRoomName, setActiveRoomName] = useState<string>('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [openRooms, setOpenRooms] = useState<OpenRoom[]>([]);
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDisplayCodeOpen, setIsDisplayCodeOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const lastSentCircuitHash = useRef<string>('');

  const getUserProfile = () => {
    try {
      const saved = localStorage.getItem('qubitlearn_user');
      return saved ? JSON.parse(saved) : { name: 'Alex Mercer', role: 'student' };
    } catch {
      return { name: 'Alex Mercer', role: 'student' };
    }
  };

  const currentUser = getUserProfile();

  useEffect(() => {
    try {
      const socketUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      socketRef.current = io(socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current?.emit('get-rooms');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', () => {
        setIsConnected(false);
      });

      socketRef.current.on('room-members', (memberList: RoomMember[]) => {
        setMembers(memberList || []);
      });

      socketRef.current.on('rooms-list', (rooms: OpenRoom[]) => {
        setOpenRooms(rooms || []);
      });

      // Host or Student admitted to room
      socketRef.current.on('room-joined', (data: { room: any }) => {
        setInRoom(true);
        setActiveRoomName(data.room.name);
        setRoomId(data.room.id);
        setErrorMessage(null);
        setIsLobbyOpen(false);
        setIsCreateModalOpen(false);
      });

      // Real-time canvas state synchronizer (prevents echo broadcast loops)
      socketRef.current.on('circuit-update', (newCircuit: CircuitState) => {
        if (newCircuit && Array.isArray(newCircuit.gates)) {
          lastSentCircuitHash.current = JSON.stringify(newCircuit);
          setCircuit(newCircuit);
        }
      });

      socketRef.current.on('room-full', (payload: any) => {
        setErrorMessage(payload?.message || 'This lab room has reached its maximum capacity of 5 members.');
        setTimeout(() => setErrorMessage(null), 5000);
      });

      // Auto-join from share link (?cjc=CODE or ?room=CODE)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('cjc') || urlParams.get('room');
        if (inviteCode) {
          const profile = getUserProfile();
          setTimeout(() => {
            socketRef.current?.emit('join-room', {
              roomId: inviteCode.toLowerCase(),
              userName: profile.name,
              userRole: profile.role,
            });
          }, 600);
        }
      }
    } catch (_) {}

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Broadcast circuit state changes to all collaborators in room
  useEffect(() => {
    if (inRoom && roomId && socketRef.current && circuit) {
      const currentHash = JSON.stringify(circuit);
      if (currentHash !== lastSentCircuitHash.current) {
        lastSentCircuitHash.current = currentHash;
        socketRef.current.emit('circuit-update', { roomId, circuit });
      }
    }
  }, [circuit, inRoom, roomId]);

  // Google Classroom: Host Creates Class Session
  const handleCreateNewClassroom = () => {
    const newCode = generateClassroomCode();
    const topic = customRoomName.trim() || `Quantum Lab ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const profile = getUserProfile();

    socketRef.current?.emit('create-room', {
      roomId: newCode,
      roomName: topic,
      userName: profile.name,
      userRole: profile.role,
    });
  };

  // Google Classroom: Student Joins via Class Code
  const handleJoinByClassCode = (codeToJoin: string) => {
    const cleanCode = codeToJoin.trim().toLowerCase();
    if (!cleanCode) return;
    const profile = getUserProfile();
    socketRef.current?.emit('join-room', {
      roomId: cleanCode,
      userName: profile.name,
      userRole: profile.role,
    });
  };

  const handleLeaveClass = () => {
    if (roomId && socketRef.current) {
      socketRef.current.emit('leave-room', roomId);
    }
    setInRoom(false);
    setRoomId('');
    setActiveRoomName('');
    setMembers([]);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('cjc');
      url.searchParams.delete('room');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined' && roomId) {
      const inviteUrl = `${window.location.origin}${window.location.pathname}?cjc=${roomId}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCodeOnly = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 font-sans">
      {/* 1. STATE: ACTIVE IN CLASSROOM LAB */}
      {inRoom ? (
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs text-xs">
          {/* Class Title & Display Code Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsDisplayCodeOpen(true)}
            className="flex items-center gap-1.5 hover:text-emerald-900 transition cursor-pointer text-left"
            title="Click to view and display Class Code on projector"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-950 max-w-[120px] sm:max-w-[160px] truncate">
              {activeRoomName}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-emerald-300 text-emerald-700 font-bold">
              {roomId}
            </span>
          </button>

          {/* Member Presence Avatars & Active Count */}
          <div className="flex items-center space-x-1.5 pl-1">
            <div className="flex items-center -space-x-1.5">
              {members.map((m, idx) => (
                <div
                  key={m.socketId || idx}
                  className="w-5 h-5 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                  title={`${m.name} (${m.role || 'Student'})`}
                >
                  {m.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              ))}
            </div>

            <span className="text-[10px] font-mono text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
              {members.length}/5 Collab
            </span>
          </div>

          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="p-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer shadow-2xs"
            title="Copy Google Classroom-style Invite Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={handleLeaveClass}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold pl-1 cursor-pointer"
          >
            Leave
          </button>
        </div>
      ) : (
        /* 2. STATE: NOT IN ROOM (Google Classroom Entry Buttons) */
        <div className="flex items-center gap-1.5">
          {/* Join Class Button */}
          <button
            type="button"
            onClick={() => {
              socketRef.current?.emit('get-rooms');
              setIsLobbyOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
            title="Join Class with Code or Browse Open Labs"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Join Lab</span>
          </button>

          {/* Create Class Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer shadow-2xs"
            title="Create a new Classroom Quantum Lab"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lab</span>
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-20 right-8 z-50 bg-rose-50 border border-rose-300 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* MODAL 1: Google Classroom "Display Class Code" Full Projector View */}
      {isDisplayCodeOpen && inRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 text-center relative">
            <button
              type="button"
              onClick={() => setIsDisplayCodeOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">
                Classroom Collaboration Lab
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{activeRoomName}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Display this code on the projector or share the link with students to collaborate in real time.
              </p>
            </div>

            {/* Giant Display Code Box */}
            <div className="p-6 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl shadow-inner space-y-2">
              <span className="text-xs text-emerald-800 uppercase font-mono font-bold">Class Code</span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-emerald-700 select-all">
                {roomId}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyCodeOnly}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Class Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
            </div>

            {/* Joined Collaborators Roster */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">Active Participants:</span>
                <span className="font-mono text-emerald-700 font-bold">{members.length} / 5</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {members.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">({m.role})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Google Classroom "Join Class with Code" Dialog */}
      {isLobbyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Join Classroom Lab</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLobbyOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Identity Confirmation (Google Classroom Pattern) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono capitalize">
                    {currentUser.role} Account
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                Verified
              </span>
            </div>

            {/* Class Code Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Class Code (Ask your teacher for the class code)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. qc-7xy8z"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinByClassCode(joinCodeInput)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500 shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  disabled={!joinCodeInput.trim()}
                  onClick={() => handleJoinByClassCode(joinCodeInput)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Active Class Labs in Your School / Institution */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Active Open Quantum Labs:</span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {openRooms.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl border border-slate-200">
                    No active open classroom labs right now. Click "New Lab" to create one.
                  </p>
                ) : (
                  openRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{room.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Lead: {room.hostName} • Code: {room.id}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJoinByClassCode(room.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs"
                      >
                        Join ({room.userCount || 1}/5)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Google Classroom "Create Class" Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Create Classroom Lab</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Class / Lab Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 4: Bell State & Quantum Teleportation"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-semibold">Instructor / Session Lead Privileges:</div>
                <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5">
                  <li>Automatic 6-character Class Code generation.</li>
                  <li>Real-time multi-student circuit canvas synchronization.</li>
                  <li>Projector full-screen code display mode.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewClassroom}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
