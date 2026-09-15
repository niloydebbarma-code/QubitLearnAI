/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Modern Flexible Dropdown Navigation Header
 * Features:
 * - 4 Consolidated Dropdown Workspace Hubs (Studio, Academy, Research, Analytics)
 * - 4 Ergonomic Theme Modes (Obsidian Dark, Academic Paper Light, Cyber Neon, WCAG AAA)
 * - Quick Command Palette (Ctrl + K / ⌘K)
 * - Multi-Framework Export & System Telemetry Monitor
 * - User Profile & Secure Logout
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Atom,
  Cpu,
  BookOpen,
  Bug,
  GraduationCap,
  FileText,
  Code2,
  CheckCircle2,
  Eye,
  Sparkles,
  Volume2,
  VolumeX,
  Video,
  Presentation,
  TrendingUp,
  Activity,
  Layers,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  Search,
  Check,
  Palette,
  Sun,
  Moon,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile } from './AuthLandingPage';

export type ActiveTab =
  | 'studio'
  | 'curriculum'
  | 'tutor'
  | 'assessment'
  | 'papers'
  | 'video'
  | 'progress';

export type ThemeMode = 'obsidian' | 'academic' | 'cyber' | 'contrast';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCodeModal: () => void;
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  verificationConfidence: number;
  user?: UserProfile | null;
  onLogout?: () => void;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: {
    id: ActiveTab;
    title: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCodeModal,
  themeMode,
  setThemeMode,
  soundEnabled,
  setSoundEnabled,
  verificationConfidence,
  user,
  onLogout,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setOpenDropdown(null);
        setIsSettingsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4 Consolidated Functional Domains
  const navGroups: NavGroup[] = [
    {
      id: 'build',
      label: 'Studio',
      icon: Cpu,
      items: [
        {
          id: 'studio',
          title: 'Quantum Circuit Studio',
          description: 'Interactive builder, state simulator, circuit debugger, and code export',
          icon: Cpu,
          badge: 'Studio',
        },
      ],
    },
    {
      id: 'academy',
      label: 'Academy',
      icon: BookOpen,
      items: [
        {
          id: 'curriculum',
          title: 'Courses',
          description: 'Structured learning paths from fundamental qubits to advanced algorithms',
          icon: BookOpen,
          badge: 'Lessons',
        },
        {
          id: 'tutor',
          title: 'AI Tutor',
          description: 'Interactive assistant guiding intuition through superposition and quantum gates',
          icon: Sparkles,
          badge: 'Assistant',
        },
        {
          id: 'assessment',
          title: 'Coding Challenges & Arena',
          description: 'Hands-on coding challenges with automated quantum circuit verification',
          icon: GraduationCap,
          badge: 'Challenges',
        },
      ],
    },
    {
      id: 'research',
      label: 'Research & Tools',
      icon: FileText,
      items: [
        {
          id: 'papers',
          title: 'Research Paper Verifier',
          description: 'Literature analysis with citation checks and formal proof DAGs',
          icon: FileText,
          badge: 'Lean 4',
        },
        {
          id: 'video',
          title: 'Video Lecture OCR',
          description: 'Transcribes whiteboard equations and circuit diagrams from video lectures',
          icon: Video,
          badge: 'Keyframes',
        },
      ],
    },
  ];

  // Active workspace metadata
  const allItems = navGroups.flatMap((g) => g.items).concat([
    {
      id: 'progress',
      title: 'Progress & Analytics',
      description: 'Learner achievements, circuit completion records, and cohort statistics',
      icon: TrendingUp,
      badge: 'Metrics',
    },
  ]);

  const activeItem = allItems.find((item) => item.id === activeTab) || allItems[0];
  const ActiveIcon = activeItem.icon;

  const filteredCommandItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={dropdownRef}>
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Title */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab('studio')}
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs flex-shrink-0 transition-transform hover:scale-105">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="9" ry="3" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 whitespace-nowrap">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 font-serif">
                  QubitLearn AI
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  Quantum Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-serif hidden lg:block leading-tight">
                Interactive Quantum Simulator
              </p>
            </div>
          </div>

          {/* Center: Clean Consolidated Dropdown Navigation */}
          <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 p-1 rounded-xl border transition-colors bg-slate-100/70 border-slate-200 shrink-0">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isGroupActive = group.items.some((item) => item.id === activeTab);
              const isOpen = openDropdown === group.id;

              return (
                <div key={group.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`flex items-center space-x-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isGroupActive
                        ? 'bg-white text-blue-700 border border-slate-200 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <GroupIcon className={`w-3.5 h-3.5 ${isGroupActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="font-serif">{group.label}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 mt-2 w-80 border border-slate-200 rounded-xl shadow-xl p-2 space-y-1.5 z-50 backdrop-blur-xl animate-in fade-in duration-150 bg-white text-slate-900">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isSelected = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start space-x-3 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 border border-blue-200 text-blue-950 font-medium'
                                : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <div className={`p-2 rounded-md mt-0.5 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold truncate text-slate-900 font-serif">{item.title}</span>
                                {item.badge && (
                                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed font-serif">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Progress & Analytics Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('progress');
                setOpenDropdown(null);
              }}
              className={`flex items-center space-x-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'bg-white text-blue-700 border border-slate-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'progress' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="font-serif">Progress</span>
            </button>
          </nav>

          {/* Right: Search / Command Palette Trigger + Settings Dropdown + User Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Quick Command Palette Launcher (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden 2xl:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-all text-xs cursor-pointer shadow-2xs font-serif"
              title="Quick Search & Switch Workspace (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Verification Status Pill */}
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium whitespace-nowrap"
              title="Statevector and matrix calculations verified through Hilbert space simulation"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Sim {(verificationConfidence * 100).toFixed(0)}%</span>
            </div>

            {/* Consolidated Settings & Ergonomics Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isSettingsOpen
                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
                title="Workspace Theme & Ergonomics Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Popover */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-72 border border-slate-200 rounded-xl shadow-xl p-4 space-y-3 z-50 backdrop-blur-xl animate-in fade-in duration-150 text-sm bg-white text-slate-900">
                  <div className="font-semibold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between font-serif">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold">Workspace Settings</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      Light & Clean
                    </span>
                  </div>

                  {/* Active Theme Display */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-serif">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Theme</span>
                      <span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Academic Light
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif">
                      Crisp white surfaces, Times New Roman typography, and rich mathematical typesetting.
                    </p>
                  </div>

                  {/* Audio Feedback Toggle */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-slate-800 flex items-center gap-2 text-sm font-medium font-serif">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span>Sound Effects</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                          soundEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Utilities */}
                  <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCodeModal();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition cursor-pointer font-serif"
                    >
                      <Code2 className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-900">Export Code</div>
                        <div className="text-xs text-slate-500">Qiskit, Cirq, PennyLane, QuTiP, pyQuil, QASM</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Auth Controls (Desktop) */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight font-serif">{user.name}</span>
                  <span className="text-xs font-mono capitalize text-slate-500">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold shadow-2xs font-serif">
                  {user.name.charAt(0)}
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs font-serif"
                    title="Switch Account or Sign In with another role"
                  >
                    <span>Switch</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 text-sm font-serif">
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer font-semibold"
                  >
                    Sign In
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-xs"
                  >
                    Sign Up
                  </button>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              id="btn-mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg border transition-all cursor-pointer ${
                isMobileMenuOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-150">
          <div className="bg-white border-b border-slate-200 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4 font-serif">
            {/* Active Workspace Banner */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider font-mono">Current Workspace</div>
                  <div className="text-sm font-bold text-slate-900">{activeItem.title}</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200 font-semibold">
                Active
              </span>
            </div>

            {/* Nav Groups */}
            <div className="space-y-4">
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <GroupIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{group.label}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isSelected = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-medium shadow-2xs'
                                : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            {isSelected && <ChevronRight className="w-4 h-4 text-blue-600 self-center shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Direct Progress & Analytics Tab */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Analytics</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('progress');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'progress'
                      ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-medium shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${activeTab === 'progress' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Progress & Analytics</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">Metrics</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      Learner achievements, circuit completion records, and cohort statistics
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Actions & Utilities */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center gap-2 font-medium cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenCodeModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center gap-2 font-medium cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <span>Export Code</span>
                </button>
              </div>

              {/* User authentication in mobile drawer */}
              {user ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                      <div className="text-xs text-slate-500 font-mono capitalize">{user.role}</div>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-center cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center cursor-pointer shadow-xs"
                    >
                      Sign Up
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Tap outside backdrop area */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Command Palette Modal (Ctrl + K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150 font-serif">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden divide-y divide-slate-200">
            <div className="p-4 flex items-center gap-3 bg-slate-50">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quantum tools, algorithms, or modules..."
                className="w-full bg-transparent text-base text-slate-900 focus:outline-none placeholder:text-slate-400 font-serif"
              />
              <kbd className="px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2.5 space-y-1.5 bg-white">
              {filteredCommandItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 font-serif">
                  No quantum workspace matches found.
                </div>
              ) : (
                filteredCommandItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsCommandPaletteOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200 text-blue-900'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-serif">{item.title}</div>
                          <div className="text-xs text-slate-600 line-clamp-1 font-serif mt-0.5">{item.description}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
