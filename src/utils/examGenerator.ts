import { Question, ExamVariation, QuestionOption } from '../types/exam';

/**
 * Shuffles options of a multiple choice question and updates correctAnswer accordingly.
 */
export function shuffleOptions(question: Question, seedOffset: number = 0): Question {
  if (question.type !== 'multiple_choice' || !question.options || question.options.length === 0) {
    return { ...question };
  }

  const originalOptions = [...question.options];
  const originalCorrectOption = originalOptions.find(o => o.key === question.correctAnswer);
  
  if (!originalCorrectOption) {
    return { ...question };
  }

  // Deterministic or pseudo-random rotation/shuffle based on question ID and seed
  const shuffledTextList = originalOptions.map(o => o.text);
  
  // Fisher-Yates shuffle with controlled deterministic permutation when offset is given
  for (let i = shuffledTextList.length - 1; i > 0; i--) {
    const j = Math.floor(((i + seedOffset * 3 + question.id.charCodeAt(0) || 1) % (i + 1)));
    const temp = shuffledTextList[i];
    shuffledTextList[i] = shuffledTextList[j];
    shuffledTextList[j] = temp;
  }

  // Ensure it didn't accidentally keep the exact same order if multiple options
  if (shuffledTextList.length > 2 && shuffledTextList[0] === originalOptions[0].text && seedOffset > 0) {
    const first = shuffledTextList.shift()!;
    shuffledTextList.push(first);
  }

  const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const newOptions: QuestionOption[] = shuffledTextList.map((text, idx) => ({
    key: keys[idx] || 'A',
    text,
  }));

  const newCorrectOption = newOptions.find(o => o.text === originalCorrectOption.text);
  const newCorrectAnswer = newCorrectOption ? newCorrectOption.key : question.correctAnswer;

  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
  };
}

/**
 * Creates multiple variations (Paket A, Paket B, Paket C) from a set of base questions.
 * Paket A keeps original order.
 * Paket B & C shuffle question orders and option positions to create unique parallel test sets.
 */
export function createExamVariations(baseQuestions: Question[], count: number = 2): ExamVariation[] {
  const packageCodes: ('Paket A' | 'Paket B' | 'Paket C' | 'Paket D')[] = [
    'Paket A',
    'Paket B',
    'Paket C',
    'Paket D',
  ];

  const safeCount = Math.max(1, Math.min(count, 4));
  const variations: ExamVariation[] = [];

  for (let p = 0; p < safeCount; p++) {
    const code = packageCodes[p];
    let variationQuestions: Question[] = [];

    if (p === 0) {
      // Paket A: Master copy
      variationQuestions = baseQuestions.map(q => ({ ...q }));
    } else {
      // Paket B, C, D: Parallel variations with shuffled question order & scrambled options
      const scrambled = baseQuestions.map(q => shuffleOptions(q, p));
      
      // Scramble question sequence using offset
      variationQuestions = [...scrambled].sort((a, b) => {
        const hashA = (a.id.charCodeAt(a.id.length - 1) * (p + 1)) % 100;
        const hashB = (b.id.charCodeAt(b.id.length - 1) * (p + 1)) % 100;
        return hashA - hashB;
      });
    }

    // Generate answer key summary (1 -> 'A', 2 -> 'C', etc.)
    const answerKeySummary: Record<number, string> = {};
    variationQuestions.forEach((q, idx) => {
      answerKeySummary[idx + 1] = q.correctAnswer;
    });

    variations.push({
      packageCode: code,
      title: `Ujian ${code}`,
      description: p === 0 ? 'Paket Master Standar' : `Variasi Unik ${code} (Urutan & Opsi Teracak)`,
      questions: variationQuestions,
      answerKeySummary,
    });
  }

  return variations;
}

/**
 * Calculates total possible points for a set of questions.
 */
export function calculateTotalPoints(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 0), 0);
}

/**
 * Formats exam questions into standard Moodle XML for direct LMS import.
 */
export function exportToMoodleXml(title: string, questions: Question[]): string {
  const sanitize = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
  xml += `  <question type="category">\n    <category>\n      <text>$course$/top/${sanitize(title)}</text>\n    </category>\n  </question>\n`;

  questions.forEach((q, idx) => {
    if (q.type === 'multiple_choice' && q.options) {
      xml += `  <question type="multichoice">\n`;
      xml += `    <name><text>Soal ${idx + 1}: ${sanitize(q.topic)}</text></name>\n`;
      xml += `    <questiontext format="html"><text><![CDATA[<p>${sanitize(q.text)}</p>]]></text></questiontext>\n`;
      xml += `    <defaultgrade>${q.points}</defaultgrade>\n`;
      xml += `    <generalfeedback format="html"><text><![CDATA[<p>${sanitize(q.explanation)}</p>]]></text></generalfeedback>\n`;
      xml += `    <single>true</single>\n`;
      xml += `    <shuffleanswers>true</shuffleanswers>\n`;
      xml += `    <answernumbering>abc</answernumbering>\n`;

      q.options.forEach(opt => {
        const isCorrect = opt.key === q.correctAnswer;
        const fraction = isCorrect ? 100 : 0;
        xml += `    <answer fraction="${fraction}" format="html">\n`;
        xml += `      <text><![CDATA[<p>${sanitize(opt.text)}</p>]]></text>\n`;
        xml += `      <feedback format="html"><text><![CDATA[<p>${isCorrect ? 'Benar!' : 'Kurang tepat.'}</p>]]></text></feedback>\n`;
        xml += `    </answer>\n`;
      });

      xml += `  </question>\n`;
    } else {
      // Essay or Short Answer
      xml += `  <question type="essay">\n`;
      xml += `    <name><text>Soal ${idx + 1} (Essay): ${sanitize(q.topic)}</text></name>\n`;
      xml += `    <questiontext format="html"><text><![CDATA[<p>${sanitize(q.text)}</p>]]></text></questiontext>\n`;
      xml += `    <defaultgrade>${q.points}</defaultgrade>\n`;
      xml += `    <generalfeedback format="html"><text><![CDATA[<p><strong>Kunci Jawaban/Rubrik:</strong> ${sanitize(q.correctAnswer)}<br/><strong>Penjelasan:</strong> ${sanitize(q.explanation)}</p>]]></text></generalfeedback>\n`;
      xml += `  </question>\n`;
    }
  });

  xml += `</quiz>`;
  return xml;
}
