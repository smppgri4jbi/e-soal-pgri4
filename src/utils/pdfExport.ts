import { jsPDF } from 'jspdf';
import { ExamPackage, ExamVariation, Question } from '../types/exam';

export interface PdfExportOptions {
  includeAnswerKey?: boolean;
  includeStudentAnswerSheet?: boolean;
  packageVariationIndex?: number;
  schoolName?: string;
}

/**
 * Generates an official Indonesian standard examination paper PDF using jsPDF.
 */
export function generateExamPdf(exam: ExamPackage, options: PdfExportOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const variationIndex = options.packageVariationIndex ?? 0;
  const variation: ExamVariation = exam.variations[variationIndex] || exam.variations[0];
  const schoolName = options.schoolName || exam.schoolName || 'SMP NEGERI UNGGULAN INDONESIA';
  const questions: Question[] = variation?.questions || [];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);

  let currentY = margin;

  // Helper to draw standard Indonesian School Exam Header (KOP SURAT)
  const drawKopSurat = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PEMERINTAH DAERAH PROVINSI / KABUPATEN DINAS PENDIDIKAN', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFontSize(13);
    doc.text(schoolName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jl. Pendidikan No. 45, Kompleks Edukasi Terpadu | Telp: (021) 7890123 | info@sekolah.sch.id', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;

    // Double rule lines
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 1.2, pageWidth - margin, currentY + 1.2);
    currentY += 6;

    // Exam Title Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(exam.examType.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFontSize(10);
    doc.text(`TAHUN AJARAN ${exam.academicYear} - SEMESTER ${exam.semester.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // Two column metadata box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Left Column
    doc.text(`Mata Pelajaran : ${exam.subject}`, margin + 4, currentY + 6);
    doc.text(`Kelas / Fase   : ${exam.gradeLevel}`, margin + 4, currentY + 12);
    doc.text(`Kurikulum      : ${exam.kurikulum}`, margin + 4, currentY + 18);

    // Right Column
    const col2X = margin + (contentWidth / 2) + 4;
    doc.text(`Alokasi Waktu : ${exam.durationMinutes} Menit`, col2X, currentY + 6);
    doc.text(`Hari / Tanggal: Senin, 10 November 2026`, col2X, currentY + 12);

    // Package Code Badge
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`KODE SOAL: ${variation.packageCode.toUpperCase()}`, col2X, currentY + 18);
    doc.setTextColor(0, 0, 0);

    currentY += 27;

    // General Instructions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PETUNJUK UMUM:', margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const instructions = [
      '1. Periksa dan bacalah soal-soal dengan teliti sebelum Anda menjawabnya.',
      '2. Dahulukan menjawab soal-soal yang Anda anggap mudah.',
      '3. Pilihlah salah satu jawaban yang paling tepat dengan memberi tanda silang (X) atau menghitamkan bulatan.',
      '4. Periksa kembali pekerjaan Anda sebelum diserahkan kepada Pengawas Ujian.',
    ];
    instructions.forEach(inst => {
      doc.text(inst, margin + 2, currentY);
      currentY += 3.8;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;
  };

  // Draw Header on first page
  drawKopSurat();

  // Helper for page break check
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      // Draw footer on current page
      drawFooter();
      doc.addPage();
      currentY = margin;
      drawMiniHeader();
    }
  };

  const drawFooter = () => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`EduExam AI • ${exam.subject} - ${exam.gradeLevel} (${variation.packageCode})`, margin, pageHeight - 10);
    doc.text(`Halaman ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  const drawMiniHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`SOAL ${exam.examType} - ${exam.subject.toUpperCase()} (${variation.packageCode})`, margin, currentY);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 6;
  };

  // Render Questions
  questions.forEach((q, idx) => {
    const qNumber = `${idx + 1}. `;
    const qPoints = `[${q.points} Poin]`;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(qNumber, margin, currentY);

    doc.setFont('helvetica', 'normal');
    const questionTextLines = doc.splitTextToSize(q.text, contentWidth - 10);
    
    // Estimate needed space for question + options
    const needed = (questionTextLines.length * 4.5) + (q.options ? q.options.length * 5 : 15) + 6;
    checkPageBreak(needed);

    doc.text(questionTextLines, margin + 7, currentY);
    currentY += questionTextLines.length * 4.5 + 2;

    if (q.type === 'multiple_choice' && q.options) {
      doc.setFontSize(9);
      q.options.forEach(opt => {
        const optLines = doc.splitTextToSize(`${opt.key}.  ${opt.text}`, contentWidth - 14);
        checkPageBreak(optLines.length * 4.5);
        doc.text(optLines, margin + 10, currentY);
        currentY += optLines.length * 4.5 + 1;
      });
      currentY += 2;
    } else if (q.type === 'essay') {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Jawaban:', margin + 10, currentY);
      currentY += 4;
      // Dotted writing lines for student essay
      for (let l = 0; l < 3; l++) {
        doc.setLineDashPattern([1, 2], 0);
        doc.line(margin + 10, currentY, pageWidth - margin, currentY);
        doc.setLineDashPattern([], 0);
        currentY += 6;
      }
      doc.setTextColor(0, 0, 0);
    }

    currentY += 3;
  });

  drawFooter();

  // PAGE 2: Kunci Jawaban & Pembahasan (if requested or by default appended)
  if (options.includeAnswerKey !== false) {
    doc.addPage();
    currentY = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`KUNCI JAWABAN & PEMBAHASAN LENGKAP (${variation.packageCode.toUpperCase()})`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Mata Pelajaran: ${exam.subject} | Kelas: ${exam.gradeLevel} | Total Soal: ${questions.length}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // Quick Matrix Table (Summary)
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('RINGKASAN KUNCI JAWABAN CEPAT', margin + 3, currentY + 5);
    currentY += 9;

    // Draw grid of answer letters
    const perRow = 10;
    for (let r = 0; r < Math.ceil(questions.length / perRow); r++) {
      let rowText = '';
      for (let c = 0; c < perRow; c++) {
        const itemIdx = r * perRow + c;
        if (itemIdx < questions.length) {
          const q = questions[itemIdx];
          rowText += `${itemIdx + 1}.${q.correctAnswer}   `;
        }
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(rowText, margin + 4, currentY);
      currentY += 5;
    }

    currentY += 4;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PEMBAHASAN DAN RUBRIK PENILAIAN PER BUTIR SOAL:', margin, currentY);
    currentY += 6;

    questions.forEach((q, idx) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`No ${idx + 1}. Jawaban Benar: [ ${q.correctAnswer} ] - Topik: ${q.topic} (${q.difficulty})`, margin, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const explLines = doc.splitTextToSize(`Pembahasan: ${q.explanation || 'Tidak ada catatan pembahasan.'}`, contentWidth - 8);
      doc.text(explLines, margin + 4, currentY);
      currentY += explLines.length * 4 + 2;

      if (q.rubricCriteria && q.rubricCriteria.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('Rubrik:', margin + 4, currentY);
        currentY += 3.5;
        q.rubricCriteria.forEach(rc => {
          doc.text(`• ${rc}`, margin + 8, currentY);
          currentY += 3.5;
        });
      }
      currentY += 3;
    });

    drawFooter();
  }

  // PAGE 3: Lembar Jawaban Komputer (LJK) Siswa (if requested)
  if (options.includeStudentAnswerSheet !== false) {
    doc.addPage();
    currentY = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('LEMBAR JAWABAN UJIAN (LJU)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(schoolName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // Student identity form
    doc.setDrawColor(148, 163, 184);
    doc.rect(margin, currentY, contentWidth, 24);
    doc.setFontSize(9);
    doc.text('Nama Peserta  : ..............................................................', margin + 4, currentY + 6);
    doc.text('Nomor Peserta / NISN : ...............................................', margin + 4, currentY + 12);
    doc.text('Kelas / Ruang : ..............................................................', margin + 4, currentY + 18);

    doc.text(`Mata Pelajaran: ${exam.subject}`, margin + (contentWidth / 2) + 4, currentY + 6);
    doc.text(`Kode Paket    : ${variation.packageCode}`, margin + (contentWidth / 2) + 4, currentY + 12);
    doc.text('Tanda Tangan  : .......................................', margin + (contentWidth / 2) + 4, currentY + 18);

    currentY += 28;

    // Multiple Choice Bubbles grid
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('HITAMKAN SALAH SATU BULATAN SESUAI DENGAN JAWABAN ANDA:', margin, currentY);
    currentY += 6;

    const totalQuestions = Math.min(questions.length, 50);
    const columns = 2;
    const itemsPerCol = Math.ceil(totalQuestions / columns);
    const colW = contentWidth / columns;

    for (let c = 0; c < columns; c++) {
      let colY = currentY;
      const startIdx = c * itemsPerCol;
      const endIdx = Math.min(startIdx + itemsPerCol, totalQuestions);

      for (let i = startIdx; i < endIdx; i++) {
        const itemNumber = (i + 1).toString().padStart(2, '0');
        const xPos = margin + (c * colW);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${itemNumber}.`, xPos, colY + 3);

        const optionsKeys = ['A', 'B', 'C', 'D', 'E'];
        optionsKeys.forEach((optKey, oIdx) => {
          const bubbleX = xPos + 12 + (oIdx * 10);
          doc.setDrawColor(100, 116, 139);
          doc.circle(bubbleX, colY + 2, 2.8, 'S');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.text(optKey, bubbleX - 1.2, colY + 3.2);
        });

        colY += 6.5;
      }
    }

    drawFooter();
  }

  return doc;
}
