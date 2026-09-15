/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Minimal, Movable Quantum AI Chatbox
 * Clean 1-word title ("AI"), concise welcome, quick essential actions
 * ("Explain Circuit", "Formulas & Theory"), and student movement/zoom controls.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Bot,
  Volume2,
  Copy,
  Check,
  Send,
  Loader2,
  Move,
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  Minus,
  ZoomIn,
  ZoomOut,
  User,
  GripHorizontal,
  Trash2,
} from 'lucide-react';
import { renderMixedTextWithLatex } from './MathView';
import { CircuitState, ComplexNumber } from '../types';

export interface AIExplanationContext {
  topic: 'general' | 'amplitudes' | 'probabilities' | 'density_matrix' | 'bloch_sphere' | 'pauli_matrices' | 'entanglement' | 'unitary_proof' | 'circuit_step' | 'basis_state';
  title?: string;
  statevector?: { binary: string; amplitude: ComplexNumber; probability: number }[];
  circuit?: CircuitState;
  blochCoords?: { x: number; y: number; z: number; theta: number; phi: number };
  basisState?: string;
  mathLatex?: string;
  customPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type ViewLayoutMode = 'center' | 'dock_right' | 'dock_left' | 'floating' | 'fullscreen';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: AIExplanationContext | null;
  onNavigateToTutor?: (initialQuery: string) => void;
  initialLayoutMode?: ViewLayoutMode;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  context,
  initialLayoutMode = 'dock_right',
}) => {
  // Layout and Display Controls
  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>(initialLayoutMode);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [dockWidth, setDockWidth] = useState<number>(440);

  // Free Draggable Floating Window Position (in px)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 480) : 100;
    const defaultY = typeof window !== 'undefined' ? 70 : 70;
    return { x: defaultX, y: defaultY };
  });

  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  // Single Minimal Chat Stream with brief welcome
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 **Welcome!** Ask any question, or tap an option below to analyze your live circuit and quantum formulas.",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastHandledPromptRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Dragging logic for Floating mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (layoutMode !== 'floating' && layoutMode !== 'center') return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const maxX = Math.max(0, window.innerWidth - 280);
    const maxY = Math.max(0, window.innerHeight - 120);

    setPosition({
      x: Math.min(Math.max(10, dragStartRef.current.initialPosX + deltaX), maxX),
      y: Math.min(Math.max(10, dragStartRef.current.initialPosY + deltaY), maxY),
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch drag support for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (layoutMode !== 'floating') return;
    const touch = e.touches[0];
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.startX;
    const deltaY = touch.clientY - dragStartRef.current.startY;

    const maxX = Math.max(0, window.innerWidth - 260);
    const maxY = Math.max(0, window.innerHeight - 100);

    setPosition({
      x: Math.min(Math.max(5, dragStartRef.current.initialPosX + deltaX), maxX),
      y: Math.min(Math.max(5, dragStartRef.current.initialPosY + deltaY), maxY),
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Trigger contextual prompt when opened from a specific button
  useEffect(() => {
    if (!isOpen || !context) return;
    setIsMinimized(false);

    const promptKey = `${context.topic}-${context.title}-${context.customPrompt || ''}-${context.mathLatex || ''}-${context.basisState || ''}`;
    if (lastHandledPromptRef.current === promptKey) return;
    lastHandledPromptRef.current = promptKey;

    const query =
      context.customPrompt ||
      (context.title ? `Explain ${context.title}` : `Explain current ${context.topic.replace('_', ' ')}`);

    sendMessage(query, context);
  }, [isOpen, context?.topic, context?.customPrompt, context?.mathLatex, context?.basisState]);

  // Send a message into the single chat channel
  const sendMessage = async (textToSend: string, activeContext?: AIExplanationContext | null) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const ctx = activeContext !== undefined ? activeContext : context;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let replyText = '';

      if (ctx?.topic && (ctx.topic !== 'general' || ctx.customPrompt)) {
        const response = await fetch('/api/ai/explain-quantum-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: ctx.topic,
            title: ctx.title,
            statevector: ctx.statevector,
            circuit: ctx.circuit,
            blochCoords: ctx.blochCoords,
            basisState: ctx.basisState,
            mathLatex: ctx.mathLatex,
            question: query,
          }),
        });

        if (response.ok) {
          const res = await response.json();
          if (res.conceptSummary || res.physicalIntuition) {
            replyText = `### ${res.title || 'Analysis'}\n\n${res.conceptSummary}\n\n**Physical Intuition:**\n${res.physicalIntuition}`;
            if (res.mathematicalDerivation) {
              replyText += `\n\n**Mathematical Formulation:**\n$$${res.mathematicalDerivation}$$`;
            }
            if (res.interferenceAndPhase) {
              replyText += `\n\n**Phase & Interference:**\n${res.interferenceAndPhase}`;
            }
            if (res.keyTakeaway) {
              replyText += `\n\n💡 **Key Takeaway:** ${res.keyTakeaway}`;
            }
          }
        }
      }

      if (!replyText) {
        const tutorResponse = await fetch('/api/ai/socratic-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            circuitContext: ctx?.circuit || { numQubits: 2, gates: [] },
            blochContext: ctx?.blochCoords,
            history: messages.slice(-4).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text,
            })),
          }),
        });

        if (tutorResponse.ok) {
          const tData = await tutorResponse.json();
          replyText = tData.reply;
        }
      }

      if (!replyText) {
        replyText =
          "Unitary operators preserve state normalization: $\\sum |\\alpha_i|^2 = 1$. Quantum phase controls destructive and constructive interference.";
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: "Quantum superposition state: $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, where $|\\alpha|^2 + |\\beta|^2 = 1$.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeechMsgId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#$`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setActiveSpeechMsgId(null);
    utterance.onerror = () => setActiveSpeechMsgId(null);

    window.speechSynthesis.speak(utterance);
    setActiveSpeechMsgId(msgId);
  };

  const cycleZoom = (delta: number) => {
    const scales = [0.85, 1.0, 1.15, 1.30];
    const currentIndex = scales.indexOf(zoomScale);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= scales.length) nextIndex = scales.length - 1;
    setZoomScale(scales[nextIndex]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "👋 **Welcome!** Ask any question, or tap an option below to analyze your circuit and formulas.",
        timestamp: 'Just now',
      },
    ]);
  };

  if (!isOpen) return null;

  // Render Minimized Floating Pill
  if (isMinimized) {
    return (
      <div
        className="fixed z-50 bottom-6 right-6 flex items-center space-x-2 p-2 rounded-2xl bg-indigo-600 text-white shadow-2xl border border-indigo-400 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-bottom-5"
        onClick={() => setIsMinimized(false)}
        title="Restore AI Chat"
      >
        <div className="p-1.5 rounded-xl bg-white/20 text-yellow-300">
          <Bot className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold pr-1 font-sans">AI</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Dynamic Styles & Positions based on student layout mode
  let containerStyle: React.CSSProperties = {};
  let containerClasses = 'bg-white text-slate-800 shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-150';

  if (layoutMode === 'dock_right') {
    containerClasses += ' fixed right-0 top-0 bottom-0 h-full z-50 border-l border-slate-300 animate-in slide-in-from-right duration-200';
    containerStyle = {
      width: `min(100vw, ${dockWidth}px)`,
    };
  } else if (layoutMode === 'dock_left') {
    containerClasses += ' fixed left-0 top-0 bottom-0 h-full z-50 border-r border-slate-300 animate-in slide-in-from-left duration-200';
    containerStyle = {
      width: `min(100vw, ${dockWidth}px)`,
    };
  } else if (layoutMode === 'fullscreen') {
    containerClasses += ' fixed inset-2 sm:inset-4 z-50 rounded-2xl animate-in zoom-in-95 duration-150';
  } else if (layoutMode === 'floating') {
    containerClasses += ' fixed z-50 rounded-2xl animate-in zoom-in-95 duration-100 shadow-2xl';
    containerStyle = {
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `min(94vw, ${dockWidth}px)`,
      height: 'min(86vh, 680px)',
    };
  } else {
    // center modal
    containerClasses += ' relative w-full max-w-xl max-h-[85vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150';
  }

  return (
    <>
      {/* Background Backdrop (only in Center mode) */}
      {layoutMode === 'center' && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Container Wrapper */}
      <div
        className={layoutMode === 'center' ? 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6' : ''}
        style={{ fontSize: `${zoomScale * 100}%` }}
      >
        <div className={containerClasses} style={containerStyle}>
          {/* Header Bar — 1-word Title ("AI") and Drag/Placement Controls */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`px-3 py-2 bg-gradient-to-r from-indigo-50 via-slate-50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 select-none ${
              layoutMode === 'floating' ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            {/* 1-Word Title: "AI" with Drag Handle */}
            <div className="flex items-center space-x-2">
              {layoutMode === 'floating' && (
                <div className="p-0.5 text-slate-400 hover:text-slate-600" title="Drag to move">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              )}
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-sans tracking-wide">
                AI
              </h3>
            </div>

            {/* Header Controls (Zoom, Left/Float/Right, Min, Close) */}
            <div className="flex items-center space-x-1 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => cycleZoom(-1)}
                  disabled={zoomScale <= 0.85}
                  title="Smaller font"
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[10px] font-mono font-bold text-slate-600 select-none">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => cycleZoom(1)}
                  disabled={zoomScale >= 1.3}
                  title="Larger font"
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Layout Placement Controls (Left / Float / Right / Fullscreen) */}
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLayoutMode('dock_left')}
                  title="Dock Left"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layoutMode === 'dock_left' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('floating')}
                  title="Move freely"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layoutMode === 'floating' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('dock_right')}
                  title="Dock Right"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layoutMode === 'dock_right' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PanelRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode(layoutMode === 'fullscreen' ? 'dock_right' : 'fullscreen')}
                  title={layoutMode === 'fullscreen' ? 'Exit Fullscreen' : 'Fullscreen'}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layoutMode === 'fullscreen' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {layoutMode === 'fullscreen' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Clear */}
              <button
                type="button"
                onClick={clearChat}
                title="Clear"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clean User Option Buttons: Exactly "Explain Circuit" and "Formulas & Theory" */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 shrink-0">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage('Explain current circuit')}
              className="flex-1 text-center py-1.5 px-3 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-950 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Explain Circuit
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage('Explain quantum formulas and theory for this state')}
              className="flex-1 text-center py-1.5 px-3 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-950 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Formulas & Theory
            </button>
          </div>

          {/* Single Unified Chat Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60">
            {messages.map((msg) => {
              const isAi = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 break-words ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    <div className="font-sans leading-relaxed">
                      {renderMixedTextWithLatex(msg.text)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] opacity-70 font-mono pt-1 border-t border-slate-100/60">
                      <span>{msg.timestamp}</span>

                      {isAi && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSpeech(msg.id, msg.text)}
                            title={activeSpeechMsgId === msg.id ? 'Stop voice' : 'Listen with voice'}
                            className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                              activeSpeechMsgId === msg.id ? 'text-indigo-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            title="Copy message"
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-indigo-700 text-xs font-mono p-2 bg-white rounded-lg w-fit border border-indigo-200 shadow-2xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about circuit, gates, formulas, or states..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 shadow-2xs transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-2xs flex items-center space-x-1 cursor-pointer shrink-0 transition"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
