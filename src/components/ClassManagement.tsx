import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  CloudCheck, 
  Laptop, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  Key, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  Share2, 
  FileDown, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { ClassGroup, Student } from '../types/exam';

interface ClassManagementProps {
  classes: ClassGroup[];
  onAddClass: (newClass: Partial<ClassGroup>) => void;
  onAddStudent: (classId: string, studentData: Partial<Student>) => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  onAddClass,
  onAddStudent,
  onSyncCloud,
  isSyncing,
  lastSyncTime,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New Class Form State
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Kelas 8 SMP');
  const [subject, setSubject] = useState('Matematika & IPA');
  const [teacherName, setTeacherName] = useState('Budi Santoso, S.Pd.');
  const [kkm, setKkm] = useState(75);
  const [schedule, setSchedule] = useState('Senin & Rabu, 08.00 WIB');

  // New Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');
  const [studentScore, setStudentScore] = useState(82);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    onAddClass({
      name: className,
      gradeLevel,
      subject,
      teacherName,
      passingGradeKKM: kkm,
      scheduleDayTime: schedule,
    });

    setShowAddClassModal(false);
    setClassName('');
    setNotificationMsg(`Kelas "${className}" berhasil dibuat dan disinkronkan ke cloud!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !activeClass) return;

    onAddStudent(activeClass.id, {
      name: studentName,
      nisn: studentNisn || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
      gender: studentGender,
      averageScore: studentScore,
    });

    setShowAddStudentModal(false);
    setStudentName('');
    setStudentNisn('');
    setNotificationMsg(`Siswa "${studentName}" berhasil ditambahkan ke ${activeClass.name}!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Cloud Multi-Device Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Sistem Manajemen Pengajaran Berbasis Cloud</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Manajemen Rombongan Belajar & Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Sinkronisasi otomatis antar laptop pengajar, smartphone, dan tablet pengawas ruang ujian.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSyncCloud}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddClassModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Cloud Cross-Device Synchronization Monitor Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">Status Sinkronisasi Multi-Perangkat</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  Live Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pembaruan nilai dan naskah ujian langsung tersinkron ke semua perangkat terhubung.
              </p>
            </div>
          </div>

          <div className="text-xs text-right text-slate-400">
            Terakhir tersinkronisasi: <strong className="text-white">{lastSyncTime}</strong>
          </div>
        </div>

        {/* Device Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <Laptop className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-semibold block">Laptop Guru (Web App)</span>
              <span className="text-[10px] text-emerald-400">● Terhubung - Host Utama</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-semibold block">HP Android Guru / Siswa</span>
              <span className="text-[10px] text-emerald-400">● Terhubung - Push Notif Aktif</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <Tablet className="w-5 h-5 text-purple-400" />
            <div>
              <span className="font-semibold block">Tablet Pengawas Ujian</span>
              <span className="text-[10px] text-emerald-400">● Terhubung - Real-Time Monitor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Class Content: Class Selector Pills & Student Roster */}
      <div className="space-y-4">
        
        {/* Class Selection Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {classes.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border ${
                selectedClassId === c.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {c.name} ({c.studentCount} Siswa)
            </button>
          ))}
        </div>

        {/* Active Class Info Card */}
        {activeClass && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeClass.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Guru: <strong>{activeClass.teacherName}</strong></span>
                  <span>•</span>
                  <span>Mata Pelajaran: <strong>{activeClass.subject}</strong></span>
                  <span>•</span>
                  <span>Tahun Ajaran: <strong>{activeClass.academicYear}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-xs">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-500">Kode Gabung Siswa:</span>
                  <strong className="font-mono text-blue-600 dark:text-blue-400">{activeClass.inviteCode}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">
                Daftar Peserta Didik ({activeClass.students.length} Siswa)
              </h4>

              {activeClass.students.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada siswa terdaftar pada kelas ini. Klik "Tambah Siswa" untuk menambahkan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">L/P</th>
                        <th className="py-2.5 px-3">Email Belajar</th>
                        <th className="py-2.5 px-3">Rata-Rata Nilai</th>
                        <th className="py-2.5 px-3">Status Belajar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {activeClass.students.map((std, idx) => (
                        <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{std.nisn}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{std.name}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-500">{std.gender}</td>
                          <td className="py-2.5 px-3 text-slate-500">{std.email}</td>
                          <td className="py-2.5 px-3 font-extrabold text-blue-600 dark:text-blue-400">
                            {std.averageScore}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              std.averageScore >= activeClass.passingGradeKKM
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                              {std.averageScore >= activeClass.passingGradeKKM ? 'Tuntas KKM' : 'Perlu Remedial'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modal: Tambah Kelas Baru */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Buat Rombongan Belajar (Kelas) Baru
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kelas VIII-C"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jenjang / Fase</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Kelas 7 SMP">Kelas 7 SMP</option>
                  <option value="Kelas 8 SMP">Kelas 8 SMP</option>
                  <option value="Kelas 9 SMP">Kelas 9 SMP</option>
                  <option value="Kelas 10 SMA">Kelas 10 SMA</option>
                  <option value="Kelas 11 SMA">Kelas 11 SMA</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Siswa Baru */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tambah Siswa ke {activeClass.name}
            </h3>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Rian Ramadhan"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nomor Induk Siswa Nasional (NISN)</label>
                <input
                  type="text"
                  placeholder="Contoh: 0081234567"
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jenis Kelamin</label>
                  <select
                    value={studentGender}
                    onChange={(e) => setStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nilai Awal (Baseline)</label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={studentScore}
                    onChange={(e) => setStudentScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
