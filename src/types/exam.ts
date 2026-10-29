export type Difficulty = 'Mudah' | 'Sedang' | 'Sulit' | 'HOTS';

export type QuestionType = 'multiple_choice' | 'essay' | 'short_answer' | 'matching';

export type BloomLevel = 'C1 - Mengingat' | 'C2 - Memahami' | 'C3 - Mengaplikasikan' | 'C4 - Menganalisis' | 'C5 - Mengevaluasi' | 'C6 - Mencipta';

export type KurikulumType = 'Kurikulum Merdeka' | 'Kurikulum 2013 (K-13)';

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  subject: string;
  gradeLevel: string; // e.g. "Kelas 7 SMP", "Kelas 8 SMP", "Kelas 10 SMA"
  topic: string;
  subTopic?: string;
  type: QuestionType;
  difficulty: Difficulty;
  bloomLevel?: BloomLevel;
  text: string;
  options?: QuestionOption[]; // for multiple choice
  correctAnswer: string; // e.g. "B" or string answer for essay
  explanation: string;
  rubricCriteria?: string[]; // for essay scoring
  matchingPairs?: MatchingPair[]; // for matching questions
  points: number;
  tags: string[];
  kurikulum: KurikulumType;
  source?: string; // "Bank Soal Sekolah", "AI Generator", "Asesmen Nasional"
  createdAt?: string;
}

export interface ExamVariation {
  packageCode: 'Paket A' | 'Paket B' | 'Paket C' | 'Paket D';
  title: string;
  description: string;
  questions: Question[];
  answerKeySummary: Record<number, string>; // question index -> correct answer
}

export interface ExamPackage {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  kurikulum: KurikulumType;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  examType: 'Sumatif Akhir Semester (SAS)' | 'Penilaian Harian (PH)' | 'Asesmen Tengah Semester (ATS)' | 'Try Out Ujian';
  durationMinutes: number;
  schoolName: string;
  instructions: string[];
  totalScore: number;
  status: 'draft' | 'ready' | 'published';
  variations: ExamVariation[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentExamSubmission {
  examId: string;
  examTitle: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentMinutes: number;
  answers: Record<string, string>;
  feedback: string;
  topicBreakdown: Record<string, { total: number; correct: number }>;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  averageScore: number;
  examsTakenCount: number;
  attendanceRate: number; // percentage
  status: 'Sangat Baik' | 'Perlu Pendampingan' | 'Cukup' | 'Mahir';
  strengths: string[];
  weaknesses: string[];
  progressTrend: number[]; // recent 5 scores
  submissions: StudentExamSubmission[];
}

export interface ClassGroup {
  id: string;
  name: string;
  gradeLevel: string;
  subject: string;
  academicYear: string;
  teacherName: string;
  inviteCode: string;
  studentCount: number;
  passingGradeKKM: number; // e.g. 75
  scheduleDayTime: string;
  syncedToCloud: boolean;
  students: Student[];
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'exam_schedule' | 'assignment' | 'score_ready' | 'sync_alert' | 'system';
  targetClassId?: string;
  targetClassName?: string;
  timestamp: string;
  scheduledTime?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
}

export interface ThirdPartyIntegration {
  platform: 'Google Classroom' | 'Moodle LMS' | 'Canvas LMS' | 'Webhook' | 'Custom REST API';
  connected: boolean;
  lastSync?: string;
  autoSync: boolean;
  endpointUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
}

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  url: string;
  event: string;
  status: 'success' | 'failed' | 'simulated';
  statusCode: number;
  direction: 'inbound' | 'outbound';
  payload: any;
  response: any;
}

export interface GenerateExamRequestParams {
  subject: string;
  gradeLevel: string;
  topic: string;
  kurikulum: KurikulumType;
  questionCount: number;
  questionType: QuestionType | 'mixed';
  difficulty: Difficulty | 'mixed';
  generateVariationsCount: number; // e.g. 2 for Paket A & B
  additionalNotes?: string;
}
