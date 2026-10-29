import React, { useState } from 'react';
import { FileText, Download, Printer, X, CheckCircle2, Sliders, Layers } from 'lucide-react';
import { ExamPackage } from '../types/exam';
import { generateExamPdf } from '../utils/pdfExport';

interface PdfPreviewModalProps {
  exam: ExamPackage;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ exam, onClose }) => {
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [schoolName, setSchoolName] = useState(exam.schoolName || 'SMP NEGERI UNGGULAN 1 INDONESIA');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeLjk, setIncludeLjk] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeVariation = exam.variations[selectedVariationIdx] || exam.variations[0];

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      const doc = generateExamPdf(exam, {
        schoolName,
        packageVariationIndex: selectedVariationIdx,
        includeAnswerKey,
        includeStudentAnswerSheet: includeLjk,
      });

      const sanitizedTitle = `${exam.subject}_${exam.gradeLevel}_${activeVariation.packageCode}`.replace(/\s+/g, '_');
      doc.save(`${sanitizedTitle}_Naskah_Resmi.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDirectPrint = () => {
    try {
      const doc = generateExamPdf(exam, {
        schoolName,
        packageVariationIndex: selectedVariationIdx,
        includeAnswerKey,
        includeStudentAnswerSheet: includeLjk,
      });
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Print preview error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ekspor Naskah Ujian Resmi ke PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format standar Kemendikbudristek lengkap dengan Kop Surat, Kunci Jawaban & LJK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Settings */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Package Variation Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              Pilih Paket Variasi Soal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {exam.variations.map((v, idx) => (
                <button
                  key={v.packageCode}
                  type="button"
                  onClick={() => setSelectedVariationIdx(idx)}
                  className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                    selectedVariationIdx === idx
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{v.packageCode}</span>
                    {selectedVariationIdx === idx && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {v.questions.length} Butir Soal Teracak
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* School Name Customizer */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              Nama Sekolah (Kop Surat Ujian)
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Contoh: SMP NEGERI 1 JAKARTA"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Section Options */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              Kelengkapan Dokumen yang Dicetak
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 rounded text-blue-600"
                />
                <div>
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                    Lembar Naskah Soal Siswa (Wajib)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kop ujian resmi, petunjuk pengerjaan, soal pilihan ganda, dan uraian terformat rapi.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="mt-1 rounded text-blue-600"
                />
                <div>
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                    Lembar Kunci Jawaban & Pembahasan Lengkap (Guru)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tabel matriks kunci cepat ABCD, ulasan per butir, dan rubrik penilaian esai.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLjk}
                  onChange={(e) => setIncludeLjk(e.target.checked)}
                  className="mt-1 rounded text-blue-600"
                />
                <div>
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                    Lembar Jawaban Ujian Siswa (LJU / LJK Mandiri)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format bulatan hitam A-B-C-D-E yang siap dicetak dan dibagikan ke siswa saat ujian fisik.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
            <strong>Tips Pengajar:</strong> Untuk mencegah kecurangan saat ujian serentak, Anda dapat mengunduh <strong>Paket A</strong> dan <strong>Paket B</strong> secara bergantian untuk dibagikan pada siswa dengan posisi duduk bersebelahan.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Halaman Estimasi: <strong>{1 + (includeAnswerKey ? 1 : 0) + (includeLjk ? 1 : 0)} Halaman A4</strong>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDirectPrint}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Pratinjau</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Memproses PDF...' : 'Unduh Dokumen PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
