import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Shuffle, 
  Layers, 
  BookOpen, 
  Save, 
  CheckCircle,
  HelpCircle,
  Clock,
  Send,
  UploadCloud
} from 'lucide-react';
import { ExamPackage, ExamVariation, Question, Difficulty, KurikulumType, QuestionType } from '../types/exam';
import { PdfPreviewModal } from './PdfPreviewModal';
import { exportToMoodleXml, createExamVariations } from '../utils/examGenerator';

interface ExamStudioProps {
  currentExam: ExamPackage;
  onUpdateExam: (updated: ExamPackage) => void;
  onSaveToQuestionBank: (question: Question) => void;
  onSaveExamToCloud: (exam: ExamPackage) => void;
  onAssignExamToClass: (exam: ExamPackage) => void;
}

export const ExamStudio: React.FC<ExamStudioProps> = ({
  currentExam,
  onUpdateExam,
  onSaveToQuestionBank,
  onSaveExamToCloud,
  onAssignExamToClass,
}) => {
  // Generator form state
  const [subject, setSubject] = useState(currentExam.subject || 'Matematika');
  const [gradeLevel, setGradeLevel] = useState(currentExam.gradeLevel || 'Kelas 8 SMP');
  const [topic, setTopic] = useState('Teorema Pythagoras');
  const [kurikulum, setKurikulum] = useState<KurikulumType>(currentExam.kurikulum || 'Kurikulum Merdeka');
  const [difficulty, setDifficulty] = useState<Difficulty>('Sedang');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionCount, setQuestionCount] = useState(4);
  const [variationCount, setVariationCount] = useState(2);
  const [additionalNotes, setAdditionalNotes] = useState('Buatkan soal kontekstual kehidupan sehari-hari (HOTS)');

  const [speedMode, setSpeedMode] = useState<'turbo' | 'deep'>('turbo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [savedStatusMessage, setSavedStatusMessage] = useState<string | null>(null);

  const activeVariation: ExamVariation = currentExam.variations[selectedVariationIdx] || currentExam.variations[0];
  const activeQuestions: Question[] = activeVariation?.questions || [];

  const quickTopics: Record<string, string[]> = {
    'Matematika': ['Teorema Pythagoras', 'SPLDV (Sistem Persamaan)', 'Statistika & Peluang', 'Transformasi Geometri', 'Pola Bilangan'],
    'Ilmu Pengetahuan Alam (IPA)': ['Sistem Pencernaan', 'Hukum Newton & Gaya', 'Usaha & Pesawat Sederhana', 'Ekosistem Lingkungan', 'Cahaya & Alat Optik'],
    'Bahasa Indonesia': ['Teks Laporan Hasil Observasi', 'Teks Eksplanasi Fenomena', 'Teks Prosedur Kompleks', 'Unsur Intrinsik Cerpen', 'Gaya Bahasa & Majas'],
    'Bahasa Inggris': ['Recount Text: Personal Experience', 'Passive Voice in Science', 'Descriptive Text: Famous Places', 'Procedural Text: Recipes', 'Narrative Folktales'],
    'Informatika': ['Berpikir Komputasional', 'Algoritma Percabangan & Loop', 'Keamanan Data & Privasi', 'Jaringan Komputer & Internet', 'Analisis Data Spreadsheet'],
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setSavedStatusMessage(null);
    setGenerationProgress(15);
    setGenerationStage('Menghubungkan ke Gemini Flash Turbo...');

    const timer1 = setTimeout(() => {
      setGenerationProgress(55);
      setGenerationStage('Menyusun butir soal & opsi HOTS...');
    }, 400);

    const timer2 = setTimeout(() => {
      setGenerationProgress(85);
      setGenerationStage('Membuat variasi Paket A & Paket B paralel...');
    }, 900);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          gradeLevel,
          topic,
          kurikulum,
          questionCount,
          questionType,
          difficulty,
          generateVariationsCount: variationCount,
          additionalNotes,
          speedMode,
        }),
      });

      const result = await response.json();
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      if (result.success && result.variations) {
        setGenerationProgress(100);
        setGenerationStage('Selesai!');

        const updatedExam: ExamPackage = {
          ...currentExam,
          title: `Ujian ${subject} - ${topic}`,
          subject,
          gradeLevel,
          kurikulum,
          variations: result.variations,
          updatedAt: new Date().toISOString(),
        };

        onUpdateExam(updatedExam);
        setSelectedVariationIdx(0);
        setSavedStatusMessage(`⚡ Berhasil! ${result.questions.length} butir soal (${result.variations.length} paket variasi) selesai dalam ${elapsed} detik.`);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setSavedStatusMessage('Terjadi kendala saat generate soal. Silakan coba kembali.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
    }
  };

  const handleCreateAutoVariation = () => {
    if (activeQuestions.length === 0) return;
    const newVariations = createExamVariations(activeQuestions, Math.min(currentExam.variations.length + 1, 4));
    onUpdateExam({
      ...currentExam,
      variations: newVariations,
      updatedAt: new Date().toISOString(),
    });
    setSelectedVariationIdx(newVariations.length - 1);
    setSavedStatusMessage(`Berhasil membuat ${newVariations[newVariations.length - 1].packageCode} dengan urutan dan opsi unik!`);
  };

  const handleExportMoodleXml = () => {
    const xml = exportToMoodleXml(currentExam.title, activeQuestions);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentExam.subject}_${activeVariation.packageCode}_Moodle.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleQuestionTextChange = (qIndex: number, newText: string) => {
    const updatedQuestions = [...activeQuestions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], text: newText };
    updateVariationQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex: number, optKey: string, newText: string) => {
    const updatedQuestions = [...activeQuestions];
    const q = updatedQuestions[qIndex];
    if (q.options) {
      const newOpts = q.options.map(opt => (opt.key === optKey ? { ...opt, text: newText } : opt));
      updatedQuestions[qIndex] = { ...q, options: newOpts };
      updateVariationQuestions(updatedQuestions);
    }
  };

  const handleSetCorrectAnswer = (qIndex: number, key: string) => {
    const updatedQuestions = [...activeQuestions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], correctAnswer: key };
    updateVariationQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    const updatedQuestions = activeQuestions.filter((_, idx) => idx !== qIndex);
    updateVariationQuestions(updatedQuestions);
  };

  const updateVariationQuestions = (newQuestions: Question[]) => {
    const updatedVariations = [...currentExam.variations];
    const answerKeySummary: Record<number, string> = {};
    newQuestions.forEach((q, idx) => {
      answerKeySummary[idx + 1] = q.correctAnswer;
    });

    updatedVariations[selectedVariationIdx] = {
      ...activeVariation,
      questions: newQuestions,
      answerKeySummary,
    };

    onUpdateExam({
      ...currentExam,
      variations: updatedVariations,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero / Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl shadow-blue-950/20">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Exam Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Studio Pembuat Soal Ujian & Paket Variasi
          </h1>
          <p className="text-sm text-blue-200/80 mt-1 max-w-2xl">
            Rancang soal ujian berbasis AI dengan mudah, hasilkan paket anti-contek paralel (Paket A, B, C), dan cetak PDF resmi berstandar nasional dalam hitungan detik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-blue-50 font-bold text-sm shadow-md transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Ekspor PDF Resmi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveExamToCloud(currentExam);
              setSavedStatusMessage('Ujian berhasil disimpan dan disinkronkan ke Cloud Database!');
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 text-white font-medium text-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Simpan ke Cloud</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Configuration Form, Right Live Exam Paper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: AI Parameter Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Parameter Pembuatan Soal AI
              </h2>
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  const firstTopic = quickTopics[e.target.value]?.[0] || 'Topik Utama';
                  setTopic(firstTopic);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Matematika">Matematika</option>
                <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="Informatika">Informatika</option>
              </select>
            </div>

            {/* Jenjang / Kelas & Kurikulum */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Jenjang / Kelas
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Kelas 7 SMP">Kelas 7 SMP (Fase D)</option>
                  <option value="Kelas 8 SMP">Kelas 8 SMP (Fase D)</option>
                  <option value="Kelas 9 SMP">Kelas 9 SMP (Fase D)</option>
                  <option value="Kelas 10 SMA">Kelas 10 SMA (Fase E)</option>
                  <option value="Kelas 11 SMA">Kelas 11 SMA (Fase F)</option>
                  <option value="Kelas 6 SD">Kelas 6 SD (Fase C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Kurikulum
                </label>
                <select
                  value={kurikulum}
                  onChange={(e) => setKurikulum(e.target.value as KurikulumType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013 (K-13)">Kurikulum 2013 (K-13)</option>
                </select>
              </div>
            </div>

            {/* Topik / Capaian Pembelajaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Topik / Capaian Pembelajaran (CP)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Misal: Teorema Pythagoras, SPLDV, Ekosistem..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(quickTopics[subject] || []).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      topic === t
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tingkat Kesulitan & Tipe Soal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Mudah">Mudah (C1-C2)</option>
                  <option value="Sedang">Sedang (C3)</option>
                  <option value="Sulit">Sulit (C4)</option>
                  <option value="HOTS">HOTS (Analisis & Evaluasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Bentuk Soal
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="multiple_choice">Pilihan Ganda (ABCD)</option>
                  <option value="essay">Uraian / Esai dengan Rubrik</option>
                </select>
              </div>
            </div>

            {/* Jumlah Soal & Jumlah Variasi Paket */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Jumlah Butir Soal
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 w-6 text-right">
                    {questionCount}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Variasi Paket Ujian
                </label>
                <select
                  value={variationCount}
                  onChange={(e) => setVariationCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="1">1 Paket (Master Saja)</option>
                  <option value="2">2 Paket (Paket A & B)</option>
                  <option value="3">3 Paket (Paket A, B, C)</option>
                </select>
              </div>
            </div>

            {/* Catatan Tambahan Guru */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Instruksi Khusus Guru
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Contoh: Buat stimulus cerita studi kasus lingkungan atau grafik diagram..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Kecepatan AI (Speed Mode Selector) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Kecepatan Generator AI
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSpeedMode('turbo')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                    speedMode === 'turbo'
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="block font-bold text-xs">Mode Kilat (Turbo)</span>
                    <span className="block text-[10px] text-slate-500">1 - 2 Detik (Rekomendasi)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeedMode('deep')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                    speedMode === 'deep'
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-lg">🧠</span>
                  <div>
                    <span className="block font-bold text-xs">Mode Analisis HOTS</span>
                    <span className="block text-[10px] text-slate-500">Penalaran Mendalam</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Real-time Progress Bar when generating */}
            {isGenerating && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{generationStage || 'Memproses soal ujian...'}</span>
                  </span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'Sedang Merancang Soal...'
                  : speedMode === 'turbo'
                  ? '⚡ Hasilkan Soal Kilat (1-2 Detik)'
                  : 'Hasilkan Soal Otomatis dengan AI'}
              </span>
            </button>

            {savedStatusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{savedStatusMessage}</span>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Live Exam Paper & Variation Switcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Variation Tab Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mr-1">
                Paket Ujian:
              </span>
              <div className="flex items-center space-x-1.5">
                {currentExam.variations.map((v, idx) => (
                  <button
                    key={v.packageCode}
                    type="button"
                    onClick={() => setSelectedVariationIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedVariationIdx === idx
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {v.packageCode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCreateAutoVariation}
                title="Buat paket variasi baru dengan acak urutan dan opsi untuk mencegah contek"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Variasi Paralel</span>
              </button>

              <button
                type="button"
                onClick={handleExportMoodleXml}
                title="Ekspor ke format Moodle XML untuk LMS sekolah"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Moodle XML</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAssignExamToClass(currentExam);
                  setSavedStatusMessage('Ujian berhasil ditugaskan ke Kelas VIII-A! Push notifikasi telah dikirim.');
                }}
                title="Tugaskan ujian ini ke kelas siswa"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tugaskan ke Kelas</span>
              </button>
            </div>
          </div>

          {/* Exam Paper Sheet Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Indonesian Exam Paper Header (Kop Soal) */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                {currentExam.schoolName || 'SMP NEGERI UNGGULAN INDONESIA'}
              </h3>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {currentExam.examType} • TAHUN AJARAN {currentExam.academicYear}
              </div>

              {/* Sub-Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-left text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Mata Pelajaran</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentExam.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Kelas</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentExam.gradeLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Waktu</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentExam.durationMinutes} Menit</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Kode Paket</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{activeVariation.packageCode}</span>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {activeQuestions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">
                  Belum Ada Butir Soal pada Paket Ini
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Gunakan panel di sebelah kiri untuk menghasilkan soal otomatis dengan AI atau pilih dari Bank Soal Cloud.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 transition-all space-y-3"
                  >
                    {/* Question Header & Badges */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-extrabold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{q.topic}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                          {q.difficulty}
                        </span>
                        {q.bloomLevel && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px]">
                            {q.bloomLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSaveToQuestionBank(q);
                            setSavedStatusMessage(`Soal No ${idx + 1} berhasil disimpan ke Bank Soal Cloud!`);
                          }}
                          title="Simpan butir soal ini ke Bank Soal Cloud"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Hapus soal ini dari paket"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Text (Editable) */}
                    <div>
                      <textarea
                        rows={3}
                        value={q.text}
                        onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent text-sm text-slate-900 dark:text-slate-100 font-medium outline-none resize-none"
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = opt.key === q.correctAnswer;
                          return (
                            <div
                              key={opt.key}
                              className={`flex items-center space-x-2 p-2.5 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                                  : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSetCorrectAnswer(idx, opt.key)}
                                title={`Tandai ${opt.key} sebagai kunci jawaban`}
                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                }`}
                              >
                                {opt.key}
                              </button>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(idx, opt.key, e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Essay Solution & Rubric preview */}
                    {q.type === 'essay' && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          Kunci / Panduan Penilaian Guru:
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{q.correctAnswer}</p>
                        {q.rubricCriteria && (
                          <div className="pt-1 space-y-1 text-[11px] text-slate-500">
                            {q.rubricCriteria.map((rc, rIdx) => (
                              <div key={rIdx} className="flex items-center space-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>{rc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Solution Explanation Box */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-start space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Pembahasan:</strong> {q.explanation || 'Solusi terperinci.'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* PDF Export Modal */}
      {showPdfModal && (
        <PdfPreviewModal
          exam={currentExam}
          onClose={() => setShowPdfModal(false)}
        />
      )}

    </div>
  );
};
