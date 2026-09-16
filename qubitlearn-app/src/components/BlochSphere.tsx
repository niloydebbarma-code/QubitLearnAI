/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Interactive 3D Bloch Sphere Visualizer for Students
 * High-Visibility Crisp 3D Quantum State Sphere with Vivid Lines, Wireframes & Dotted Rays
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BlochCoordinates } from '../types';
import { 
  Rotate3d, 
  Compass, 
  Sparkles, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sliders, 
  Play, 
  Pause,
  Zap,
  Eye,
  SlidersHorizontal,
  Calculator,
  Percent,
  Binary,
  Check,
  RotateCcw
} from 'lucide-react';
import { MathView } from './MathView';
import { AIExplanationModal, AIExplanationContext } from './AIExplanationModal';

interface BlochSphereProps {
  coordinates: BlochCoordinates;
  qubitIndex: number;
  numQubits: number;
  onSelectQubit: (q: number) => void;
  onUpdateCoordinates?: (coords: BlochCoordinates) => void;
  onNavigateToTutor?: (initialQuery: string) => void;
}

type ColorTheme = 'nebula' | 'aurora' | 'hologram' | 'solar' | 'crystal';

interface ThemeConfig {
  id: ColorTheme;
  name: string;
  badge: string;
  bgGradient: [string, string, string];
  sphereFill: [string, string, string, string];
  sphereRim: string;
  glowColor: string;
  equatorFront: string;
  equatorBack: string;
  meridianFront: string;
  meridianBack: string;
  vectorGradient: [string, string];
  vectorHead: string;
  textColor: string;
  subtextColor: string;
}

const THEMES: Record<ColorTheme, ThemeConfig> = {
  nebula: {
    id: 'nebula',
    name: 'Cosmic Nebula',
    badge: '🌌 Deep Space',
    bgGradient: ['#0b0f19', '#151336', '#060911'],
    sphereFill: [
      'rgba(147, 197, 253, 0.35)',
      'rgba(99, 102, 241, 0.25)',
      'rgba(49, 46, 129, 0.35)',
      'rgba(11, 15, 25, 0.65)'
    ],
    sphereRim: '#818cf8',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    equatorFront: '#38bdf8',
    equatorBack: 'rgba(56, 189, 248, 0.65)',
    meridianFront: '#c084fc',
    meridianBack: 'rgba(192, 132, 252, 0.55)',
    vectorGradient: ['#38bdf8', '#e879f9'],
    vectorHead: '#f43f5e',
    textColor: '#f8fafc',
    subtextColor: '#94a3b8',
  },
  aurora: {
    id: 'aurora',
    name: 'Cyber Aurora',
    badge: '⚡ Electric Green',
    bgGradient: ['#02231c', '#064232', '#011410'],
    sphereFill: [
      'rgba(167, 243, 208, 0.38)',
      'rgba(52, 211, 153, 0.28)',
      'rgba(6, 95, 70, 0.35)',
      'rgba(2, 35, 28, 0.7)'
    ],
    sphereRim: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    equatorFront: '#34d399',
    equatorBack: 'rgba(52, 211, 153, 0.7)',
    meridianFront: '#22d3ee',
    meridianBack: 'rgba(34, 211, 238, 0.55)',
    vectorGradient: ['#34d399', '#38bdf8'],
    vectorHead: '#f59e0b',
    textColor: '#f0fdf4',
    subtextColor: '#a7f3d0',
  },
  hologram: {
    id: 'hologram',
    name: 'Holo Prism',
    badge: '🔮 Iridescent',
    bgGradient: ['#240d4f', '#44146a', '#120424'],
    sphereFill: [
      'rgba(244, 114, 182, 0.35)',
      'rgba(192, 132, 252, 0.25)',
      'rgba(126, 34, 206, 0.35)',
      'rgba(36, 13, 79, 0.7)'
    ],
    sphereRim: '#e879f9',
    glowColor: 'rgba(217, 70, 239, 0.5)',
    equatorFront: '#f472b6',
    equatorBack: 'rgba(244, 114, 182, 0.7)',
    meridianFront: '#d8b4fe',
    meridianBack: 'rgba(216, 180, 254, 0.6)',
    vectorGradient: ['#f472b6', '#fb7185'],
    vectorHead: '#fbbf24',
    textColor: '#fdf4ff',
    subtextColor: '#f0abfc',
  },
  solar: {
    id: 'solar',
    name: 'Solar Corona',
    badge: '☀️ Radiant Gold',
    bgGradient: ['#381402', '#5e2507', '#170700'],
    sphereFill: [
      'rgba(254, 240, 138, 0.4)',
      'rgba(251, 191, 36, 0.28)',
      'rgba(180, 83, 9, 0.35)',
      'rgba(56, 20, 2, 0.7)'
    ],
    sphereRim: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    equatorFront: '#fde047',
    equatorBack: 'rgba(253, 224, 71, 0.75)',
    meridianFront: '#f97316',
    meridianBack: 'rgba(249, 115, 22, 0.6)',
    vectorGradient: ['#fde047', '#f97316'],
    vectorHead: '#ec4899',
    textColor: '#fffbeb',
    subtextColor: '#fde68a',
  },
  crystal: {
    id: 'crystal',
    name: 'Clean Studio',
    badge: '💎 Pure Lab',
    bgGradient: ['#f1f5f9', '#e2e8f0', '#cbd5e1'],
    sphereFill: [
      'rgba(255, 255, 255, 0.9)',
      'rgba(241, 245, 249, 0.75)',
      'rgba(226, 232, 240, 0.55)',
      'rgba(203, 213, 225, 0.4)'
    ],
    sphereRim: '#4f46e5',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    equatorFront: '#2563eb',
    equatorBack: '#60a5fa',
    meridianFront: '#7c3aed',
    meridianBack: '#a78bfa',
    vectorGradient: ['#4f46e5', '#9333ea'],
    vectorHead: '#e11d48',
    textColor: '#0f172a',
    subtextColor: '#334155',
  }
};

interface PresetState {
  label: string;
  name: string;
  theta: number;
  phi: number;
  color: string;
  description: string;
}

const PRESET_STATES: PresetState[] = [
  { label: '|0⟩', name: 'Ground State (+Z North)', theta: 0, phi: 0, color: 'bg-blue-600 text-white', description: 'North pole: pure |0⟩' },
  { label: '|1⟩', name: 'Excited State (-Z South)', theta: Math.PI, phi: 0, color: 'bg-indigo-600 text-white', description: 'South pole: pure |1⟩' },
  { label: '|+⟩', name: 'Superposition (+X East)', theta: Math.PI / 2, phi: 0, color: 'bg-rose-600 text-white', description: 'Hadamard on |0⟩: (|0⟩ + |1⟩)/√2' },
  { label: '|-⟩', name: 'Superposition (-X West)', theta: Math.PI / 2, phi: Math.PI, color: 'bg-pink-600 text-white', description: 'Hadamard on |1⟩: (|0⟩ - |1⟩)/√2' },
  { label: '|+i⟩', name: 'Phase State (+Y In)', theta: Math.PI / 2, phi: Math.PI / 2, color: 'bg-emerald-600 text-white', description: 'Equal superposition with +90° phase' },
  { label: '|-i⟩', name: 'Phase State (-Y Out)', theta: Math.PI / 2, phi: (3 * Math.PI) / 2, color: 'bg-teal-600 text-white', description: 'Equal superposition with -90° phase' },
  { label: '|T⟩', name: 'Magic State (π/4)', theta: Math.PI / 2, phi: Math.PI / 4, color: 'bg-amber-600 text-white', description: 'Universal quantum T-gate state' },
];

export const BlochSphere: React.FC<BlochSphereProps> = ({
  coordinates,
  qubitIndex,
  numQubits,
  onSelectQubit,
  onUpdateCoordinates,
  onNavigateToTutor,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Visual Theme
  const [activeTheme, setActiveTheme] = useState<ColorTheme>('nebula');

  // AI Explanation Modal State
  const [aiModalContext, setAiModalContext] = useState<AIExplanationContext | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // 3D Camera Orbit & Zoom
  const [yaw, setYaw] = useState(-0.75); // azimuth rotation
  const [pitch, setPitch] = useState(0.42); // elevation rotation
  const [zoom, setZoom] = useState(1.0); // camera zoom multiplier
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAngles, setShowAngles] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [highVisibility, setHighVisibility] = useState(true); // Enhanced line thickness for clear visibility
  const [pulsePhase, setPulsePhase] = useState(0);

  // Local interactive overrides for students
  const [manualTheta, setManualTheta] = useState<number | null>(null);
  const [manualPhi, setManualPhi] = useState<number | null>(null);
  const [sandboxMode, setSandboxMode] = useState<'angles' | 'cartesian' | 'amplitudes' | 'probabilities'>('angles');

  // Temporary input draft states for smooth typing of decimals/negatives
  const [cartDraft, setCartDraft] = useState<{ x: string; y: string; z: string } | null>(null);
  const [ampDraft, setAmpDraft] = useState<{ aRe: string; aIm: string; bRe: string; bIm: string } | null>(null);

  // Safe normalized coordinates
  const rawX = coordinates?.x ?? 0;
  const rawY = coordinates?.y ?? 0;
  const rawZ = coordinates?.z ?? 1;
  const length = Math.sqrt(rawX * rawX + rawY * rawY + rawZ * rawZ);
  
  const calcTheta = manualTheta !== null ? manualTheta : (coordinates?.theta ?? Math.acos(Math.max(-1, Math.min(1, length > 0.0001 ? rawZ / length : 1))));
  let calcPhi = manualPhi !== null ? manualPhi : (coordinates?.phi ?? Math.atan2(rawY, rawX));
  if (calcPhi < 0) calcPhi += 2 * Math.PI;

  const currentX = manualTheta !== null || manualPhi !== null ? Math.sin(calcTheta) * Math.cos(calcPhi) : rawX;
  const currentY = manualTheta !== null || manualPhi !== null ? Math.sin(calcTheta) * Math.sin(calcPhi) : rawY;
  const currentZ = manualTheta !== null || manualPhi !== null ? Math.cos(calcTheta) : rawZ;

  const isPure = Math.abs(length - 1.0) < 0.05;
  const isEntangled = coordinates?.isEntangled || length < 0.95;

  const openAiExplainer = (context: AIExplanationContext) => {
    setAiModalContext({
      ...context,
      blochCoords: {
        x: currentX,
        y: currentY,
        z: currentZ,
        theta: calcTheta,
        phi: calcPhi,
      },
    });
    setIsAiModalOpen(true);
  };

  // Quantum Probabilities
  const prob0 = Math.cos(calcTheta / 2) ** 2;
  const prob1 = Math.sin(calcTheta / 2) ** 2;

  // State conversion helpers for direct typing
  const applyCartesian = (newX: number, newY: number, newZ: number) => {
    const r = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
    if (r < 1e-6) {
      setManualTheta(0);
      setManualPhi(0);
      return;
    }
    const safeZ = Math.max(-1, Math.min(1, newZ / r));
    const newTheta = Math.acos(safeZ);
    let newPhi = Math.atan2(newY, newX);
    if (newPhi < 0) newPhi += 2 * Math.PI;
    setManualTheta(newTheta);
    setManualPhi(newPhi);
  };

  const applyAmplitudes = (aRe: number, aIm: number, bRe: number, bIm: number) => {
    const normSq = aRe * aRe + aIm * aIm + bRe * bRe + bIm * bIm;
    if (normSq < 1e-8) return;
    const norm = Math.sqrt(normSq);
    const magA = Math.sqrt(aRe * aRe + aIm * aIm) / norm;
    const newTheta = 2 * Math.acos(Math.max(0, Math.min(1, magA)));
    
    const phaseA = Math.atan2(aIm, aRe);
    const phaseB = Math.atan2(bIm, bRe);
    let newPhi = (phaseB - phaseA + 2 * Math.PI) % (2 * Math.PI);
    if (newPhi < 0) newPhi += 2 * Math.PI;
    
    setManualTheta(newTheta);
    setManualPhi(newPhi);
  };

  const applyProbabilities = (p0Percent: number, phiDegrees: number) => {
    const safeP0 = Math.max(0, Math.min(100, p0Percent)) / 100;
    const newTheta = 2 * Math.acos(Math.sqrt(safeP0));
    let safePhi = ((phiDegrees % 360) + 360) % 360;
    setManualTheta(newTheta);
    setManualPhi((safePhi * Math.PI) / 180);
  };

  // Animation pulse loop for glowing state vector & sparkles
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setPulsePhase((p) => (p + 0.04) % (Math.PI * 2));
      if (autoRotate) {
        setYaw((y) => y + 0.008);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Main 3D Canvas Rendering Engine
  const render3D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES[activeTheme];
    const lineScale = highVisibility ? 1.35 : 1.0;

    // Retina / High DPI adjustment
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.36;
    const radius = baseRadius * zoom;

    // 1. Draw Themed Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(0.5, theme.bgGradient[1]);
    bgGrad.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Starfield particles in space themes
    if (activeTheme !== 'crystal') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 137.5) % width);
        const sy = ((i * 269.3) % height);
        const sr = (i % 3 === 0 ? 1.6 : 1.1) * (0.8 + 0.3 * Math.sin(pulsePhase + i));
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3D Projection Matrix helper
    const project = (px: number, py: number, pz: number) => {
      // 1. Yaw rotation around Z axis
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = px * cosY - py * sinY;
      const y1 = px * sinY + py * cosY;
      const z1 = pz;

      // 2. Pitch rotation around X axis
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      // Perspective projection
      const cameraDistance = 3.6;
      const perspective = cameraDistance / (cameraDistance - y2);

      return {
        screenX: cx + x2 * radius * perspective,
        screenY: cy - z2 * radius * perspective,
        depth: y2, // For depth sorting
        scale: perspective,
      };
    };

    // Outer Glowing Aura behind sphere
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.35);
    glowGrad.addColorStop(0, theme.glowColor);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. 3D Shaded Glowing Sphere Body (Volumetric Glass Shader)
    const sphereGrad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.4,
      radius * 0.05,
      cx,
      cy,
      radius * 1.05
    );
    sphereGrad.addColorStop(0, theme.sphereFill[0]);
    sphereGrad.addColorStop(0.35, theme.sphereFill[1]);
    sphereGrad.addColorStop(0.75, theme.sphereFill[2]);
    sphereGrad.addColorStop(1, theme.sphereFill[3]);

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer Rim with bright glowing edge (High Visibility)
    ctx.strokeStyle = theme.sphereRim;
    ctx.lineWidth = 2.4 * lineScale;
    ctx.stroke();

    // 3. Clear High-Visibility Wireframe Grid (Equator, Meridians, Parallels)
    if (showGrid) {
      // Draw Equator & Parallels (Z=0, XY plane)
      const drawRing = (zVal: number, rScale: number, isEquator: boolean) => {
        const segments = 72;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          pts.push(project(Math.cos(a) * rScale, Math.sin(a) * rScale, zVal));
        }

        // Back segments (depth < 0) — High Contrast Dashed
        ctx.lineWidth = (isEquator ? 2.0 : 1.4) * lineScale;
        ctx.strokeStyle = isEquator ? theme.equatorBack : theme.meridianBack;
        ctx.setLineDash([5, 4]); // Bold clear dash pattern
        ctx.beginPath();
        for (let i = 0; i < pts.length - 1; i++) {
          if (pts[i].depth < 0 || pts[i + 1].depth < 0) {
            ctx.moveTo(pts[i].screenX, pts[i].screenY);
            ctx.lineTo(pts[i + 1].screenX, pts[i + 1].screenY);
          }
        }
        ctx.stroke();

        // Front segments (depth >= 0) — Solid Bold Line
        ctx.lineWidth = (isEquator ? 2.8 : 1.8) * lineScale;
        ctx.strokeStyle = isEquator ? theme.equatorFront : theme.meridianFront;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < pts.length - 1; i++) {
          if (pts[i].depth >= 0 && pts[i + 1].depth >= 0) {
            ctx.moveTo(pts[i].screenX, pts[i].screenY);
            ctx.lineTo(pts[i + 1].screenX, pts[i + 1].screenY);
          }
        }
        ctx.stroke();
      };

      // Equator (Z=0) & Parallels (±45°, ±30°)
      drawRing(0, 1.0, true); // Equator
      drawRing(0.707, 0.707, false); // +45° lat
      drawRing(-0.707, 0.707, false); // -45° lat

      // Longitudinal Meridians (0°, 90°, 45°, 135°)
      const drawMeridian = (meridianAngle: number) => {
        const segments = 56;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
          const lat = -Math.PI / 2 + (i / segments) * Math.PI;
          const mx = Math.cos(lat) * Math.cos(meridianAngle);
          const my = Math.cos(lat) * Math.sin(meridianAngle);
          const mz = Math.sin(lat);
          pts.push(project(mx, my, mz));
        }

        // Back Meridian (Dashed)
        ctx.strokeStyle = theme.meridianBack;
        ctx.lineWidth = 1.3 * lineScale;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < pts.length - 1; i++) {
          if (pts[i].depth < 0 || pts[i + 1].depth < 0) {
            ctx.moveTo(pts[i].screenX, pts[i].screenY);
            ctx.lineTo(pts[i + 1].screenX, pts[i + 1].screenY);
          }
        }
        ctx.stroke();

        // Front Meridian (Solid)
        ctx.strokeStyle = theme.meridianFront;
        ctx.lineWidth = 1.8 * lineScale;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < pts.length - 1; i++) {
          if (pts[i].depth >= 0 && pts[i + 1].depth >= 0) {
            ctx.moveTo(pts[i].screenX, pts[i].screenY);
            ctx.lineTo(pts[i + 1].screenX, pts[i + 1].screenY);
          }
        }
        ctx.stroke();
      };

      drawMeridian(0); // X-Z plane
      drawMeridian(Math.PI / 2); // Y-Z plane
      drawMeridian(Math.PI / 4);
      drawMeridian((3 * Math.PI) / 4);
    }

    // 4. Vibrant 3D Coordinate Axes (+X Rose Red, +Y Emerald Green, +Z Electric Blue)
    const pOrigin = project(0, 0, 0);

    const draw3DAxis = (
      dirX: number,
      dirY: number,
      dirZ: number,
      color: string,
      negColor: string,
      posLabel: string,
      negLabel: string
    ) => {
      const axisLen = 1.34;
      const pPos = project(dirX * axisLen, dirY * axisLen, dirZ * axisLen);
      const pNeg = project(-dirX * axisLen, -dirY * axisLen, -dirZ * axisLen);

      // Negative Axis (Bold Dashed with Clean Contrast)
      ctx.strokeStyle = negColor;
      ctx.lineWidth = 2.2 * lineScale;
      ctx.setLineDash([5, 4]); // Bold high-visibility dash
      ctx.beginPath();
      ctx.moveTo(pOrigin.screenX, pOrigin.screenY);
      ctx.lineTo(pNeg.screenX, pNeg.screenY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Negative Label Pill
      drawLabelPill(ctx, negLabel, pNeg.screenX, pNeg.screenY, negColor, true);

      // Positive Axis (Solid Vibrant with 3D Arrowhead)
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.0 * lineScale;
      ctx.beginPath();
      ctx.moveTo(pOrigin.screenX, pOrigin.screenY);
      ctx.lineTo(pPos.screenX, pPos.screenY);
      ctx.stroke();

      // 3D Arrowhead at Positive Axis Tip
      drawArrowhead(ctx, pOrigin.screenX, pOrigin.screenY, pPos.screenX, pPos.screenY, color, 10 * lineScale);

      // Positive Label Pill with Solid Backdrop
      drawLabelPill(ctx, posLabel, pPos.screenX, pPos.screenY, color, false, true);
    };

    // Draw All 3 Axes with bold high-contrast colors
    draw3DAxis(1, 0, 0, '#ff2a5f', '#ff8da7', '+X |+⟩', '-X |-⟩');
    draw3DAxis(0, 1, 0, '#00e676', '#80ffbc', '+Y |+i⟩', '-Y |-i⟩');
    draw3DAxis(0, 0, 1, '#00b0ff', '#80d8ff', '+Z |0⟩', '-Z |1⟩');

    // 5. Equatorial Projections & Angle Arcs (θ and φ)
    const pState = project(currentX, currentY, currentZ);
    const pEquator = project(currentX, currentY, 0);

    if (showAngles && (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01 || Math.abs(currentZ) < 0.99)) {
      // Dashed projection line down to XY equator (Bold Purple/Magenta)
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.4 * lineScale;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pState.screenX, pState.screenY);
      ctx.lineTo(pEquator.screenX, pEquator.screenY);
      ctx.stroke();

      // Dashed ray on equator from origin to projection point (Bold Cyan/Emerald)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2 * lineScale;
      ctx.beginPath();
      ctx.moveTo(pOrigin.screenX, pOrigin.screenY);
      ctx.lineTo(pEquator.screenX, pEquator.screenY);
      ctx.stroke();

      // Equator footprint dot with double glowing ring
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(pEquator.screenX, pEquator.screenY, 5 * lineScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Azimuthal angle phi (φ) arc in XY plane
      if (Math.hypot(currentX, currentY) > 0.08) {
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 2.6 * lineScale;
        ctx.setLineDash([]);
        ctx.beginPath();
        const arcSteps = 28;
        const phiNorm = calcPhi;
        for (let i = 0; i <= arcSteps; i++) {
          const curPhi = (i / arcSteps) * phiNorm;
          const arcP = project(Math.cos(curPhi) * 0.38, Math.sin(curPhi) * 0.38, 0);
          if (i === 0) ctx.moveTo(arcP.screenX, arcP.screenY);
          else ctx.lineTo(arcP.screenX, arcP.screenY);
        }
        ctx.stroke();

        // Label for phi φ
        const midPhi = phiNorm / 2;
        const phiP = project(Math.cos(midPhi) * 0.54, Math.sin(midPhi) * 0.54, 0);
        drawAngleBadge(ctx, `φ=${((calcPhi * 180) / Math.PI).toFixed(0)}°`, phiP.screenX, phiP.screenY, '#00701a', '#b9f6ca');
      }

      // Polar angle theta (θ) arc from +Z to state vector
      if (calcTheta > 0.08) {
        ctx.strokeStyle = '#00b0ff';
        ctx.lineWidth = 2.6 * lineScale;
        ctx.setLineDash([]);
        ctx.beginPath();
        const arcSteps = 28;
        for (let i = 0; i <= arcSteps; i++) {
          const curTheta = (i / arcSteps) * calcTheta;
          const curX = Math.sin(curTheta) * Math.cos(calcPhi) * 0.45;
          const curY = Math.sin(curTheta) * Math.sin(calcPhi) * 0.45;
          const curZ = Math.cos(curTheta) * 0.45;
          const arcP = project(curX, curY, curZ);
          if (i === 0) ctx.moveTo(arcP.screenX, arcP.screenY);
          else ctx.lineTo(arcP.screenX, arcP.screenY);
        }
        ctx.stroke();

        // Label for theta θ
        const midTheta = calcTheta / 2;
        const midX = Math.sin(midTheta) * Math.cos(calcPhi) * 0.62;
        const midY = Math.sin(midTheta) * Math.sin(calcPhi) * 0.62;
        const midZ = Math.cos(midTheta) * 0.62;
        const thetaP = project(midX, midY, midZ);
        drawAngleBadge(ctx, `θ=${((calcTheta * 180) / Math.PI).toFixed(0)}°`, thetaP.screenX, thetaP.screenY, '#005b9f', '#b3e5fc');
      }
      ctx.setLineDash([]);
    }

    // 6. State Vector |ψ⟩ (Glowing 3D Neon Arrow with Pulsing Halo)
    const vectorGrad = ctx.createLinearGradient(
      pOrigin.screenX,
      pOrigin.screenY,
      pState.screenX,
      pState.screenY
    );
    vectorGrad.addColorStop(0, theme.vectorGradient[0]);
    vectorGrad.addColorStop(1, theme.vectorGradient[1]);

    // Outer glowing halo
    ctx.strokeStyle = theme.vectorHead;
    ctx.globalAlpha = 0.4 + 0.25 * Math.sin(pulsePhase * 2);
    ctx.lineWidth = 9.0 * lineScale;
    ctx.beginPath();
    ctx.moveTo(pOrigin.screenX, pOrigin.screenY);
    ctx.lineTo(pState.screenX, pState.screenY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Solid Inner Core
    ctx.strokeStyle = vectorGrad;
    ctx.lineWidth = 4.8 * lineScale;
    ctx.beginPath();
    ctx.moveTo(pOrigin.screenX, pOrigin.screenY);
    ctx.lineTo(pState.screenX, pState.screenY);
    ctx.stroke();

    // 3D Arrowhead at Vector Head
    drawArrowhead(ctx, pOrigin.screenX, pOrigin.screenY, pState.screenX, pState.screenY, theme.vectorHead, 13 * lineScale);

    // Vector Head Sparkle Dot
    const sparkleR = (7.0 + 2.0 * Math.sin(pulsePhase * 3)) * lineScale;
    ctx.fillStyle = theme.vectorHead;
    ctx.beginPath();
    ctx.arc(pState.screenX, pState.screenY, sparkleR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pState.screenX, pState.screenY, 3.8 * lineScale, 0, Math.PI * 2);
    ctx.fill();

    // State Vector Label Pill "|ψ⟩"
    drawLabelPill(
      ctx,
      `|ψ⟩`,
      pState.screenX + (currentX >= 0 ? 20 : -20),
      pState.screenY + (currentZ >= 0 ? -18 : 18),
      theme.vectorHead,
      false,
      true,
      true
    );

    // Center Origin Dot with Ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pOrigin.screenX, pOrigin.screenY, 5.0 * lineScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.sphereRim;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.restore();
  }, [
    currentX,
    currentY,
    currentZ,
    calcTheta,
    calcPhi,
    yaw,
    pitch,
    zoom,
    showAngles,
    showGrid,
    activeTheme,
    highVisibility,
    pulsePhase
  ]);

  // Helper: Draw text pill with background box so it never clips or overlaps lines
  const drawLabelPill = (
    ctx: CanvasRenderingContext2D,
    text: string,
    xPos: number,
    yPos: number,
    textColor: string,
    isDashed: boolean,
    isBold: boolean = false,
    isSpecial: boolean = false
  ) => {
    ctx.font = `${isBold ? 'bold' : '600'} 13px "Times New Roman", Times, serif`;
    const metrics = ctx.measureText(text);
    const padX = 8;
    const padY = 4;
    const boxW = metrics.width + padX * 2;
    const boxH = 22;
    const boxX = xPos - boxW / 2;
    const boxY = yPos - boxH / 2;

    const isDark = activeTheme !== 'crystal';
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = isSpecial ? textColor : (isDark ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.85)');
    ctx.lineWidth = isSpecial ? 2.2 : 1.4;
    
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 7);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = isDashed ? (isDark ? '#cbd5e1' : '#475569') : textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, xPos, yPos);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // Helper: Draw angle badge
  const drawAngleBadge = (
    ctx: CanvasRenderingContext2D,
    text: string,
    xPos: number,
    yPos: number,
    textColor: string,
    bgColor: string
  ) => {
    ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, monospace';
    const metrics = ctx.measureText(text);
    const boxW = metrics.width + 12;
    const boxH = 20;
    const boxX = xPos - boxW / 2;
    const boxY = yPos - boxH / 2;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, xPos, yPos);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // Helper: Draw 3D arrow head
  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    size: number = 8
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle - Math.PI / 6),
      toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - size * Math.cos(angle + Math.PI / 6),
      toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // Trigger render on updates
  useEffect(() => {
    render3D();
  }, [render3D]);

  // Window Resize Observer for Razor Sharp Canvas
  useEffect(() => {
    const handleResize = () => {
      render3D();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render3D]);

  // Mouse & Touch Dragging Orbit Handlers
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - lastPos.x;
    const dy = clientY - lastPos.y;
    setYaw((prev) => prev + dx * 0.012);
    setPitch((prev) => Math.max(-1.45, Math.min(1.45, prev + dy * 0.012)));
    setLastPos({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Apply state preset
  const handleApplyPreset = (preset: PresetState) => {
    setManualTheta(preset.theta);
    setManualPhi(preset.phi);
    if (onUpdateCoordinates) {
      const newX = Math.sin(preset.theta) * Math.cos(preset.phi);
      const newY = Math.sin(preset.theta) * Math.sin(preset.phi);
      const newZ = Math.cos(preset.theta);
      onUpdateCoordinates({
        x: newX,
        y: newY,
        z: newZ,
        theta: preset.theta,
        phi: preset.phi,
      });
    }
  };

  // Reset to simulated circuit state
  const handleResetToCircuit = () => {
    setManualTheta(null);
    setManualPhi(null);
  };

  const thetaDeg = ((calcTheta * 180) / Math.PI).toFixed(1);
  const phiDeg = ((calcPhi * 180) / Math.PI).toFixed(1);
  const cosHalf = Math.cos(calcTheta / 2).toFixed(3);
  const sinHalf = Math.sin(calcTheta / 2).toFixed(3);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-md flex flex-col space-y-4 text-slate-800 font-serif overflow-hidden transition-all"
    >
      {/* 1. Header & Multi-Qubit Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">3D Interactive Bloch Sphere</h3>
              {manualTheta !== null ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold animate-pulse">
                  Interactive Mode
                </span>
              ) : isEntangled ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  Mixed State
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  Pure State (|r|=1.0)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5 hidden sm:block">
              Crystal-clear 3D visualization of quantum superposition, relative phase & expectation values
            </p>
          </div>
        </div>

        {/* Multi-Qubit Tabs & Theme Selector */}
        <div className="flex items-center space-x-2">
          {/* AI Explainer Button */}
          <button
            type="button"
            onClick={() =>
              openAiExplainer({
                topic: 'bloch_sphere',
                title: `Bloch Sphere 3D State: Qubit q[${qubitIndex}]`,
                customPrompt: `Explain the physical quantum state of qubit q[${qubitIndex}] with spherical angles θ = ${thetaDeg}°, φ = ${phiDeg}°, and Cartesian vector coordinates (${currentX.toFixed(3)}, ${currentY.toFixed(3)}, ${currentZ.toFixed(3)}).`,
              })
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold font-sans shadow-xs cursor-pointer transition active:scale-95"
            title="Ask AI to explain this 3D quantum state and angles"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>AI Bloch Explainer</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(Object.keys(THEMES) as ColorTheme[]).map((tKey) => {
              const th = THEMES[tKey];
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setActiveTheme(tKey)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTheme === tKey
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Switch to ${th.name}`}
                >
                  {th.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Qubit Selector */}
          <div className="flex items-center space-x-1 bg-blue-50 p-1 rounded-xl border border-blue-200">
            {Array.from({ length: numQubits }).map((_, i) => (
              <button
                key={i}
                type="button"
                id={`btn-bloch-qubit-${i}`}
                onClick={() => {
                  onSelectQubit(i);
                  handleResetToCircuit();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  qubitIndex === i
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-800 hover:text-blue-950 hover:bg-white/70'
                }`}
              >
                q[{i}]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Stage */}
      <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-700/30 shadow-xl flex items-center justify-center select-none touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={handleEnd}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Orbit Hint Watermark */}
        <div className="absolute bottom-3 left-3 pointer-events-none text-xs text-white font-sans font-medium flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>Click & Drag to Orbit 3D</span>
        </div>

        {/* Top-Left Active Theme Indicator Badge */}
        <div className="absolute top-3 left-3 pointer-events-none text-xs font-sans font-bold flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20">
          <span>{THEMES[activeTheme].badge}</span>
        </div>

        {/* Top-Right Floating Controls Bar */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg">
          <button
            type="button"
            id="btn-bloch-high-vis"
            onClick={() => setHighVisibility(!highVisibility)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              highVisibility
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Ultra-High Line Visibility & Thickness"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-auto-rotate"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              autoRotate
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle 3D Orbit Auto-Rotation"
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            id="btn-bloch-toggle-angles"
            onClick={() => setShowAngles(!showAngles)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              showAngles
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle (θ, φ) Angle Arcs"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-toggle-grid"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              showGrid
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Grid & Meridians"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-toggle-controls"
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              showControls
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Student Interactive Sliders"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-zoom-in"
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-zoom-out"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bloch-reset-camera"
            onClick={() => {
              setYaw(-0.75);
              setPitch(0.42);
              setZoom(1.0);
            }}
            className="p-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Reset Camera Angle"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Student State Presets Bar (Instant Click-to-State) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive State Presets (Click to Explore)</span>
          </div>
          {manualTheta !== null && (
            <button
              type="button"
              onClick={handleResetToCircuit}
              className="text-xs text-blue-600 hover:text-blue-800 font-sans font-bold flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
            >
              <RefreshCw className="w-3 h-3 text-blue-600" />
              <span>Reset to Circuit Output</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {PRESET_STATES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 ${
                Math.abs(calcTheta - preset.theta) < 0.05 && Math.abs(calcPhi - preset.phi) < 0.05
                  ? `${preset.color} border-transparent shadow-md ring-2 ring-blue-400`
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              title={preset.description}
            >
              <span className="font-serif font-bold text-xs sm:text-sm">{preset.label}</span>
              <span className="text-[9px] sm:text-[10px] font-sans opacity-85 truncate max-w-full">
                {preset.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Manual Quantum State Sandbox & Gate Lab */}
      <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3.5 font-sans shadow-2xs">
        {/* Header & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Interactive State Value Editor:</span>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSandboxMode('angles')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sandboxMode === 'angles'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Angles (θ, φ)</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxMode('cartesian')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sandboxMode === 'cartesian'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Rotate3d className="w-3 h-3" />
              <span>Cartesian (X,Y,Z)</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxMode('amplitudes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sandboxMode === 'amplitudes'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Binary className="w-3 h-3" />
              <span>Amplitudes (α, β)</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxMode('probabilities')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sandboxMode === 'probabilities'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>Probabilities</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Spherical Angles (θ, φ) */}
        {sandboxMode === 'angles' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Theta Polar Controls */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900 flex items-center gap-1">
                    <span>Polar Angle θ (Z-axis tilt)</span>
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 font-sans">Type:</span>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      step="0.1"
                      value={thetaDeg}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(180, Number(e.target.value) || 0));
                        setManualTheta((val * Math.PI) / 180);
                      }}
                      className="w-16 bg-blue-50 border border-blue-300 rounded px-1.5 py-0.5 text-center font-bold text-blue-800"
                    />
                    <span className="text-blue-900 font-bold">°</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="0.5"
                  value={((calcTheta * 180) / Math.PI).toFixed(1)}
                  onChange={(e) => {
                    const newT = (parseFloat(e.target.value) * Math.PI) / 180;
                    setManualTheta(newT);
                  }}
                  className="w-full accent-blue-600 h-2 bg-blue-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <button type="button" onClick={() => setManualTheta(0)} className="hover:text-blue-700 cursor-pointer">
                    0° (|0⟩ North)
                  </button>
                  <button type="button" onClick={() => setManualTheta(Math.PI / 2)} className="hover:text-blue-700 cursor-pointer">
                    90° (Equator)
                  </button>
                  <button type="button" onClick={() => setManualTheta(Math.PI)} className="hover:text-blue-700 cursor-pointer">
                    180° (|1⟩ South)
                  </button>
                </div>
              </div>

              {/* Phi Phase Controls */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1">
                    <span>Phase Angle φ (Equator rotation)</span>
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 font-sans">Type:</span>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="0.1"
                      value={phiDeg}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(360, Number(e.target.value) || 0));
                        setManualPhi((val * Math.PI) / 180);
                      }}
                      className="w-16 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-center font-bold text-emerald-800"
                    />
                    <span className="text-emerald-900 font-bold">°</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.5"
                  value={((calcPhi * 180) / Math.PI).toFixed(1)}
                  onChange={(e) => {
                    const newP = (parseFloat(e.target.value) * Math.PI) / 180;
                    setManualPhi(newP);
                  }}
                  className="w-full accent-emerald-600 h-2 bg-emerald-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <button type="button" onClick={() => setManualPhi(0)} className="hover:text-emerald-700 cursor-pointer">
                    0° (+X)
                  </button>
                  <button type="button" onClick={() => setManualPhi(Math.PI / 2)} className="hover:text-emerald-700 cursor-pointer">
                    90° (+Y)
                  </button>
                  <button type="button" onClick={() => setManualPhi(Math.PI)} className="hover:text-emerald-700 cursor-pointer">
                    180° (-X)
                  </button>
                  <button type="button" onClick={() => setManualPhi((3 * Math.PI) / 2)} className="hover:text-emerald-700 cursor-pointer">
                    270° (-Y)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cartesian Coordinates (X, Y, Z) */}
        {sandboxMode === 'cartesian' && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 font-sans">
                Directly Type Bloch 3D Vector Cartesian Coordinates:
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Norm |r| = <strong className="text-blue-700">{Math.sqrt(currentX*currentX + currentY*currentY + currentZ*currentZ).toFixed(4)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-rose-800 uppercase block font-sans">X-Axis [-1, 1]</span>
                <input
                  type="number"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={currentX.toFixed(4)}
                  onChange={(e) => {
                    const val = Math.max(-1, Math.min(1, Number(e.target.value) || 0));
                    applyCartesian(val, currentY, currentZ);
                  }}
                  className="w-full bg-white border border-rose-300 rounded px-2 py-1 text-xs font-bold text-rose-900 text-center shadow-2xs"
                />
              </div>

              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block font-sans">Y-Axis [-1, 1]</span>
                <input
                  type="number"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={currentY.toFixed(4)}
                  onChange={(e) => {
                    const val = Math.max(-1, Math.min(1, Number(e.target.value) || 0));
                    applyCartesian(currentX, val, currentZ);
                  }}
                  className="w-full bg-white border border-emerald-300 rounded px-2 py-1 text-xs font-bold text-emerald-900 text-center shadow-2xs"
                />
              </div>

              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase block font-sans">Z-Axis [-1, 1]</span>
                <input
                  type="number"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={currentZ.toFixed(4)}
                  onChange={(e) => {
                    const val = Math.max(-1, Math.min(1, Number(e.target.value) || 0));
                    applyCartesian(currentX, currentY, val);
                  }}
                  className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-bold text-blue-900 text-center shadow-2xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs font-sans">
              <span className="text-[11px] text-slate-500">
                Mathematical relation: <strong className="font-mono text-slate-700">X = sinθ cosφ, Y = sinθ sinφ, Z = cosθ</strong>
              </span>
              <button
                type="button"
                onClick={() => applyCartesian(currentX, currentY, currentZ)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Normalize Vector
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Complex Amplitudes (α, β) */}
        {sandboxMode === 'amplitudes' && (() => {
          const aRe = Math.cos(calcTheta / 2);
          const aIm = 0;
          const bRe = Math.cos(calcPhi) * Math.sin(calcTheta / 2);
          const bIm = Math.sin(calcPhi) * Math.sin(calcTheta / 2);

          return (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 font-sans">
                  Type Complex Quantum State Amplitudes <strong className="font-mono text-blue-700">|ψ⟩ = α|0⟩ + β|1⟩</strong>:
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  |α|² + |β|² = <strong className="text-emerald-700">{(aRe*aRe + aIm*aIm + bRe*bRe + bIm*bIm).toFixed(4)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono">
                <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                  <span className="text-[9px] font-bold text-blue-800 uppercase block font-sans">α Real: Re(α)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={aRe.toFixed(4)}
                    onChange={(e) => {
                      applyAmplitudes(Number(e.target.value) || 0, aIm, bRe, bIm);
                    }}
                    className="w-full bg-white border border-blue-300 rounded px-1.5 py-1 text-xs font-bold text-blue-900 text-center"
                  />
                </div>

                <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                  <span className="text-[9px] font-bold text-blue-800 uppercase block font-sans">α Imag: Im(α)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={aIm.toFixed(4)}
                    onChange={(e) => {
                      applyAmplitudes(aRe, Number(e.target.value) || 0, bRe, bIm);
                    }}
                    className="w-full bg-white border border-blue-300 rounded px-1.5 py-1 text-xs font-bold text-blue-900 text-center"
                  />
                </div>

                <div className="p-2 bg-purple-50/70 border border-purple-200 rounded-lg space-y-1">
                  <span className="text-[9px] font-bold text-purple-800 uppercase block font-sans">β Real: Re(β)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={bRe.toFixed(4)}
                    onChange={(e) => {
                      applyAmplitudes(aRe, aIm, Number(e.target.value) || 0, bIm);
                    }}
                    className="w-full bg-white border border-purple-300 rounded px-1.5 py-1 text-xs font-bold text-purple-900 text-center"
                  />
                </div>

                <div className="p-2 bg-purple-50/70 border border-purple-200 rounded-lg space-y-1">
                  <span className="text-[9px] font-bold text-purple-800 uppercase block font-sans">β Imag: Im(β)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={bIm.toFixed(4)}
                    onChange={(e) => {
                      applyAmplitudes(aRe, aIm, bRe, Number(e.target.value) || 0);
                    }}
                    className="w-full bg-white border border-purple-300 rounded px-1.5 py-1 text-xs font-bold text-purple-900 text-center"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs font-sans">
                <span className="text-[11px] text-slate-500">
                  Global phase gauge: α is canonicalized to real-valued non-negative amplitude on the Bloch sphere.
                </span>
                <button
                  type="button"
                  onClick={() => applyAmplitudes(aRe, aIm, bRe, bIm)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Normalize State |ψ⟩
                </button>
              </div>
            </div>
          );
        })()}

        {/* Tab 4: Probabilities (P0, P1) */}
        {sandboxMode === 'probabilities' && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 font-sans">
                Type Measurement Basis Probabilities & Relative Phase:
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                P(|0⟩) + P(|1⟩) = <strong className="text-emerald-700">100.0%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase block font-sans">P(|0⟩) Probability [%]</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={(prob0 * 100).toFixed(2)}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    applyProbabilities(val, parseFloat(phiDeg) || 0);
                  }}
                  className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-bold text-blue-900 text-center"
                />
              </div>

              <div className="p-2 bg-pink-50/70 border border-pink-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-pink-800 uppercase block font-sans">P(|1⟩) Probability [%]</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={(prob1 * 100).toFixed(2)}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    applyProbabilities(100 - val, parseFloat(phiDeg) || 0);
                  }}
                  className="w-full bg-white border border-pink-300 rounded px-2 py-1 text-xs font-bold text-pink-900 text-center"
                />
              </div>

              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block font-sans">Relative Phase φ [°]</span>
                <input
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  value={phiDeg}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(360, Number(e.target.value) || 0));
                    applyProbabilities(prob0 * 100, val);
                  }}
                  className="w-full bg-white border border-emerald-300 rounded px-2 py-1 text-xs font-bold text-emerald-900 text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Single-Qubit Quantum Gate Operators */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 font-sans">Apply 1-Click Quantum Rotation Operators:</span>
            <span className="text-[10px] text-slate-400 font-mono">Unitary transforms on q[{qubitIndex}]</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                // X Gate: flips |0⟩ <-> |1⟩ (rotates 180° around X axis)
                setManualTheta(Math.PI - calcTheta);
                setManualPhi((-calcPhi + 2 * Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Pauli-X Gate (Bit-flip NOT: rotates 180° around X axis)"
            >
              Gate [X]
            </button>

            <button
              type="button"
              onClick={() => {
                // Y Gate: rotates 180° around Y axis
                setManualTheta(Math.PI - calcTheta);
                setManualPhi((Math.PI - calcPhi + 2 * Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Pauli-Y Gate (Bit & phase flip: rotates 180° around Y axis)"
            >
              Gate [Y]
            </button>

            <button
              type="button"
              onClick={() => {
                // Z Gate: phase flip (rotates 180° around Z axis)
                setManualPhi((calcPhi + Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Pauli-Z Gate (Phase flip: rotates 180° around Z axis)"
            >
              Gate [Z]
            </button>

            <button
              type="button"
              onClick={() => {
                // Hadamard Gate: swaps Z and X axes
                const x = currentX;
                const z = currentZ;
                const newX = z;
                const newZ = x;
                const newTheta = Math.acos(Math.max(-1, Math.min(1, newZ)));
                const newPhi = Math.atan2(currentY, newX);
                setManualTheta(newTheta);
                setManualPhi((newPhi + 2 * Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Hadamard Gate [H]: creates superposition by swapping Z and X axes"
            >
              Gate [H]
            </button>

            <button
              type="button"
              onClick={() => {
                // S Gate: +90° phase rotation around Z
                setManualPhi((calcPhi + Math.PI / 2) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Phase Gate [S]: +90° (π/2) phase rotation around Z axis"
            >
              Gate [S] (+90°)
            </button>

            <button
              type="button"
              onClick={() => {
                // T Gate: +45° phase rotation around Z
                setManualPhi((calcPhi + Math.PI / 4) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Magic Gate [T]: +45° (π/4) phase rotation around Z axis"
            >
              Gate [T] (+45°)
            </button>

            <button
              type="button"
              onClick={() => {
                // Rx(45°)
                const delta = Math.PI / 4;
                const y = currentY;
                const z = currentZ;
                const newY = y * Math.cos(delta) - z * Math.sin(delta);
                const newZ = y * Math.sin(delta) + z * Math.cos(delta);
                const newTheta = Math.acos(Math.max(-1, Math.min(1, newZ)));
                const newPhi = Math.atan2(newY, currentX);
                setManualTheta(newTheta);
                setManualPhi((newPhi + 2 * Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Rotation Rx(45°): rotate vector by 45° around X axis"
            >
              Rx(π/4)
            </button>

            <button
              type="button"
              onClick={() => {
                // Invert state to antipodal point
                setManualTheta(Math.PI - calcTheta);
                setManualPhi((calcPhi + Math.PI) % (2 * Math.PI));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold font-mono transition cursor-pointer shadow-2xs active:scale-95"
              title="Invert State: map to orthogonal antipodal point on the Bloch sphere (-r)"
            >
              Invert State (-r)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Dirac Quantum State Equation & Measurement Probabilities */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
        {/* State Equation Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
              Dirac State Formula
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  openAiExplainer({
                    topic: 'bloch_sphere',
                    title: `Dirac State & Phase Analysis: q[${qubitIndex}]`,
                    mathLatex: `|\\psi\\rangle = ${cosHalf}|0\\rangle + e^{i(${phiDeg}^\\circ)}(${sinHalf})|1\\rangle`,
                    customPrompt: `Break down the Dirac quantum state formula for qubit q[${qubitIndex}], explaining how amplitudes α = cos(θ/2) and β = e^(iφ)sin(θ/2) relate to measurement probabilities and quantum phase interference.`,
                  })
                }
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold font-sans transition cursor-pointer border border-purple-200"
                title="AI Explanation of Dirac State Formula"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Explain Math</span>
              </button>
              <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                q[{qubitIndex}]
              </span>
            </div>
          </div>
          <div className="py-1 overflow-x-auto">
            <MathView
              math={`|\\psi\\rangle = ${cosHalf}|0\\rangle + e^{i(${phiDeg}^\\circ)}(${sinHalf})|1\\rangle`}
              className="text-slate-900 font-bold text-sm sm:text-base whitespace-nowrap"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-700 font-serif pt-2 border-t border-slate-200">
            <span className="font-sans font-semibold text-slate-600 text-[11px]">Amplitudes:</span>
            <MathView math={`\\alpha = \\cos(\\theta/2) = ${cosHalf}`} className="text-xs text-slate-900 font-semibold" />
            <span className="text-slate-300 font-sans hidden sm:inline">|</span>
            <MathView math={`\\beta = e^{i\\phi}\\sin(\\theta/2) = ${sinHalf}e^{i(${phiDeg}^\\circ)}`} className="text-xs text-slate-900 font-semibold" />
          </div>
        </div>

        {/* Measurement Probability Meter */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2.5 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Measurement Probabilities</span>
            <span className="font-mono text-blue-700 text-[11px] font-semibold">P(|0⟩) + P(|1⟩) = 100%</span>
          </div>

          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="w-full h-5 bg-slate-200 rounded-xl overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${prob0 * 100}%` }}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold font-mono"
              >
                {prob0 > 0.15 ? `${(prob0 * 100).toFixed(1)}%` : ''}
              </div>
              <div
                style={{ width: `${prob1 * 100}%` }}
                className="bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold font-mono"
              >
                {prob1 > 0.15 ? `${(prob1 * 100).toFixed(1)}%` : ''}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-blue-700 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0" />
                P(|0⟩) = {(prob0 * 100).toFixed(1)}%
              </span>
              <span className="text-purple-700 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shrink-0" />
                P(|1⟩) = {(prob1 * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Pauli Expectation Values Cards (⟨X⟩, ⟨Y⟩, ⟨Z⟩) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
            Pauli Spin Expectation Values ⟨σ⟩
          </span>
          <button
            type="button"
            onClick={() =>
              openAiExplainer({
                topic: 'pauli_matrices',
                title: 'Pauli Expectation Values ⟨X⟩, ⟨Y⟩, ⟨Z⟩',
                mathLatex: `\\langle X \\rangle = ${currentX.toFixed(3)}, \\quad \\langle Y \\rangle = ${currentY.toFixed(3)}, \\quad \\langle Z \\rangle = ${currentZ.toFixed(3)}`,
                customPrompt: `Explain what the Pauli expectation values ⟨X⟩=${currentX.toFixed(3)}, ⟨Y⟩=${currentY.toFixed(3)}, ⟨Z⟩=${currentZ.toFixed(3)} mean physically when measuring qubit q[${qubitIndex}] in different measurement bases.`,
              })
            }
            className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold font-sans transition cursor-pointer border border-indigo-200"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Explain Pauli Observables</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-sm font-serif">
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/60 p-2.5 sm:p-3 rounded-2xl border border-rose-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-rose-700 font-bold px-0.5 font-sans">
              <span>Pauli ⟨X⟩</span>
              <span className="font-mono text-[9px] sm:text-[10px] bg-rose-200/60 px-1.5 py-0.5 rounded whitespace-nowrap">|+⟩/|-⟩</span>
            </div>
            <span className="font-bold font-mono text-base sm:text-lg text-rose-950 mt-1 block">
              {currentX.toFixed(4)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-2.5 sm:p-3 rounded-2xl border border-emerald-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-emerald-700 font-bold px-0.5 font-sans">
              <span>Pauli ⟨Y⟩</span>
              <span className="font-mono text-[9px] sm:text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded whitespace-nowrap">|+i⟩/|-i⟩</span>
            </div>
            <span className="font-bold font-mono text-base sm:text-lg text-emerald-950 mt-1 block">
              {currentY.toFixed(4)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 p-2.5 sm:p-3 rounded-2xl border border-blue-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-blue-700 font-bold px-0.5 font-sans">
              <span>Pauli ⟨Z⟩</span>
              <span className="font-mono text-[9px] sm:text-[10px] bg-blue-200/60 px-1.5 py-0.5 rounded whitespace-nowrap">|0⟩/|1⟩</span>
            </div>
            <span className="font-bold font-mono text-base sm:text-lg text-blue-950 mt-1 block">
              {currentZ.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* AI Pedagogical Explanation Modal */}
      <AIExplanationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        context={aiModalContext}
        onNavigateToTutor={onNavigateToTutor}
      />
    </div>
  );
};
