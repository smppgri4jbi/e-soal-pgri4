import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamStudio } from './components/ExamStudio';
import { QuestionBankView } from './components/QuestionBankView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ClassManagement } from './components/ClassManagement';
import { IntegrationsView } from './components/IntegrationsView';
import { NotificationCenter } from './components/NotificationCenter';
import { INITIAL_QUESTIONS, INITIAL_EXAMS, INITIAL_CLASSES, INITIAL_NOTIFICATIONS, INITIAL_INTEGRATIONS } from './data/initialData';
import { ExamPackage, Question, ClassGroup, PushNotificationItem, ThirdPartyIntegration, Student } from './types/exam';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduexam_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [currentExam, setCurrentExam] = useState<ExamPackage>(INITIAL_EXAMS[0]);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [classes, setClasses] = useState<ClassGroup[]>(INITIAL_CLASSES);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(INITIAL_INTEGRATIONS);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('20:02:15 WIB');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('eduexam_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('eduexam_theme', 'light');
    }
  }, [isDark]);

  // Read initial data from server if available
  useEffect(() => {
    const fetchInitialServerData = async () => {
      try {
        const [qRes, cRes, nRes, iRes] = await Promise.all([
          fetch('/api/database/questions').then(r => r.json()).catch(() => null),
          fetch('/api/classes').then(r => r.json()).catch(() => null),
          fetch('/api/notifications').then(r => r.json()).catch(() => null),
          fetch('/api/integrations').then(r => r.json()).catch(() => null),
        ]);

        if (qRes?.success && qRes.data) setQuestions(qRes.data);
        if (cRes?.success && cRes.data) setClasses(cRes.data);
        if (nRes?.success && nRes.data) setNotifications(nRes.data);
        if (iRes?.success && iRes.data) setIntegrations(iRes.data);
      } catch (err) {
        console.warn('Using client memory store:', err);
      }
    };

    fetchInitialServerData();
  }, []);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/classes');
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSyncTime(now);
      showToast('Data tersinkronisasi sempurna dengan Cloud Server!');
    } catch (err) {
      showToast('Sinkronisasi cloud lokal aktif.');
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveToQuestionBank = async (q: Question) => {
    const exists = questions.some(item => item.id === q.id);
    if (!exists) {
      setQuestions(prev => [q, ...prev]);
      try {
        await fetch('/api/database/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q),
        });
      } catch (e) {
        // fallback memory
      }
      showToast(`Soal "${q.topic}" disimpan ke Bank Soal Cloud.`);
    } else {
      showToast('Soal sudah tersimpan di Bank Soal.');
    }
  };

  const handleDeleteQuestionFromBank = async (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    try {
      await fetch(`/api/database/questions/${id}`, { method: 'DELETE' });
    } catch (e) {
      // fallback memory
    }
    showToast('Soal dihapus dari Bank Soal Cloud.');
  };

  const handleImportQuestionToExam = (q: Question) => {
    const currentVars = [...currentExam.variations];
    const targetVar = currentVars[0];
    if (targetVar) {
      const updatedQuestions = [...targetVar.questions, { ...q, id: `imported-${Date.now()}` }];
      const answerKeySummary: Record<number, string> = {};
      updatedQuestions.forEach((item, idx) => {
        answerKeySummary[idx + 1] = item.correctAnswer;
      });

      currentVars[0] = {
        ...targetVar,
        questions: updatedQuestions,
        answerKeySummary,
      };

      setCurrentExam({
        ...currentExam,
        variations: currentVars,
        updatedAt: new Date().toISOString(),
      });

      showToast(`Soal ditambahkan ke naskah ujian ${targetVar.packageCode}!`);
      setActiveTab('studio');
    }
  };

  const handleSaveExamToCloud = async (exam: ExamPackage) => {
    setCurrentExam(exam);
    try {
      await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exam),
      });
    } catch (e) {
      // fallback
    }
    showToast('Naskah ujian dan seluruh variasi paket berhasil disimpan ke cloud!');
  };

  const handleAssignExamToClass = async (exam: ExamPackage) => {
    // Dispatch automated push notification
    const newNotif: PushNotificationItem = {
      id: `notif-assigned-${Date.now()}`,
      title: `Ujian Baru Ditugaskan: ${exam.title}`,
      message: `Jadwal ujian ${exam.subject} (${exam.gradeLevel}) telah dipublikasikan. Durasi: ${exam.durationMinutes} menit.`,
      category: 'exam_schedule',
      targetClassName: 'Kelas VIII-A',
      priority: 'high',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotif, ...prev]);

    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
    } catch (e) {
      // fallback
    }

    showToast(`Ujian berhasil ditugaskan! Push notifikasi telah dikirim ke perangkat siswa.`);
  };

  const handleAddClass = async (newClassData: Partial<ClassGroup>) => {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassData),
      });
      const data = await res.json();
      if (data.success && data.class) {
        setClasses(prev => [...prev, data.class]);
        return;
      }
    } catch (e) {
      // fallback
    }

    const fallbackClass: ClassGroup = {
      id: `class-${Date.now()}`,
      name: newClassData.name || 'Kelas Baru',
      gradeLevel: newClassData.gradeLevel || 'Kelas 8 SMP',
      subject: newClassData.subject || 'Umum',
      academicYear: '2026/2027',
      teacherName: newClassData.teacherName || 'Guru Pengampu',
      inviteCode: `EDUSMP-${Math.floor(1000 + Math.random() * 9000)}`,
      studentCount: 0,
      passingGradeKKM: newClassData.passingGradeKKM || 75,
      scheduleDayTime: newClassData.scheduleDayTime || 'Sesuai Jadwal',
      syncedToCloud: true,
      students: [],
    };
    setClasses(prev => [...prev, fallbackClass]);
  };

  const handleAddStudent = async (classId: string, studentData: Partial<Student>) => {
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (data.success && data.student) {
        setClasses(prev => prev.map(c => {
          if (c.id === classId) {
            return {
              ...c,
              studentCount: c.students.length + 1,
              students: [...c.students, data.student],
            };
          }
          return c;
        }));
        return;
      }
    } catch (e) {
      // fallback
    }

    const fallbackStudent: Student = {
      id: `std-${Date.now()}`,
      nisn: studentData.nisn || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: studentData.name || 'Nama Siswa',
      gender: studentData.gender || 'L',
      classId,
      email: `${studentData.name?.toLowerCase().replace(/\s+/g, '.')}@sekolah.id`,
      averageScore: studentData.averageScore ?? 80,
      examsTakenCount: 1,
      attendanceRate: 100,
      status: (studentData.averageScore ?? 80) >= 75 ? 'Cukup' : 'Perlu Pendampingan',
      strengths: ['Pemahaman Konsep'],
      weaknesses: [],
      progressTrend: [studentData.averageScore ?? 80],
      submissions: [],
    };

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          studentCount: c.students.length + 1,
          students: [...c.students, fallbackStudent],
        };
      }
      return c;
    }));
  };

  const handleToggleIntegration = async (platform: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.platform === platform) {
        return {
          ...item,
          connected: !item.connected,
          lastSync: new Date().toISOString(),
        };
      }
      return item;
    }));

    try {
      await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
    } catch (e) {
      // fallback
    }
  };

  const handleSendNotification = async (item: Partial<PushNotificationItem>) => {
    const newNotif: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title: item.title || 'Pengumuman Baru',
      message: item.message || '',
      category: item.category || 'exam_schedule',
      targetClassName: item.targetClassName || 'Semua Kelas',
      priority: item.priority || 'normal',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotif, ...prev]);

    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
    } catch (e) {
      // fallback
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      // fallback
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        unreadCount={unreadCount}
        isSyncing={isSyncing}
        onSyncCloud={handleSyncCloud}
        lastSyncTime={lastSyncTime}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 dark:bg-blue-600/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'studio' && (
          <ExamStudio
            currentExam={currentExam}
            onUpdateExam={setCurrentExam}
            onSaveToQuestionBank={handleSaveToQuestionBank}
            onSaveExamToCloud={handleSaveExamToCloud}
            onAssignExamToClass={handleAssignExamToClass}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankView
            questions={questions}
            onAddQuestionToBank={handleSaveToQuestionBank}
            onDeleteQuestionFromBank={handleDeleteQuestionFromBank}
            onImportQuestionToExam={handleImportQuestionToExam}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            classes={classes}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManagement
            classes={classes}
            onAddClass={handleAddClass}
            onAddStudent={handleAddStudent}
            onSyncCloud={handleSyncCloud}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsView
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            classes={classes}
            onSendNotification={handleSendNotification}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>EduExam AI</strong> • Platform Generator Soal Ujian Otomatis & Manajemen Kelas Cloud
          </div>
          <div className="flex items-center space-x-4">
            <span>Standar Kurikulum Merdeka & K-13</span>
            <span>•</span>
            <span>Sinkronisasi Multi-Device Aktif</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
