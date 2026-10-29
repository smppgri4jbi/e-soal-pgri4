import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateClassStats, calculateTopicMastery, categorizeStudents } from './analytics';
import { Student } from '../types/exam';

const dummyStudents: Student[] = [
  {
    id: 's1',
    nisn: '0081234567',
    name: 'Ahmad Fauzan',
    gender: 'L',
    classId: 'c1',
    email: 'ahmad@sekolah.id',
    averageScore: 90,
    examsTakenCount: 4,
    attendanceRate: 98,
    status: 'Mahir',
    strengths: ['Geometri'],
    weaknesses: [],
    progressTrend: [85, 88, 92, 90],
    submissions: [
      {
        examId: 'ex1',
        examTitle: 'PTS Matematika',
        date: '2026-10-15',
        score: 90,
        maxScore: 100,
        percentage: 90,
        passed: true,
        timeSpentMinutes: 45,
        answers: {},
        feedback: 'Bagus',
        topicBreakdown: {
          'Aljabar': { total: 5, correct: 4 },
          'Geometri': { total: 5, correct: 5 },
        },
      },
    ],
  },
  {
    id: 's2',
    nisn: '0081234568',
    name: 'Bunga Citra',
    gender: 'P',
    classId: 'c1',
    email: 'bunga@sekolah.id',
    averageScore: 70, // below 75 KKM
    examsTakenCount: 4,
    attendanceRate: 92,
    status: 'Perlu Pendampingan',
    strengths: ['Statistika'],
    weaknesses: ['Aljabar'],
    progressTrend: [68, 72, 65, 70],
    submissions: [
      {
        examId: 'ex1',
        examTitle: 'PTS Matematika',
        date: '2026-10-15',
        score: 70,
        maxScore: 100,
        percentage: 70,
        passed: false,
        timeSpentMinutes: 55,
        answers: {},
        feedback: 'Perlu latihan aljabar',
        topicBreakdown: {
          'Aljabar': { total: 5, correct: 2 },
          'Geometri': { total: 5, correct: 4 },
        },
      },
    ],
  },
  {
    id: 's3',
    nisn: '0081234569',
    name: 'Citra Dewi',
    gender: 'P',
    classId: 'c1',
    email: 'citra@sekolah.id',
    averageScore: 80, // passes KKM 75
    examsTakenCount: 4,
    attendanceRate: 95,
    status: 'Cukup',
    strengths: ['Geometri'],
    weaknesses: [],
    progressTrend: [75, 78, 82, 80],
    submissions: [
      {
        examId: 'ex1',
        examTitle: 'PTS Matematika',
        date: '2026-10-15',
        score: 80,
        maxScore: 100,
        percentage: 80,
        passed: true,
        timeSpentMinutes: 50,
        answers: {},
        feedback: 'Stabil',
        topicBreakdown: {
          'Aljabar': { total: 5, correct: 3 },
          'Geometri': { total: 5, correct: 4 },
        },
      },
    ],
  },
];

test('calculateClassStats correctly computes average, highest, lowest, and pass rate', () => {
  const stats = calculateClassStats(dummyStudents, 75);
  assert.equal(stats.studentCount, 3);
  assert.equal(stats.averageScore, 80); // (90+70+80)/3
  assert.equal(stats.highestScore, 90);
  assert.equal(stats.lowestScore, 70);
  assert.equal(stats.passCount, 2);
  assert.equal(stats.failCount, 1);
  assert.equal(stats.passRatePercentage, 66.7);
  assert.equal(stats.averageAttendanceRate, 95.0);
});

test('calculateTopicMastery correctly aggregates performance by topic', () => {
  const mastery = calculateTopicMastery(dummyStudents);
  const aljabar = mastery.find(m => m.topic === 'Aljabar');
  const geometri = mastery.find(m => m.topic === 'Geometri');

  assert.ok(aljabar);
  assert.ok(geometri);
  // Aljabar: 4 + 2 + 3 = 9 correct out of 15 total = 60.0%
  assert.equal(aljabar.correctCount, 9);
  assert.equal(aljabar.totalAttempts, 15);
  assert.equal(aljabar.masteryPercentage, 60.0);
  assert.equal(aljabar.status, 'Perlu Remedial');

  // Geometri: 5 + 4 + 4 = 13 correct out of 15 total = 86.7%
  assert.equal(geometri.correctCount, 13);
  assert.equal(geometri.totalAttempts, 15);
  assert.equal(geometri.masteryPercentage, 86.7);
  assert.equal(geometri.status, 'Tuntas');
});

test('categorizeStudents segments students into remedial, onTrack, and advanced', () => {
  const categories = categorizeStudents(dummyStudents, 75);
  assert.equal(categories.remedial.length, 1);
  assert.equal(categories.remedial[0].name, 'Bunga Citra');
  assert.equal(categories.onTrack.length, 1);
  assert.equal(categories.onTrack[0].name, 'Citra Dewi');
  assert.equal(categories.advanced.length, 1);
  assert.equal(categories.advanced[0].name, 'Ahmad Fauzan');
});
