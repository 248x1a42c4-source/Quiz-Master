import { CategoryId, Difficulty, Question } from '../types/quiz';
import { FALLBACK_QUESTIONS } from '../data/fallbackQuestions';
import { StorageService } from './storageService';

// Decode HTML entities commonly returned by Open Trivia DB
export function decodeHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uuml;/g, 'ü');
}

// Fisher-Yates array shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface OpenTdbApiResponse {
  response_code: number;
  results: {
    category: string;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }[];
}

export interface FetchQuizResult {
  questions: Question[];
  source: 'api' | 'fallback' | 'custom';
  errorWarning?: string;
}

export class OpenTdbService {
  public static async fetchQuestions(
    category: CategoryId,
    apiCategoryId?: number,
    difficulty: Difficulty = 'any',
    amount: number = 10
  ): Promise<FetchQuizResult> {
    // 1. Handle Custom Category
    if (category === 'custom') {
      const customList = StorageService.getCustomQuestions();
      if (customList.length === 0) {
        throw new Error('No custom questions found. Create some questions first!');
      }
      const shuffled = shuffleArray(customList).slice(0, amount);
      const ready = shuffled.map((q) => ({
        ...q,
        allAnswers: shuffleArray([q.correctAnswer, ...q.incorrectAnswers]),
      }));
      return {
        questions: ready,
        source: 'custom',
      };
    }

    // 2. Handle Programming (Curated rich bank + optional fallback)
    if (category === 'programming') {
      const progQuestions = FALLBACK_QUESTIONS.filter((q) => q.category === 'programming');
      let filtered = progQuestions;
      if (difficulty !== 'any') {
        const diffMatch = progQuestions.filter((q) => q.difficulty === difficulty);
        if (diffMatch.length > 0) filtered = diffMatch;
      }
      const shuffled = shuffleArray(filtered).slice(0, amount);
      const ready = shuffled.map((q) => ({
        ...q,
        allAnswers: shuffleArray([q.correctAnswer, ...q.incorrectAnswers]),
      }));
      return {
        questions: ready,
        source: 'fallback',
      };
    }

    // 3. Try Open Trivia DB API
    if (apiCategoryId) {
      try {
        let url = `https://opentdb.com/api.php?amount=${amount}&category=${apiCategoryId}&type=multiple`;
        if (difficulty !== 'any') {
          url += `&difficulty=${difficulty}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Open Trivia DB responded with HTTP ${response.status}`);
        }

        const data: OpenTdbApiResponse = await response.json();

        // Check OpenTdb response code: 0 = Success
        if (data.response_code === 0 && data.results && data.results.length > 0) {
          const mappedQuestions: Question[] = data.results.map((item, idx) => {
            const cleanQuestion = decodeHtml(item.question);
            const cleanCorrect = decodeHtml(item.correct_answer);
            const cleanIncorrect = item.incorrect_answers.map((ans) => decodeHtml(ans));
            const all = shuffleArray([cleanCorrect, ...cleanIncorrect]);

            return {
              id: `api-${category}-${idx}-${Date.now()}`,
              category,
              categoryName: decodeHtml(item.category),
              question: cleanQuestion,
              correctAnswer: cleanCorrect,
              incorrectAnswers: cleanIncorrect,
              allAnswers: all,
              difficulty: item.difficulty,
            };
          });

          return {
            questions: mappedQuestions,
            source: 'api',
          };
        } else {
          // Response code was not 0 (e.g. not enough questions for exact filter)
          console.warn(`OpenTDB code ${data.response_code}, switching to fallback bank`);
        }
      } catch (err: unknown) {
        console.warn('Network or OpenTDB error, using resilient offline question bank:', err);
      }
    }

    // 4. Fallback Questions for standard categories
    const matchingFallback = FALLBACK_QUESTIONS.filter((q) => q.category === category);
    const pool = matchingFallback.length > 0 ? matchingFallback : FALLBACK_QUESTIONS;
    const shuffled = shuffleArray(pool).slice(0, amount);

    const ready = shuffled.map((q, idx) => ({
      ...q,
      id: `fallback-${category}-${idx}-${Date.now()}`,
      allAnswers: shuffleArray([q.correctAnswer, ...q.incorrectAnswers]),
    }));

    return {
      questions: ready,
      source: 'fallback',
      errorWarning: 'Loaded from offline verified question bank (Open Trivia DB unreachable or rate-limited).',
    };
  }
}
