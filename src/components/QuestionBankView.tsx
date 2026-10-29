import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Filter, 
  BookOpen, 
  CheckCircle, 
  Tag, 
  Trash2, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles,
  HelpCircle,
  Copy
} from 'lucide-react';
import { Question, Difficulty, QuestionType, KurikulumType } from '../types/exam';

interface QuestionBankViewProps {
  questions: Question[];
  onAddQuestionToBank: (q: Question) => void;
  onDeleteQuestionFromBank: (id: string) => void;
  onImportQuestionToExam: (q: Question) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onAddQuestionToBank,
  onDeleteQuestionFromBank,
  onImportQuestionToExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New question form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Matematika');
  const [newGrade, setNewGrade] = useState('Kelas 8 SMP');
  const [newTopic, setNewTopic] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Sedang');
  const [newType, setNewType] = useState<QuestionType>('multiple_choice');
  const [newText, setNewText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrect, setNewCorrect] = useState('A');
  const [newExplanation, setNewExplanation] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubject === 'all' || q.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesSearch =
      searchTerm === '' ||
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSubject && matchesDiff && matchesType && matchesSearch;
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newTopic.trim()) return;

    const newQuestion: Question = {
      id: `q-user-${Date.now()}`,
      subject: newSubject,
      gradeLevel: newGrade,
      topic: newTopic,
      type: newType,
      difficulty: newDifficulty,
      bloomLevel: 'C3 - Mengaplikasikan',
      text: newText,
      options: newType === 'multiple_choice' ? [
        { key: 'A', text: newOptA || 'Opsi A' },
        { key: 'B', text: newOptB || 'Opsi B' },
        { key: 'C', text: newOptC || 'Opsi C' },
        { key: 'D', text: newOptD || 'Opsi D' },
      ] : undefined,
      correctAnswer: newType === 'multiple_choice' ? newCorrect : 'Kunci jawaban terlampir',
      explanation: newExplanation || 'Penjelasan solusi konseptual.',
      points: 10,
      tags: [newTopic, newSubject],
      kurikulum: 'Kurikulum Merdeka',
      source: 'Pendidik / Input Manual',
      createdAt: new Date().toISOString(),
    };

    onAddQuestionToBank(newQuestion);
    setShowAddModal(false);
    resetForm();
    setStatusMessage('Butir soal berhasil ditambahkan ke Bank Soal Cloud!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const resetForm = () => {
    setNewText('');
    setNewTopic('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewExplanation('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Bank Soal Kurikulum Terverifikasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Pusat Database Soal Cloud
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kumpulan bank soal nasional, asesmen kompetensi, dan olimpiade siap pakai untuk dirangkai ke dalam lembar ujian.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Soal Baru</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari teks soal, topik, rumus..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Mata Pelajaran</option>
              <option value="Matematika">Matematika</option>
              <option value="Ilmu Pengetahuan Alam (IPA)">IPA (Fisika & Biologi)</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Bahasa Inggris">Bahasa Inggris</option>
              <option value="Informatika">Informatika</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sulit">Sulit</option>
              <option value="HOTS">HOTS</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Bentuk Soal</option>
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="essay">Uraian / Esai</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>Menampilkan <strong>{filteredQuestions.length}</strong> butir soal terindeks di cloud</span>
          {(selectedSubject !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
                setSearchTerm('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Questions Card Grid */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all space-y-3"
            >
              {/* Question Meta Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {q.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {q.gradeLevel}
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {q.topic}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    q.difficulty === 'HOTS'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : q.difficulty === 'Sulit'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {q.difficulty}
                  </span>
                  {q.source && (
                    <span className="text-slate-400 text-[10px]">
                      • Sumber: {q.source}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      onImportQuestionToExam(q);
                      setStatusMessage(`Soal "${q.topic}" berhasil dimasukkan ke naskah ujian aktif!`);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60 text-xs font-semibold transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Masukkan ke Ujian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteQuestionFromBank(q.id)}
                    title="Hapus dari database"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {q.text}
              </p>

              {/* Multiple Choice Options Preview */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2 rounded-xl border flex items-start space-x-2 ${
                        opt.key === q.correctAnswer
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'bg-slate-50/60 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        opt.key === q.correctAnswer
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle Explanation Accordion */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isExpanded ? 'Sembunyikan Pembahasan & Rubrik' : 'Lihat Kunci & Pembahasan'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                  <Tag className="w-3 h-3" />
                  <span>{q.tags.join(', ')}</span>
                </div>
              </div>

              {/* Expanded Solution Drawer */}
              {isExpanded && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-fadeIn">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Kunci Jawaban Benar: [ {q.correctAnswer} ]
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Penjelasan:</strong> {q.explanation}
                  </p>
                  {q.rubricCriteria && q.rubricCriteria.length > 0 && (
                    <div className="pt-1.5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Rubrik Penskoran:</strong>
                      {q.rubricCriteria.map((r, i) => (
                        <div key={i}>• {r}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modal: Tambah Soal Baru Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tambah Butir Soal Baru ke Bank Soal Cloud
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Mata Pelajaran</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Ilmu Pengetahuan Alam (IPA)">IPA</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Informatika">Informatika</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Jenjang / Kelas</label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Topik / Materi Pokok</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Teorema Pythagoras, SPLDV..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Tingkat Kesulitan</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                    <option value="HOTS">HOTS</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Tipe Soal</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="essay">Uraian / Esai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Teks Butir Soal Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Tuliskan stimulus narasi atau pertanyaan soal..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {newType === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">Pilihan Jawaban (A-D) & Kunci:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Opsi A"
                      value={newOptA}
                      onChange={(e) => setNewOptA(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Opsi B"
                      value={newOptB}
                      onChange={(e) => setNewOptB(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Opsi C"
                      value={newOptC}
                      onChange={(e) => setNewOptC(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Opsi D"
                      value={newOptD}
                      onChange={(e) => setNewOptD(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Kunci Benar:</span>
                    {['A', 'B', 'C', 'D'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewCorrect(key)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs ${
                          newCorrect === key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Pembahasan / Rubrik</label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Penjelasan langkah penyelesaian..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
