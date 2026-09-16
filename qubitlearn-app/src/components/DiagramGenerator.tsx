/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Section 4.3 & 7.3: Quantum State & Circuit Diagram Generator
 * Modern White-First Design with Vibrant Emerald & Cyan Accents
 */

import React, { useState, useEffect } from 'react';
import { CircuitState, DiagramGeneratorResult } from '../types';
import {
  Layers,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Download,
  Info,
  ExternalLink,
} from 'lucide-react';

interface DiagramGeneratorProps {
  circuit: CircuitState;
}

export const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ circuit }) => {
  const [diagramData, setDiagramData] = useState<DiagramGeneratorResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'svg' | 'tikz' | 'imagen'>('svg');
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDiagram = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agents/diagram-generator/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit }),
      });
      const data = await res.json();
      setDiagramData(data);
    } catch (err) {
      
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagram();
  }, [circuit]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSvg = () => {
    if (!diagramData?.svgCode) return;
    const blob = new Blob([diagramData.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_circuit_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Quantum Circuit & State Diagram Generator
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                Exact Math Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic SVG rendering, publication-ready TikZ quantikz code, and AI narrative callouts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDiagram}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          {diagramData?.svgCode && (
            <button
              onClick={downloadSvg}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('svg')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'svg'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deterministic Vector SVG
        </button>
        <button
          onClick={() => setActiveSubTab('tikz')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'tikz'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          LaTeX TikZ quantikz
        </button>
        <button
          onClick={() => setActiveSubTab('imagen')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'imagen'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Illustrative Imagen Prompt
        </button>
      </div>

      {/* Content */}
      {diagramData ? (
        <div className="space-y-6">
          {activeSubTab === 'svg' && (
            <div className="space-y-4">
              <div
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center items-center overflow-x-auto shadow-inner"
                dangerouslySetInnerHTML={{ __html: diagramData.svgCode }}
              />

              {/* LLM Narrative Labeling & Callouts */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                    Narrative Caption & Callout Annotations
                  </span>
                  {diagramData.labeling.conceptLink && (
                    <a
                      href={diagramData.labeling.conceptLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 text-xs flex items-center space-x-1 hover:underline font-semibold"
                    >
                      <span>Theoretical Reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {diagramData.labeling.caption}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {diagramData.labeling.callouts.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start space-x-2 text-xs shadow-2xs"
                    >
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagram Auditor Report */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[11px] mb-1 font-medium">Wire Count Parity:</span>
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {diagramData.auditorReport.wireCountMatches ? 'Matched to Register' : 'Discrepancy'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[11px] mb-1 font-medium">Unitary Matrix Validity:</span>
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {diagramData.auditorReport.unitaryValid ? 'Unitary (U†U = I)' : 'Non-Unitary'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[11px] mb-1 font-medium">Auditor Confidence:</span>
                  <span className="text-emerald-700 font-bold text-xs">
                    {(diagramData.auditorReport.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'tikz' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-mono font-medium">
                  Publication-ready LaTeX \usepackage{'{quantikz}'} code:
                </span>
                <button
                  onClick={() => copyToClipboard(diagramData.tikzCode, 'tikz')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied === 'tikz' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copied === 'tikz' ? 'Copied' : 'Copy TikZ'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-emerald-800 overflow-x-auto whitespace-pre shadow-inner">
                {diagramData.tikzCode}
              </pre>
            </div>
          )}

          {activeSubTab === 'imagen' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Concept Illustration Visual Description:
                </span>
                <button
                  onClick={() => copyToClipboard(diagramData.illustrativeImagenPrompt, 'imagen')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied === 'imagen' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copied === 'imagen' ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono shadow-inner">
                {diagramData.illustrativeImagenPrompt}
              </div>
              <p className="text-[11px] text-slate-500">
                Scientific diagrams are calculated deterministically from quantum state vectors. Visual concept prompts are provided for publication illustrations.
              </p>
            </div>
          )}

          {/* Universal Verifier Sidecar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{diagramData.verificationSidecar.verificationType}</span>
            </div>
            <span className="text-slate-500 text-[11px]">
              {diagramData.verificationSidecar.disclosure}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading diagram rendering engine...
        </div>
      )}
    </div>
  );
};
