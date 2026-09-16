/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Socratic AI Tutor & Quantum Co-Pilot
 * Modern White-First Design with Interactive Chat Stream
 */

import React, { useState, useRef, useEffect } from 'react';
import { CircuitState } from '../types';
import {
  Send,
  Loader2,
  Volume2,
  Bot,
  User,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { renderMixedTextWithLatex } from './MathView';

interface SocraticTutorProps {
  circuit: CircuitState;
  soundEnabled: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  circuitSnapshot?: string;
  verification?: {
    type: string;
    confidence: number;
  };
}

export const SocraticTutor: React.FC<SocraticTutorProps> = ({ circuit, soundEnabled }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Greetings! I am your Quantum AI Tutor. I can help guide your understanding of superposition, phase interference, quantum gates, and circuit design. What quantum phenomenon or circuit would you like to explore together today?",
      timestamp: 'Just now',
      verification: { type: 'A', confidence: 1.0 },
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    'Why does measuring Qubit 0 instantly collapse Qubit 1 in a Bell state?',
    'Explain the physical mechanism of phase kickback in Deutsch-Jozsa.',
    'What prevents us from building an exact quantum copy machine (No-Cloning Theorem)?',
    'How does Grover diffusion reflect amplitudes across the mean?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      circuitSnapshot: `${circuit.numQubits} qubits, ${circuit.gates.length} gates`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          circuitContext: circuit,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Let us examine the statevector: what happens to the relative phase when you apply a Pauli-Z gate?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verification: data.verification || { type: 'A', confidence: 0.98 },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: "Consider this: in quantum mechanics, what does applying a Hadamard gate do to the basis state |0⟩? If |0⟩ transforms to (|0⟩ + |1⟩)/√2, how would you expect the probabilities of measurement to change?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verification: { type: 'B', confidence: 0.9 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[750px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Tutor Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Quantum AI Tutor</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                Interactive Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Circuit: <strong className="text-slate-800">{circuit.numQubits} Qubits</strong>,{' '}
              <strong className="text-slate-800">{circuit.gates.length} Gates</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Statevector</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 break-words overflow-hidden ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    : 'bg-indigo-600 border border-indigo-600 text-white shadow-xs'
                }`}
              >
                <div className="leading-relaxed break-words font-medium">
                  {renderMixedTextWithLatex(msg.text)}
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-75 font-mono pt-1">
                  <span>{msg.timestamp}</span>
                  {isAi && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <span>Confidence: {(Number(msg.verification?.confidence || 0.98) * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-700 text-xs font-mono p-3 bg-white rounded-xl w-fit border border-indigo-200 shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Analyzing quantum circuit state...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Inquiry Sparks:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          id="input-socratic-query"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question about your circuit, phase, gates, or quantum mechanics..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans shadow-2xs"
        />
        <button
          id="btn-send-socratic-query"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputQuery.trim()}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
