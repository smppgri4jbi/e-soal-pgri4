import { Student } from '../types/exam';

export interface ClassStatistics {
  studentCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  passCount: number;
  failCount: number;
  passRatePercentage: number;
  averageAttendanceRate: number;
}

export interface TopicMastery {
  topic: string;
  totalAttempts: number;
  correctCount: number;
  masteryPercentage: number;
  status: 'Perlu Remedial' | 'Sedang' | 'Tuntas' | 'Sangat Baik';
}

export interface StudentCategorySummary {
  remedial: Student[];
  onTrack: Student[];
  advanced: Student[];
}

/**
 * Calculates summary statistics for a class of students based on their latest scores.
 */
export function calculateClassStats(students: Student[], kkmThreshold: number = 75): ClassStatistics {
  if (!students || students.length === 0) {
    return {
      studentCount: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      standardDeviation: 0,
      passCount: 0,
      failCount: 0,
      passRatePercentage: 0,
      averageAttendanceRate: 0,
    };
  }

  const scores = students.map(s => s.averageScore || 0);
  const totalScore = scores.reduce((acc, score) => acc + score, 0);
  const avg = Number((totalScore / students.length).toFixed(1));
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  // Standard deviation
  const variance = scores.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / students.length;
  const stdDev = Number(Math.sqrt(variance).toFixed(2));

  let passCount = 0;
  let failCount = 0;
  let totalAttendance = 0;

  students.forEach(s => {
    if (s.averageScore >= kkmThreshold) {
      passCount++;
    } else {
      failCount++;
    }
    totalAttendance += s.attendanceRate || 0;
  });

  const passRate = Number(((passCount / students.length) * 100).toFixed(1));
  const avgAttendance = Number((totalAttendance / students.length).toFixed(1));

  return {
    studentCount: students.length,
    averageScore: avg,
    highestScore: highest,
    lowestScore: lowest,
    standardDeviation: stdDev,
    passCount,
    failCount,
    passRatePercentage: passRate,
    averageAttendanceRate: avgAttendance,
  };
}

/**
 * Aggregates topic breakdown across all student submissions.
 */
export function calculateTopicMastery(students: Student[]): TopicMastery[] {
  const topicMap: Record<string, { total: number; correct: number }> = {};

  students.forEach(student => {
    student.submissions.forEach(sub => {
      if (sub.topicBreakdown) {
        Object.entries(sub.topicBreakdown).forEach(([topic, data]) => {
          if (!topicMap[topic]) {
            topicMap[topic] = { total: 0, correct: 0 };
          }
          topicMap[topic].total += data.total;
          topicMap[topic].correct += data.correct;
        });
      }
    });
  });

  return Object.entries(topicMap).map(([topic, data]) => {
    const pct = data.total > 0 ? Number(((data.correct / data.total) * 100).toFixed(1)) : 0;
    let status: TopicMastery['status'] = 'Sedang';
    if (pct < 65) status = 'Perlu Remedial';
    else if (pct < 78) status = 'Sedang';
    else if (pct < 88) status = 'Tuntas';
    else status = 'Sangat Baik';

    return {
      topic,
      totalAttempts: data.total,
      correctCount: data.correct,
      masteryPercentage: pct,
      status,
    };
  }).sort((a, b) => a.masteryPercentage - b.masteryPercentage);
}

/**
 * Groups students into remedial (< KKM), on track (KKM..88), and advanced (>88).
 */
export function categorizeStudents(students: Student[], kkmThreshold: number = 75): StudentCategorySummary {
  const remedial: Student[] = [];
  const onTrack: Student[] = [];
  const advanced: Student[] = [];

  students.forEach(student => {
    if (student.averageScore < kkmThreshold) {
      remedial.push(student);
    } else if (student.averageScore >= 88) {
      advanced.push(student);
    } else {
      onTrack.push(student);
    }
  });

  return { remedial, onTrack, advanced };
}
