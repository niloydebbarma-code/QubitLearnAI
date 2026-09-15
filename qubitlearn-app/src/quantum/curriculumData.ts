/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 100% Dynamic Curriculum Schema
 * All course metadata, multi-lessons, video lectures, and practice problems
 * are dynamically loaded directly from the 'course_documents' folder and Supabase Cloud.
 * ZERO hardcoded static curriculum stored in source code.
 */

import { CurriculumLesson } from '../types';

export const CURRICULUM_LESSONS: CurriculumLesson[] = [];
