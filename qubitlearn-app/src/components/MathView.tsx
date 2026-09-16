/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UNIVERSAL ACADEMIC MARKDOWN & KATEX LATEX RENDERING ENGINE
 * Formats:
 * 1. Multi-line Code Blocks (```python ... ```)
 * 2. Display Block Math ($$ ... $$)
 * 3. Inline Math ($ ... $)
 * 4. Dirac Bra-Ket Notation (|0⟩, |1⟩, |ψ⟩, |Φ⁺⟩, |00⟩, ⟨0|, ⟨ψ|)
 * 5. Markdown Bold (**text**), Italics (*text*), and Inline Code (`code`)
 * 6. Bullet Lists (- item) and Numbered Lists (1. item)
 */

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

// Helper: Normalize Dirac brackets and unicode symbols to clean LaTeX syntax
function normalizeLatexSymbols(input: string): string {
  if (!input) return '';
  return input
    .replace(/\|0⟩/g, '|0\\rangle')
    .replace(/\|1⟩/g, '|1\\rangle')
    .replace(/\|00⟩/g, '|00\\rangle')
    .replace(/\|01⟩/g, '|01\\rangle')
    .replace(/\|10⟩/g, '|10\\rangle')
    .replace(/\|11⟩/g, '|11\\rangle')
    .replace(/\|ψ⟩/g, '|\\psi\\rangle')
    .replace(/\|ϕ⟩/g, '|\\phi\\rangle')
    .replace(/\|Φ\+⟩/g, '|\\Phi^+\\rangle')
    .replace(/\|Φ⁺⟩/g, '|\\Phi^+\\rangle')
    .replace(/\|Ψ\+⟩/g, '|\\Psi^+\\rangle')
    .replace(/\|Ψ⁺⟩/g, '|\\Psi^+\\rangle')
    .replace(/\|Φ\-⟩/g, '|\\Phi^-\\rangle')
    .replace(/\|Φ⁻⟩/g, '|\\Phi^-\\rangle')
    .replace(/\|Ψ\-⟩/g, '|\\Psi^-\\rangle')
    .replace(/\|Ψ⁻⟩/g, '|\\Psi^-\\rangle')
    .replace(/\|\+⟩/g, '|+\\rangle')
    .replace(/\|\-⟩/g, '|-\\rangle')
    .replace(/⟨0\|/g, '\\langle 0|')
    .replace(/⟨1\|/g, '\\langle 1|')
    .replace(/⟨ψ\|/g, '\\langle \\psi|')
    .replace(/⟨ϕ\|/g, '\\langle \\phi|')
    .replace(/⟨/g, '\\langle ')
    .replace(/⟩/g, '\\rangle ')
    .replace(/√(\d+)/g, '\\sqrt{$1}')
    .replace(/√2/g, '\\sqrt{2}')
    .replace(/⊗/g, '\\otimes ')
    .replace(/·/g, '\\cdot ')
    .replace(/±/g, '\\pm ')
    .replace(/∓/g, '\\mp ');
}

/**
 * Renders LaTeX math expressions safely with KaTeX, falling back to clean text if parsing fails.
 */
export const MathView: React.FC<MathRendererProps> = ({ math, block = false, className = '' }) => {
  const normalized = normalizeLatexSymbols(math);
  try {
    const rawHtml = katex.renderToString(normalized, {
      displayMode: block,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
      trust: false,
    });
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return (
      <span
        className={`inline-math overflow-x-auto max-w-full break-words ${
          block
            ? 'block my-3 text-center overflow-x-auto p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 shadow-2xs font-serif'
            : 'inline-block align-middle mx-1 text-slate-900 font-serif'
        } ${className}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  } catch {
    return <span className={`font-serif text-slate-900 ${className}`}>{math}</span>;
  }
};

interface HtmlContentWithLatexProps {
  html: string;
  className?: string;
}

export const HtmlContentWithLatex: React.FC<HtmlContentWithLatexProps> = ({ html, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderMathInElement = (elem: HTMLElement) => {
      const walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT, null);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes('$')) {
          textNodes.push(node as Text);
        }
      }

      for (const textNode of textNodes) {
        const text = textNode.nodeValue || '';
        if (!text.includes('$')) continue;

        const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
        if (!regex.test(text)) continue;

        const spanWrapper = document.createElement('span');
        const parts = text.split(regex);

        for (const part of parts) {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = normalizeLatexSymbols(part.slice(2, -2).trim());
            try {
              const katexSpan = document.createElement('span');
              katexSpan.className = 'block my-3 text-center overflow-x-auto p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 shadow-2xs font-serif';
              const rawKatex = katex.renderToString(math, {
                displayMode: true,
                throwOnError: false,
                output: 'htmlAndMathml',
                strict: false,
                trust: false,
              });
              katexSpan.innerHTML = DOMPurify.sanitize(rawKatex);
              spanWrapper.appendChild(katexSpan);
            } catch {
              spanWrapper.appendChild(document.createTextNode(part));
            }
          } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
            const math = normalizeLatexSymbols(part.slice(1, -1).trim());
            try {
              const katexSpan = document.createElement('span');
              katexSpan.className = 'inline-block align-middle mx-1 text-slate-900 font-serif';
              const rawKatex = katex.renderToString(math, {
                displayMode: false,
                throwOnError: false,
                output: 'htmlAndMathml',
                strict: false,
                trust: false,
              });
              katexSpan.innerHTML = DOMPurify.sanitize(rawKatex);
              spanWrapper.appendChild(katexSpan);
            } catch {
              spanWrapper.appendChild(document.createTextNode(part));
            }
          } else if (part.length > 0) {
            spanWrapper.appendChild(document.createTextNode(part));
          }
        }

        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(spanWrapper, textNode);
        }
      }
    };

    renderMathInElement(containerRef.current);
  }, [html]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
      className={`prose max-w-none break-words overflow-hidden text-slate-900 font-serif leading-relaxed ${className}`}
    />
  );
};

// Helper: Formats inline markdown (bold, italics, code, Dirac kets)
function formatInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  // Regex to match: inline code `...`, bold **...**, italic *...*
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, i) => {
    const k = `${keyPrefix}_tok_${i}`;
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code key={k} className="px-2 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-sm border border-slate-200">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={k} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={k} className="italic text-slate-700">{token.slice(1, -1)}</em>;
    }

    // Check for inline Dirac kets like |0⟩, |1⟩, |ψ⟩, |Φ⁺⟩, |00⟩
    if (/\|[01ψϕ\+\-ΦΨ\d\w\+\-\^]+\⟩/g.test(token)) {
      return <MathView key={k} math={token} block={false} />;
    }

    return token;
  });
}

/**
 * Universal Rich Markdown + KaTeX LaTeX Renderer
 * Renders bold, italics, code blocks, lists, and LaTeX math cleanly across all AI responses.
 */
export const renderMixedTextWithLatex = (text: string): React.ReactNode => {
  if (!text) return null;

  // 1. Split text into Code Blocks (```...```) vs Regular Markdown/Math
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const blocks = text.split(codeBlockRegex);

  return (
    <span className="space-y-2 inline-block w-full text-base font-serif text-slate-900 leading-relaxed">
      {blocks.map((block, bIdx) => {
        // Code Block match
        if (block.startsWith('```') && block.endsWith('```')) {
          const lines = block.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const lang = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const codeBody = lang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={bIdx} className="my-3 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-sm border border-slate-800 shadow-sm overflow-x-auto">
              {lang && <div className="text-xs text-blue-400 uppercase tracking-wider mb-1.5 font-bold font-mono">{lang}</div>}
              <pre className="whitespace-pre leading-relaxed">{codeBody}</pre>
            </div>
          );
        }

        // 2. Split Regular Text by LaTeX $$...$$ and $...$
        const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
        const subParts = block.split(mathRegex);

        return (
          <React.Fragment key={bIdx}>
            {subParts.map((part, pIdx) => {
              if (part.startsWith('$$') && part.endsWith('$$')) {
                const math = part.slice(2, -2).trim();
                return <MathView key={`${bIdx}_${pIdx}`} math={math} block={true} />;
              }
              if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                const math = part.slice(1, -1).trim();
                return <MathView key={`${bIdx}_${pIdx}`} math={math} block={false} />;
              }

              // 3. Process line-by-line for bullet lists and formatting
              const lines = part.split('\n');
              return (
                <span key={`${bIdx}_${pIdx}`}>
                  {lines.map((line, lIdx) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
                    const isNumbered = /^\d+\.\s/.test(trimmed);

                    if (isBullet) {
                      const bulletContent = trimmed.replace(/^[-•*]\s+/, '');
                      return (
                        <span key={lIdx} className="flex items-start space-x-2 my-1.5 pl-3 text-slate-800">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="flex-1">{formatInlineMarkdown(bulletContent, `${bIdx}_${pIdx}_${lIdx}`)}</span>
                        </span>
                      );
                    }

                    if (isNumbered) {
                      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                      return (
                        <span key={lIdx} className="flex items-start space-x-2 my-1.5 pl-3 text-slate-800">
                          <span className="text-blue-600 font-bold font-serif">{numMatch?.[1]}.</span>
                          <span className="flex-1">{formatInlineMarkdown(numMatch?.[2] || '', `${bIdx}_${pIdx}_${lIdx}`)}</span>
                        </span>
                      );
                    }

                    return (
                      <React.Fragment key={lIdx}>
                        {formatInlineMarkdown(line, `${bIdx}_${pIdx}_${lIdx}`)}
                        {lIdx < lines.length - 1 && <br />}
                      </React.Fragment>
                    );
                  })}
                </span>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};

