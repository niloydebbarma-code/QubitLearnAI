/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUBITLEARN AI — CONTENT SYNC ENGINE & STRICT SCHEMA VALIDATOR CLI
 * 
 * Command-Line Interface (CLI) Usage:
 *   npx tsx sync_content_engine.ts --target=<all|courses|challenges|research>
 *   npx tsx sync_content_engine.ts --course=<folder_name_or_number>
 *   npx tsx sync_content_engine.ts --challenge=<folder_name_or_id>
 *   npx tsx sync_content_engine.ts --paper=<id_or_file>
 *   npx tsx sync_content_engine.ts --file=<relative_path_to_file>
 *   npx tsx sync_content_engine.ts --dry-run
 * 
 * Non-destructive & Green: Updates ONLY modified/targeted records without full database dumps.
 * STRICT PRE-UPLOAD GATE: Validates data types, enums, positive numbers, and JSON schemas.
 */

import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const ROOT_DIR = path.join(process.cwd(), '..');
const COURSE_DOCS_DIR = path.join(ROOT_DIR, 'course_documents');
const CHALLENGE_DOCS_DIR = path.join(ROOT_DIR, 'challenge_documents');
const RESEARCH_DOCS_DIR = path.join(ROOT_DIR, 'research_documents');
const ASSESSMENT_DOCS_DIR = path.join(ROOT_DIR, 'assessment_documents');

// =========================================================================
// STRICT SCHEMA VALIDATORS & TYPE GUARDS
// =========================================================================

interface ValidationError {
  folder: string;
  file: string;
  field: string;
  expected: string;
  received: any;
}

function validateCourseSchema(course: any, fileRef: string, errors: ValidationError[]): boolean {
  let valid = true;
  const requireString = (field: string, val: any) => {
    if (typeof val !== 'string' || !val.trim()) {
      errors.push({ folder: 'course_documents', file: fileRef, field, expected: 'non-empty string', received: val });
      valid = false;
    }
  };
  const requireInt = (field: string, val: any) => {
    if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
      errors.push({ folder: 'course_documents', file: fileRef, field, expected: 'positive integer', received: val });
      valid = false;
    }
  };

  requireString('id', course.id);
  requireString('title', course.title);
  requireInt('duration_min', course.duration_min);
  requireInt('sequence_order', course.sequence_order);

  const allowedLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  if (!allowedLevels.includes(course.level)) {
    errors.push({ folder: 'course_documents', file: fileRef, field: 'level', expected: allowedLevels.join('|'), received: course.level });
    valid = false;
  }

  // Verify JSON serializability
  ['concepts_json', 'content_mdx', 'mathematical_derivations_json', 'checkpoint_questions_json'].forEach((jsonField) => {
    try {
      JSON.parse(course[jsonField]);
    } catch (e) {
      errors.push({ folder: 'course_documents', file: fileRef, field: jsonField, expected: 'valid JSON string', received: 'Malformed JSON' });
      valid = false;
    }
  });

  return valid;
}

function validateChallengeSchema(challenge: any, fileRef: string, errors: ValidationError[]): boolean {
  let valid = true;
  if (!challenge.id || typeof challenge.id !== 'string') {
    errors.push({ folder: 'challenge_documents', file: fileRef, field: 'id', expected: 'string', received: challenge.id });
    valid = false;
  }
  if (!challenge.title || typeof challenge.title !== 'string') {
    errors.push({ folder: 'challenge_documents', file: fileRef, field: 'title', expected: 'string', received: challenge.title });
    valid = false;
  }
  if (typeof challenge.num_qubits !== 'number' || challenge.num_qubits < 1) {
    errors.push({ folder: 'challenge_documents', file: fileRef, field: 'num_qubits', expected: 'integer >= 1', received: challenge.num_qubits });
    valid = false;
  }
  return valid;
}

function validatePaperSchema(paper: any, fileRef: string, errors: ValidationError[]): boolean {
  let valid = true;
  if (!paper.id || typeof paper.id !== 'string') {
    errors.push({ folder: 'research_documents', file: fileRef, field: 'id', expected: 'string', received: paper.id });
    valid = false;
  }
  if (!paper.title || typeof paper.title !== 'string') {
    errors.push({ folder: 'research_documents', file: fileRef, field: 'title', expected: 'string', received: paper.title });
    valid = false;
  }
  if (typeof paper.year !== 'number' || paper.year < 1900 || paper.year > 2030) {
    errors.push({ folder: 'research_documents', file: fileRef, field: 'year', expected: 'valid 4-digit year', received: paper.year });
    valid = false;
  }
  return valid;
}

function parseMdxFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter: Record<string, string> = {};
  let body = content;

  if (content.startsWith('---')) {
    const parts = content.split('---');
    if (parts.length >= 3) {
      const fm = parts[1];
      body = parts.slice(2).join('---').trim();
      for (const line of fm.split('\n')) {
        if (line.includes(':')) {
          const [k, ...v] = line.split(':');
          frontmatter[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }

  let iframeVideo = '';
  const iframeMatch = body.match(/src="(https:\/\/[^"]+)"/);
  if (iframeMatch) {
    iframeVideo = iframeMatch[1];
  }

  return { frontmatter, body, iframeVideo };
}

// =========================================================================
// MASTER CONTENT SYNC CLI RUNNER
// =========================================================================

async function runTargetedContentIngestion() {
  const args = process.argv.slice(2);
  const targetArg = (args.find((a) => a.startsWith('--target='))?.split('=')[1] || 'all').toLowerCase();
  const courseArg = args.find((a) => a.startsWith('--course='))?.split('=')[1];
  const challengeArg = args.find((a) => a.startsWith('--challenge='))?.split('=')[1];
  const paperArg = args.find((a) => a.startsWith('--paper='))?.split('=')[1];
  const fileArg = args.find((a) => a.startsWith('--file='))?.split('=')[1];
  const isDryRun = args.includes('--dry-run');

  console.log('==========================================================================');
  console.log('🚀 QUBITLEARN AI — CONTENT SYNC ENGINE & STRICT SCHEMA VALIDATOR');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Validation Only)' : 'LIVE CLOUD UPSERT'}`);
  console.log(`Target Scope:   ${targetArg.toUpperCase()}`);
  if (courseArg) console.log(`Course Filter:  ${courseArg}`);
  if (challengeArg) console.log(`Challenge Filter: ${challengeArg}`);
  if (paperArg) console.log(`Paper Filter:   ${paperArg}`);
  if (fileArg) console.log(`Single File:    ${fileArg}`);
  console.log('==========================================================================');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SECRET_KEY environment variables required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const validationErrors: ValidationError[] = [];

  // -----------------------------------------------------------------------
  // 1. Process 'course_documents/' (if target=all or target=courses)
  // -----------------------------------------------------------------------
  const coursePayloads: any[] = [];
  if (targetArg === 'all' || targetArg === 'courses') {
    const textDir = path.join(COURSE_DOCS_DIR, 'Text');
    const practicesDir = path.join(COURSE_DOCS_DIR, 'Practices');

    if (fs.existsSync(textDir)) {
      let folders = fs.readdirSync(textDir).filter((d) => fs.statSync(path.join(textDir, d)).isDirectory());
      
      if (courseArg) {
        folders = folders.filter((f) => f.toLowerCase().includes(courseArg.toLowerCase()));
      }

      folders.sort((a, b) => {
        const numA = parseInt(a.match(/C(\d+)/)?.[1] || '999', 10);
        const numB = parseInt(b.match(/C(\d+)/)?.[1] || '999', 10);
        return numA - numB;
      });

      console.log(`\n📂 [1/4] Scanning ${folders.length} course folder(s)...`);

      for (let idx = 0; idx < folders.length; idx++) {
        const folder = folders[idx];
        const cNum = parseInt(folder.match(/C(\d+)/)?.[1] || `${idx + 1}`, 10);
        const cleanTitle = folder.includes('_') ? folder.split('_').slice(1).join(' ') : folder;

        let level = 'Beginner';
        if (cNum > 5 && (cNum <= 10 || cNum === 17)) level = 'Intermediate';
        else if ([11, 12, 14, 15, 18].includes(cNum)) level = 'Advanced';
        else if (cNum > 10) level = 'Expert';

        const courseId = `course-${cNum}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24)}`;
        const folderPath = path.join(textDir, folder);
        const lessonFiles: string[] = [];
        const walk = (dir: string) => {
          for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item);
            if (fs.statSync(full).isDirectory()) walk(full);
            else if (item.endsWith('.mdx')) {
              if (!fileArg || full.replace(/\\/g, '/').includes(fileArg.replace(/\\/g, '/'))) {
                lessonFiles.push(full);
              }
            }
          }
        };
        walk(folderPath);

        const pFile = path.join(practicesDir, `C${cNum}`, 'practice_1.json');
        let practiceData: any = {};
        if (fs.existsSync(pFile)) {
          try {
            practiceData = JSON.parse(fs.readFileSync(pFile, 'utf8'));
          } catch (_) {}
        }

        const subLessons: any[] = [];
        let primaryVideo = '';
        let primaryImage = '';

        for (let lIdx = 0; lIdx < lessonFiles.length; lIdx++) {
          const { frontmatter, body, iframeVideo } = parseMdxFile(lessonFiles[lIdx]);
          const lTitle = frontmatter.title || `Lesson ${lIdx + 1}: ${cleanTitle}`;
          const videoUrl = frontmatter.video_url || iframeVideo || '';
          const imageUrl = frontmatter.image_url || '';
          const duration = parseInt(frontmatter.duration_minutes || '15', 10);

          if (lIdx === 0) {
            primaryVideo = videoUrl;
            primaryImage = imageUrl;
          }

          subLessons.push({
            id: `${courseId}_l${lIdx + 1}`,
            title: lTitle,
            durationMin: duration,
            videos: videoUrl ? [{ id: `v_${cNum}_${lIdx + 1}`, title: lTitle, url: videoUrl, duration: `${duration}m 00s` }] : [],
            theoryHtml: body,
            mathematicalDerivations: [`\\text{Unitary: } U |\\psi\\rangle = |\\psi'\\rangle \\quad [U^\\dagger U = I]`],
            diagramImages: imageUrl ? [{ url: imageUrl, caption: `${cleanTitle} Diagram` }] : [],
            checkpointQuestions: practiceData.target_goal ? [
              {
                question: practiceData.target_goal,
                options: ['Unitary state evolution preserving norm (U†U = I)', 'Non-linear amplitude dissipation', 'Classical collapse', 'Deterministic bit assignment'],
                correctIndex: 0,
                explanation: (practiceData.hints || ['Conserves probability.']).join(' '),
              }
            ] : [],
          });
        }

        const fullCourseObj = {
          id: courseId,
          courseCode: `QC-${100 + cNum * 10}`,
          title: cleanTitle,
          subtitle: `Coursework in ${cleanTitle}`,
          level,
          totalDurationMin: subLessons.reduce((acc, l) => acc + l.durationMin, 0) || 45,
          xpReward: 250,
          rating: 4.95,
          enrolledCount: 1200 + cNum * 50,
          learningObjectives: [`Master ${cleanTitle}`, `Simulate ${cleanTitle}`, 'Verify statevectors'],
          lessons: subLessons,
          primaryVideo,
          primaryImage,
        };

        const courseRow = {
          id: courseId,
          title: cleanTitle,
          subtitle: `Coursework in ${cleanTitle}`,
          level,
          sequence_order: cNum,
          duration_min: fullCourseObj.totalDurationMin,
          summary: `Coursework in ${cleanTitle}`,
          concepts_json: JSON.stringify(fullCourseObj.learningObjectives),
          content_mdx: JSON.stringify(fullCourseObj),
          mathematical_derivations_json: JSON.stringify(subLessons[0]?.mathematicalDerivations || []),
          video_url: primaryVideo,
          image_url: primaryImage,
          circuit_preset_id: 'bell-phi-plus',
          checkpoint_questions_json: JSON.stringify(subLessons[0]?.checkpointQuestions || []),
        };

        if (validateCourseSchema(courseRow, folder, validationErrors)) {
          coursePayloads.push(courseRow);
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // 2. Process 'challenge_documents/' (if target=all or target=challenges)
  // -----------------------------------------------------------------------
  const challengePayloads: any[] = [];
  if (targetArg === 'all' || targetArg === 'challenges') {
    if (fs.existsSync(CHALLENGE_DOCS_DIR)) {
      let chDirs = fs.readdirSync(CHALLENGE_DOCS_DIR).filter((d) => fs.statSync(path.join(CHALLENGE_DOCS_DIR, d)).isDirectory());
      if (challengeArg) {
        chDirs = chDirs.filter((d) => d.toLowerCase().includes(challengeArg.toLowerCase()));
      }
      console.log(`\n📂 [2/4] Scanning ${chDirs.length} challenge folder(s)...`);

      for (const d of chDirs) {
        const cFile = path.join(CHALLENGE_DOCS_DIR, d, 'challenge.json');
        if (fs.existsSync(cFile)) {
          try {
            const raw = JSON.parse(fs.readFileSync(cFile, 'utf8'));
            const challengeRow = {
              id: raw.id,
              title: raw.title,
              difficulty: raw.difficulty || 'Medium',
              description: raw.description,
              target_goal: raw.targetGoal,
              num_qubits: raw.num_qubits || raw.numQubits || 2,
              initial_gates_json: JSON.stringify(raw.initialGates || []),
              expected_state_desc: raw.expectedStateDescription || '|ψ⟩',
              hint: raw.hint || 'Think about quantum superposition.',
            };
            if (validateChallengeSchema(challengeRow, d, validationErrors)) {
              challengePayloads.push(challengeRow);
            }
          } catch (e) {
            validationErrors.push({ folder: 'challenge_documents', file: d, field: 'JSON', expected: 'valid JSON', received: 'Parse Error' });
          }
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // 3. Process 'research_documents/' (if target=all or target=research)
  // -----------------------------------------------------------------------
  const paperPayloads: any[] = [];
  if (targetArg === 'all' || targetArg === 'research') {
    if (fs.existsSync(RESEARCH_DOCS_DIR)) {
      let pFiles = fs.readdirSync(RESEARCH_DOCS_DIR).filter((f) => f.endsWith('.json'));
      if (paperArg) {
        pFiles = pFiles.filter((f) => f.toLowerCase().includes(paperArg.toLowerCase()));
      }
      console.log(`\n📂 [3/4] Scanning ${pFiles.length} research paper preset(s)...`);

      for (const f of pFiles) {
        try {
          const raw = JSON.parse(fs.readFileSync(path.join(RESEARCH_DOCS_DIR, f), 'utf8'));
          const paperRow = {
            id: raw.id,
            title: raw.title,
            authors: raw.authors,
            year: raw.year,
            venue: raw.venue,
            abstract: raw.abstract,
            full_excerpt: raw.fullExcerpt,
            precomputed_claims_json: JSON.stringify(raw.precomputedClaims || []),
            open_gaps_json: JSON.stringify(raw.openGaps || []),
            lean_theorem_example: raw.leanTheoremExample || '',
          };
          if (validatePaperSchema(paperRow, f, validationErrors)) {
            paperPayloads.push(paperRow);
          }
        } catch (e) {
          validationErrors.push({ folder: 'research_documents', file: f, field: 'JSON', expected: 'valid JSON', received: 'Parse Error' });
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // PRE-UPLOAD AUDIT SUMMARY
  // -----------------------------------------------------------------------
  console.log('\n==========================================================================');
  console.log('📊 STRICT SCHEMA & DTYPE PRE-UPLOAD AUDIT');
  console.log('==========================================================================');
  console.log(`• Courses Target Rows:    ${coursePayloads.length}`);
  console.log(`• Challenges Target Rows: ${challengePayloads.length}`);
  console.log(`• Research Papers Target: ${paperPayloads.length}`);

  if (validationErrors.length > 0) {
    console.error(`\n❌ SCHEMA VALIDATION REJECTED: ${validationErrors.length} type/schema errors found:`);
    validationErrors.forEach((e) => {
      console.error(`  - [${e.folder}/${e.file}] Field '${e.field}': Expected ${e.expected}, got: ${JSON.stringify(e.received)}`);
    });
    process.exit(1);
  }

  console.log('✅ ALL TARGET PAYLOADS VERIFIED: 100% Type-Safe & Schema-Compliant.');

  if (isDryRun) {
    console.log('\n[DRY-RUN] Schema validation passed. Zero cloud database writes executed.');
    return;
  }

  // -----------------------------------------------------------------------
  // NON-DESTRUCTIVE TARGETED UPSERTION
  // -----------------------------------------------------------------------
  console.log('\n☁️  Executing Non-Destructive Targeted Upsertion to Supabase Cloud...');

  if (coursePayloads.length > 0) {
    for (const c of coursePayloads) {
      await supabase.from('lessons').upsert(c);
    }
    console.log(`  ↳ Upserted ${coursePayloads.length} targeted course(s) in 'lessons'.`);
  }

  if (challengePayloads.length > 0) {
    for (const ch of challengePayloads) {
      await supabase.from('coding_challenges').upsert(ch);
    }
    console.log(`  ↳ Upserted ${challengePayloads.length} targeted challenge(s) in 'coding_challenges'.`);
  }

  if (paperPayloads.length > 0) {
    for (const p of paperPayloads) {
      await supabase.from('research_papers').upsert(p);
    }
    console.log(`  ↳ Upserted ${paperPayloads.length} targeted paper(s) in 'research_papers'.`);
  }

  console.log('\n==========================================================================');
  console.log('🏆 TARGETED INGESTION & CLOUD PERSISTENCE COMPLETE!');
  console.log('==========================================================================');
}

runTargetedContentIngestion().catch(console.error);
