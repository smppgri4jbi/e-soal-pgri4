import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleOptions, createExamVariations, calculateTotalPoints, exportToMoodleXml } from './examGenerator';
import { Question } from '../types/exam';

const sampleQuestion: Question = {
  id: 'q1',
  subject: 'Matematika',
  gradeLevel: 'Kelas 8 SMP',
  topic: 'Teorema Pythagoras',
  type: 'multiple_choice',
  difficulty: 'Sedang',
  text: 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 6 cm dan 8 cm. Berapakah panjang sisi miringnya?',
  options: [
    { key: 'A', text: '10 cm' },
    { key: 'B', text: '12 cm' },
    { key: 'C', text: '14 cm' },
    { key: 'D', text: '15 cm' },
  ],
  correctAnswer: 'A', // 10 cm
  explanation: 'Sisi miring = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
  points: 10,
  tags: ['Pythagoras', 'Geometri'],
  kurikulum: 'Kurikulum Merdeka',
};

test('shuffleOptions preserves the correct text answer while rotating keys', () => {
  const originalCorrectText = sampleQuestion.options?.find(o => o.key === sampleQuestion.correctAnswer)?.text;
  assert.equal(originalCorrectText, '10 cm');

  const scrambled = shuffleOptions(sampleQuestion, 1);
  assert.equal(scrambled.options?.length, 4);
  
  // Find which option now contains "10 cm"
  const newCorrectOption = scrambled.options?.find(o => o.key === scrambled.correctAnswer);
  assert.ok(newCorrectOption, 'New correct option must exist');
  assert.equal(newCorrectOption?.text, '10 cm', 'The answer pointing to 10 cm must remain correct');
});

test('createExamVariations creates requested number of package variations with accurate answer keys', () => {
  const q2: Question = {
    id: 'q2',
    subject: 'Matematika',
    gradeLevel: 'Kelas 8 SMP',
    topic: 'Aljabar',
    type: 'multiple_choice',
    difficulty: 'Mudah',
    text: 'Nilai dari 2x + 5 jika x = 3 adalah...',
    options: [
      { key: 'A', text: '8' },
      { key: 'B', text: '10' },
      { key: 'C', text: '11' },
      { key: 'D', text: '13' },
    ],
    correctAnswer: 'C',
    explanation: '2(3) + 5 = 6 + 5 = 11',
    points: 10,
    tags: ['Aljabar'],
    kurikulum: 'Kurikulum Merdeka',
  };

  const variations = createExamVariations([sampleQuestion, q2], 3);
  assert.equal(variations.length, 3);
  assert.equal(variations[0].packageCode, 'Paket A');
  assert.equal(variations[1].packageCode, 'Paket B');
  assert.equal(variations[2].packageCode, 'Paket C');

  // Verify answer keys summary is populated
  assert.ok(variations[0].answerKeySummary[1]);
  assert.ok(variations[0].answerKeySummary[2]);
});

test('calculateTotalPoints sums up points accurately', () => {
  const total = calculateTotalPoints([
    { ...sampleQuestion, points: 15 },
    { ...sampleQuestion, id: 'q2', points: 25 },
  ]);
  assert.equal(total, 40);
});

test('exportToMoodleXml generates valid Moodle XML containing question texts and feedback', () => {
  const xml = exportToMoodleXml('Ujian Matematika PTS', [sampleQuestion]);
  assert.ok(xml.includes('<quiz>'));
  assert.ok(xml.includes('Teorema Pythagoras'));
  assert.ok(xml.includes('10 cm'));
  assert.ok(xml.includes('fraction="100"'));
  assert.ok(xml.includes('</quiz>'));
});
