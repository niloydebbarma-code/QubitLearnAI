/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI — Coursera/edX-Grade Quantum Academy & Multi-Lesson Course Player
 * Modern White-First Design with Vibrant Colorful Accents
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CurriculumLesson, CurriculumModuleAI } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Play,
  ChevronRight,
  ChevronLeft,
  Clock,
  Atom,
  HelpCircle,
  Star,
  Code2,
  GraduationCap,
  Search,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  Bookmark,
  ListOrdered,
} from 'lucide-react';
import { renderMixedTextWithLatex, HtmlContentWithLatex } from './MathView';

interface CurriculumModuleProps {
  onLoadPreset: (presetId: string) => void;
  onJumpToStudio: () => void;
}

type LevelFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface VideoLectureItem {
  id: string;
  title: string;
  url: string;
  duration: string;
  lecturer?: string;
}

export interface SubLessonItem {
  id: string;
  title: string;
  durationMin: number;
  videos: VideoLectureItem[];
  theoryHtml: string;
  mathematicalDerivations: string[];
  diagramImages: { url: string; caption: string }[];
  sdkCodeSnippets?: Record<string, string>;
  checkpointQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CourseItem {
  id: string;
  courseCode: string;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  totalDurationMin: number;
  xpReward: number;
  rating: number;
  enrolledCount: number;
  prerequisites: string[];
  learningObjectives: string[];
  instructor: {
    name: string;
    title: string;
    institution: string;
    bio: string;
  };
  lessons: SubLessonItem[];
}

export const CurriculumModule: React.FC<CurriculumModuleProps> = ({
  onLoadPreset,
  onJumpToStudio,
}) => {
  // Navigation: 'catalog' view vs. dedicated 'player' view
  const [viewMode, setViewMode] = useState<'catalog' | 'player'>('catalog');

  // Course Data loaded dynamically
  const [lessonsRaw, setLessonsRaw] = useState<CurriculumLesson[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Course Player State
  const [activeCourseId, setActiveCourseId] = useState<string>('c1');
  const [currentLessonIdx, setCurrentLessonIdx] = useState<number>(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [activeSdkTab, setActiveSdkTab] = useState<'qiskit' | 'pennylane' | 'cirq' | 'openqasm'>('qiskit');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    'c1_lesson_0': true,
  });
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, boolean>>({
    'c1': true,
  });

  // Load Courses from Database
  useEffect(() => {
    fetch('/api/curriculum/lessons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLessonsRaw(data);
          if (data[0]?.id) setActiveCourseId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Transform Lessons into Courses
  const courses: CourseItem[] = useMemo(() => {
    if (!lessonsRaw || lessonsRaw.length === 0) return [];

    return lessonsRaw.map((raw, idx) => {
      const code = `QC-${(idx + 1).toString().padStart(3, '0')}`;

      const subLessons: SubLessonItem[] = [
        {
          id: `${raw.id}_part1`,
          title: `1. Physical Principles & Quantum States: ${raw.title}`,
          durationMin: Math.round((raw.durationMin || 15) * 0.4),
          videos: [
            {
              id: 'v1',
              title: `Lecture 1.1: Core Quantum Formalism of ${raw.title}`,
              url: 'https://www.youtube.com/embed/QuRna36xUEg',
              duration: '14m 20s',
              lecturer: 'Prof. John Preskill (Caltech IQIM)',
            },
            {
              id: 'v2',
              title: `Lecture 1.2: Hilbert Space Mapping & Statevector Geometry`,
              url: 'https://www.youtube.com/embed/rqmIVeheTVU',
              duration: '9m 45s',
              lecturer: 'Dr. Sarah Lin (MIT)',
            },
          ],
          theoryHtml: raw.theoryContent || `<p>Comprehensive study of <strong>${raw.title}</strong>, exploring states and operators.</p>`,
          mathematicalDerivations: [
            '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1.0',
          ],
          diagramImages: [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/500px-Bloch_sphere.svg.png',
              caption: `State vector trajectory on the Bloch Sphere for ${raw.title}`,
            },
          ],
          sdkCodeSnippets: raw.sdkCodeSnippets,
          checkpointQuestions: raw.checkpointQuestions && raw.checkpointQuestions.length > 0
            ? [raw.checkpointQuestions[0]]
            : [
                {
                  question: `What fundamental quantum mechanical principle governs ${raw.title}?`,
                  options: [
                    'Unitary evolution preserving complex inner products',
                    'Classical non-deterministic coin flips',
                    'Irreversible thermal dissipation',
                    'Linear momentum quantization',
                  ],
                  correctIndex: 0,
                  explanation: 'Quantum state transformations in isolated systems are governed by unitary operators U†U = I.',
                },
              ],
        },
        {
          id: `${raw.id}_part2`,
          title: `2. Unitary Gate Matrix Operations & Multi-SDK Code`,
          durationMin: Math.round((raw.durationMin || 15) * 0.35),
          videos: [
            {
              id: 'v3',
              title: `Hands-on Code Walkthrough: Qiskit, PennyLane & Cirq`,
              url: 'https://www.youtube.com/embed/Jxqj1jzn-tQ',
              duration: '12m 45s',
              lecturer: 'Qiskit Development Team',
            },
          ],
          theoryHtml: `<h3>Unitary Matrix Realization</h3><p>To implement <strong>${raw.title}</strong> on quantum computers, we decompose the abstract state evolution into discrete hardware-native gate sequences.</p>`,
          mathematicalDerivations: [
            'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad CX = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
          ],
          diagramImages: [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/500px-Bloch_sphere.svg.png',
              caption: 'Quantum Circuit Decomposition Grid',
            },
          ],
          sdkCodeSnippets: raw.sdkCodeSnippets,
          checkpointQuestions: raw.checkpointQuestions && raw.checkpointQuestions.length > 1
            ? [raw.checkpointQuestions[1]]
            : [
                {
                  question: 'How does CNOT affect the target qubit when the control is in state |1⟩?',
                  options: ['Applies a bit-flip (Pauli-X) to the target', 'Leaves the target unchanged', 'Collapses the target to |0⟩', 'Inverts the global phase only'],
                  correctIndex: 0,
                  explanation: 'CNOT acts as a conditional bit-flip: |10⟩ -> |11⟩ and |11⟩ -> |10⟩.',
                },
              ],
        },
        {
          id: `${raw.id}_part3`,
          title: `3. Lab Verification & Synthesis: ${raw.title}`,
          durationMin: Math.round((raw.durationMin || 15) * 0.25),
          videos: [
            {
              id: 'v4',
              title: `Hardware Execution & Noise Analysis on Real QPUs`,
              url: 'https://www.youtube.com/embed/rqmIVeheTVU',
              duration: '8m 20s',
              lecturer: 'QubitLearn Research',
            },
          ],
          theoryHtml: `<h3>Laboratory Synthesis</h3><p>Synthesize and verify the full quantum state representation for <strong>${raw.title}</strong> using the interactive Circuit Studio.</p>`,
          mathematicalDerivations: [
            '\\rho = |\\psi\\rangle\\langle\\psi|, \\quad \\text{Tr}(\\rho^2) = 1.0 \\quad \\text{(Pure State)}',
          ],
          diagramImages: [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/500px-Bloch_sphere.svg.png',
              caption: 'Full Density Matrix ρ Heatmap',
            },
          ],
          sdkCodeSnippets: raw.sdkCodeSnippets,
          checkpointQuestions: raw.checkpointQuestions && raw.checkpointQuestions.length > 2
            ? [raw.checkpointQuestions[2]]
            : [
                {
                  question: 'What is the purity Tr(ρ²) of a clean, unentangled pure quantum state?',
                  options: ['Exactly 1.0', '0.5', '0.0', 'Depends on rotation angle'],
                  correctIndex: 0,
                  explanation: 'For any pure quantum state |ψ⟩, ρ = |ψ⟩⟨ψ| and Tr(ρ²) = 1.',
                },
              ],
        },
      ];

      return {
        id: raw.id,
        courseCode: code,
        title: raw.title,
        subtitle: raw.subtitle || 'Comprehensive Coursework in Quantum Computing',
        level: raw.level || 'Beginner',
        category: raw.category || 'Quantum Foundations',
        totalDurationMin: raw.durationMin || 45,
        xpReward: raw.xpReward || 250,
        rating: raw.communityStats?.rating || 4.9,
        enrolledCount: raw.communityStats?.enrolledCount || 1420,
        prerequisites: raw.prerequisites || ['Basic Linear Algebra (Vectors & Matrices)', 'Complex Numbers'],
        learningObjectives: raw.learningObjectives || [
          `Learn the mathematical formalism of ${raw.title}`,
          `Implement and execute multi-SDK circuits in Qiskit, PennyLane, and Cirq`,
          `Analyze statevector amplitudes and density matrices under real noise`,
        ],
        instructor: raw.instructor || {
          name: 'Dr. Sarah Lin',
          title: 'Principal Quantum Software Scientist',
          institution: 'Institute for Quantum Computing',
          bio: 'Author of 40+ papers on quantum compiler optimization and fault-tolerant algorithms.',
        },
        lessons: subLessons,
      };
    });
  }, [lessonsRaw]);

  // Active Course and Lesson
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];
  const activeLesson = activeCourse?.lessons[currentLessonIdx] || activeCourse?.lessons[0];
  const activeVideo = activeLesson?.videos[activeVideoIdx] || activeLesson?.videos[0];

  // Filtering for Course Catalog
  const filteredCatalog = useMemo(() => {
    return courses.filter((c) => {
      const matchLevel = selectedLevel === 'All' || c.level === selectedLevel;
      const matchSearch =
        searchQuery === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [courses, selectedLevel, searchQuery]);

  const handleEnrollCourse = (courseId: string) => {
    setEnrolledCourses((prev) => ({ ...prev, [courseId]: true }));
    setActiveCourseId(courseId);
    setCurrentLessonIdx(0);
    setActiveVideoIdx(0);
    setViewMode('player');
  };

  const handleUnenrollCourse = (courseId: string) => {
    setEnrolledCourses((prev) => {
      const copy = { ...prev };
      delete copy[courseId];
      return copy;
    });
    setViewMode('catalog');
  };

  const handleStartLesson = (courseId: string, lessonIdx: number) => {
    setActiveCourseId(courseId);
    setCurrentLessonIdx(lessonIdx);
    setActiveVideoIdx(0);
    setViewMode('player');
  };

  const handleCompleteCurrentLesson = () => {
    if (!activeCourse || !activeLesson) return;
    const lessonKey = `${activeCourse.id}_lesson_${currentLessonIdx}`;
    setCompletedLessons((prev) => ({ ...prev, [lessonKey]: true }));

    if (currentLessonIdx < activeCourse.lessons.length - 1) {
      setCurrentLessonIdx((prev) => prev + 1);
      setActiveVideoIdx(0);
    }
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (!activeLesson) return;
    const key = `${activeLesson.id}_q_${qIdx}`;
    setQuizAnswers((prev) => ({ ...prev, [key]: optIdx }));
  };

  const getCourseProgress = (course: CourseItem) => {
    const completed = course.lessons.filter((_, idx) => completedLessons[`${course.id}_lesson_${idx}`]).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* ========================================================= */}
      {/* 1. COURSERA / EDX STYLE COURSE CATALOG VIEW               */}
      {/* ========================================================= */}
      {viewMode === 'catalog' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Hero Banner */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-700 text-xs font-mono font-bold tracking-wider uppercase">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>QubitLearn Academy — Quantum Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Quantum Computing & Algorithm Engineering
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Structured university-grade coursework covering qubits, superposition, multi-SDK programming, Grover's search, QAOA, and VQE with interactive lab simulations.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 font-mono">{courses.length || 20}</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold">Courses</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 font-mono">60+</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold">Lessons</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600 font-mono">5000+</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold">XP Available</div>
              </div>
            </div>
          </div>

          {/* Search, Filters & Stats Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, topic, or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
              {(['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 20 Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((course) => {
              const isEnrolled = !!enrolledCourses[course.id];
              const progress = getCourseProgress(course);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md shadow-sm overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {course.courseCode}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {course.level}
                        </span>
                        <span className="text-[10px] text-amber-600 flex items-center gap-1 font-mono font-bold">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {course.rating}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                        {course.lessons.length} Lessons
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course.totalDurationMin} Mins
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500 font-medium">Progress</span>
                          <span className="text-indigo-600 font-bold">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-mono font-bold">
                      +{course.xpReward} XP
                    </span>

                    {isEnrolled ? (
                      <button
                        onClick={() => handleStartLesson(course.id, 0)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Enroll</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DEDICATED COURSERA-STYLE INTERACTIVE COURSE PLAYER     */}
      {/* ========================================================= */}
      {viewMode === 'player' && activeCourse && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Course Navigation Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewMode('catalog')}
              className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Course Catalog</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-600">
                Course: <strong className="text-slate-900">{activeCourse.courseCode}</strong> ({activeCourse.title})
              </span>
              <button
                onClick={() => handleUnenrollCourse(activeCourse.id)}
                className="text-[11px] text-rose-600 hover:underline font-mono font-semibold cursor-pointer"
              >
                Unenroll
              </button>
            </div>
          </div>

          {/* Main Course Player Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Course Syllabus & Multi-Lesson Stepper */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
                <div className="p-4 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activeCourse.level}
                    </span>
                    <span className="text-xs font-mono text-indigo-700 font-bold">
                      {getCourseProgress(activeCourse)}% Complete
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{activeCourse.title}</h3>
                </div>

                {/* Lessons Playlist */}
                <div className="p-2 space-y-1.5 max-h-[520px] overflow-y-auto">
                  {activeCourse.lessons.map((l, idx) => {
                    const isSelected = idx === currentLessonIdx;
                    const isDone = completedLessons[`${activeCourse.id}_lesson_${idx}`];

                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          setCurrentLessonIdx(idx);
                          setActiveVideoIdx(0);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border border-indigo-200 shadow-xs'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                                isSelected ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-slate-300 text-slate-500'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold leading-snug ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {l.title}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-1">
                            <span>{l.durationMin} Mins</span>
                            <span>•</span>
                            <span>{l.videos.length} Videos</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            {activeLesson && (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <div className="space-y-1 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                      <span>Lesson {currentLessonIdx + 1} of {activeCourse.lessons.length}</span>
                      <span>•</span>
                      <span>{activeLesson.durationMin} Minutes</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{activeLesson.title}</h2>
                  </div>

                  {/* MULTIPLE VIDEO LECTURES SWITCHER */}
                  {activeLesson.videos.length > 0 && activeVideo && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Lecture Streams ({activeLesson.videos.length} Available):</span>
                        </span>

                        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {activeLesson.videos.map((vid, vIdx) => (
                            <button
                              key={vid.id}
                              onClick={() => setActiveVideoIdx(vIdx)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                activeVideoIdx === vIdx
                                  ? 'bg-white text-indigo-900 font-bold shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Video {vIdx + 1} ({vid.duration})
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200">
                        <iframe
                          src={activeVideo.url}
                          width="100%"
                          height="100%"
                          title={activeVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="text-xs text-slate-600 font-mono flex items-center justify-between">
                        <span>Now Playing: <strong className="text-slate-900">{activeVideo.title}</strong></span>
                        <span>Lecturer: {activeVideo.lecturer}</span>
                      </div>
                    </div>
                  )}

                  {/* Lesson Theory Body */}
                  <div className="space-y-3 pt-2">
                    <HtmlContentWithLatex
                      html={activeLesson.theoryHtml}
                      className="prose max-w-none text-slate-700 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Mathematical Derivations */}
                  {activeLesson.mathematicalDerivations.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                        <Atom className="w-4 h-4 text-indigo-600" />
                        <span>Mathematical Dirac Identities & Derivations:</span>
                      </div>
                      <ul className="space-y-1.5 font-mono text-xs text-slate-800">
                        {activeLesson.mathematicalDerivations.map((d, idx) => (
                          <li key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                            {renderMixedTextWithLatex(d)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Visual Diagrams */}
                  {activeLesson.diagramImages.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-mono flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Schematic Figures & Statevector Diagrams:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeLesson.diagramImages.map((diag, dIdx) => (
                          <div key={dIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center shadow-2xs">
                            <img src={diag.url} alt={diag.caption} className="max-h-56 mx-auto object-contain rounded-lg" />
                            <p className="text-[11px] text-slate-500 font-mono italic">{diag.caption}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-SDK Code Tabs */}
                  {activeLesson.sdkCodeSnippets && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                          <Code2 className="w-4 h-4 text-indigo-600" />
                          <span>SDK Implementation</span>
                        </div>
                        <div className="flex space-x-1 text-xs font-mono font-semibold">
                          {(['qiskit', 'pennylane', 'cirq', 'openqasm'] as const).map((sdk) => (
                            <button
                              key={sdk}
                              onClick={() => setActiveSdkTab(sdk)}
                              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                                activeSdkTab === sdk ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {sdk.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <pre className="p-3 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                        <code>{activeLesson.sdkCodeSnippets[activeSdkTab] || '# Multi-SDK code available.'}</code>
                      </pre>
                    </div>
                  )}

                  {/* Concept Checkpoint Quiz */}
                  {activeLesson.checkpointQuestions.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
                      <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        <span>Concept Checkpoint Quiz ({activeLesson.checkpointQuestions.length} Questions)</span>
                      </div>

                      <div className="space-y-4">
                        {activeLesson.checkpointQuestions.map((q, qIdx) => {
                          const ansKey = `${activeLesson.id}_q_${qIdx}`;
                          const selectedOpt = quizAnswers[ansKey];
                          const isAnswered = selectedOpt !== undefined;
                          const isCorrect = selectedOpt === q.correctIndex;

                          return (
                            <div key={qIdx} className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                              <div className="text-xs font-bold text-slate-900">
                                {qIdx + 1}. {q.question}
                              </div>
                              <div className="space-y-1.5">
                                {q.options.map((opt, optIdx) => (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                      isAnswered && optIdx === q.correctIndex
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                        : isAnswered && selectedOpt === optIdx
                                        ? 'bg-rose-50 text-rose-900 border-rose-300'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isAnswered && optIdx === q.correctIndex && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                              {isAnswered && (
                                <div
                                  className={`p-2.5 rounded-lg text-xs font-medium ${
                                    isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                                  }`}
                                >
                                  <strong>{isCorrect ? 'Correct!' : 'Explanation:'}</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PAGINATION STEPPER CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        if (currentLessonIdx > 0) {
                          setCurrentLessonIdx((prev) => prev - 1);
                          setActiveVideoIdx(0);
                        }
                      }}
                      disabled={currentLessonIdx === 0}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Lesson</span>
                    </button>

                    <button
                      onClick={handleCompleteCurrentLesson}
                      className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-sm"
                    >
                      <span>
                        {currentLessonIdx === activeCourse.lessons.length - 1
                          ? 'Mark Course as Completed'
                          : 'Complete & Next Lesson'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
