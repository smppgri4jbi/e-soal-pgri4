import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  UserCheck, 
  FileSpreadsheet, 
  BookOpen, 
  X,
  Target,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ClassGroup, Student } from '../types/exam';
import { calculateClassStats, calculateTopicMastery, categorizeStudents } from '../utils/analytics';

interface AnalyticsDashboardProps {
  classes: ClassGroup[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ classes }) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [kkm, setKkm] = useState(75);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const students = activeClass?.students || [];

  const stats = calculateClassStats(students, kkm);
  const topicMastery = calculateTopicMastery(students);
  const categories = categorizeStudents(students, kkm);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Controls & Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Real-Time Learning Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Dasbor Analitik Performa & Progres Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Laporan kemajuan individual, peta penguasaan materi, dan deteksi dini siswa yang membutuhkan remedial.
          </p>
        </div>

        {/* Controls: Class Selector & KKM Setting */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Pilih Rombongan Belajar
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Batas KKM
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="50"
                max="95"
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-16 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500">Poin</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Rata-Rata Kelas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Rata-Rata Nilai</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.averageScore}
          </div>
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.averageScore >= kkm ? '✓ Di atas KKM' : '⚠ Di bawah KKM'}
            </span>
            <span>(KKM: {kkm})</span>
          </div>
        </div>

        {/* Tingkat Ketuntasan (Pass Rate) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Tingkat Ketuntasan</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.passRatePercentage}%
          </div>
          <div className="text-xs text-slate-500">
            <strong>{stats.passCount}</strong> tuntas • <strong>{stats.failCount}</strong> perlu remedial
          </div>
        </div>

        {/* Rentang Nilai (Tertinggi & Terendah) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Rentang Skor</span>
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.lowestScore} - {stats.highestScore}
          </div>
          <div className="text-xs text-slate-500">
            Standar Deviasi: <strong>±{stats.standardDeviation}</strong>
          </div>
        </div>

        {/* Partisipasi & Kehadiran */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Kehadiran Ujian</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.averageAttendanceRate}%
          </div>
          <div className="text-xs text-slate-500">
            Total {students.length} peserta terdaftar
          </div>
        </div>

      </div>

      {/* Middle Row: Topic Mastery Radar / Bar Breakdown & Intervention Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Topic Mastery Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Peta Penguasaan Materi (Topic Mastery Rate)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Analisis Butir Soal</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {topicMastery.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada data penguasaan materi dari ujian ini.
              </div>
            ) : (
              topicMastery.map((tm) => (
                <div key={tm.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{tm.topic}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tm.status === 'Perlu Remedial'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : tm.status === 'Sedang'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {tm.status}
                      </span>
                      <span className="text-slate-900 dark:text-white font-extrabold w-12 text-right">
                        {tm.masteryPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tm.masteryPercentage < 65
                          ? 'bg-rose-500'
                          : tm.masteryPercentage < 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${tm.masteryPercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Pedagogical Recommendations & Remedial Alert (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Rekomendasi Tindak Lanjut Guru (AI)</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            {categories.remedial.length > 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{categories.remedial.length} Siswa Memerlukan Program Remedial:</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  {categories.remedial.map(s => s.name).join(', ')}. Fokus bimbingan pada pemodelan soal cerita SPLDV dan rumus dasar Pythagoras.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                Seluruh siswa telah mencapai standar ketuntasan minimal (KKM)!
              </div>
            )}

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Program Pengayaan ({categories.advanced.length} Siswa Mahir):</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Siswa dengan capaian &gt;90 ({categories.advanced.map(s => s.name).slice(0, 3).join(', ')}) direkomendasikan diberi bank soal HOTS level Olimpiade Sains & Penalaran Matematika.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Real-Time Student Roster Progress Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Laporan Kemajuan Real-Time Per Siswa ({activeClass.name})
            </h3>
            <p className="text-xs text-slate-500">
              Klik nama siswa untuk melihat kartu laporan capaian kompetensi dan riwayat jawaban lengkap.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">NISN</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3">Rata-Rata Nilai</th>
                <th className="py-3 px-3">Tren Nilai (5 Ujian)</th>
                <th className="py-3 px-3">Status Capaian</th>
                <th className="py-3 px-3">Kehadiran</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {students.map((student, idx) => {
                const isPassing = student.averageScore >= kkm;
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{student.nisn}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-extrabold text-sm ${isPassing ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {student.averageScore}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {/* Sparkline dots */}
                      <div className="flex items-center space-x-1">
                        {student.progressTrend.map((score, sIdx) => (
                          <div
                            key={sIdx}
                            title={`Ujian ${sIdx + 1}: ${score}`}
                            className={`w-2 h-5 rounded-sm ${
                              score >= 85
                                ? 'bg-emerald-500'
                                : score >= kkm
                                ? 'bg-blue-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        student.status === 'Mahir'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : student.status === 'Perlu Pendampingan'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {student.attendanceRate}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-semibold"
                      >
                        Buka Rapor
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Report Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Student Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NISN: {selectedStudent.nisn} • {activeClass.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                aria-label="Tutup"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Stats Summary */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Rata-Rata</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {selectedStudent.averageScore}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Status KKM</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedStudent.averageScore >= kkm ? 'Tuntas' : 'Perlu Remedial'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Kehadiran</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedStudent.attendanceRate}%
                </span>
              </div>
            </div>

            {/* Strengths & Competency Gaps */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kekuatan Materi (Strengths):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.strengths.length > 0 ? (
                    selectedStudent.strengths.map(st => (
                      <span key={st} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-[11px]">
                        ✓ {st}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Belum terdata</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Materi yang Perlu Dikuatkan (Gaps):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.weaknesses.length > 0 ? (
                    selectedStudent.weaknesses.map(w => (
                      <span key={w} className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold text-[11px]">
                        ⚠ {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-600 font-medium">Tidak ada kelemahan signifikan</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submissions History */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Riwayat Pengerjaan Ujian Terakhir:
              </span>
              {selectedStudent.submissions.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 dark:text-white">{sub.examTitle}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{sub.score} / {sub.maxScore}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    <strong>Catatan Guru:</strong> {sub.feedback}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Tutup Kartu Rapor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
