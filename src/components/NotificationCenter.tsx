import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  CheckCheck, 
  Smartphone, 
  Volume2, 
  Sparkles,
  Info
} from 'lucide-react';
import { PushNotificationItem, ClassGroup } from '../types/exam';

interface NotificationCenterProps {
  notifications: PushNotificationItem[];
  classes: ClassGroup[];
  onSendNotification: (item: Partial<PushNotificationItem>) => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  classes,
  onSendNotification,
  onMarkAsRead,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<PushNotificationItem['category']>('exam_schedule');
  const [targetClass, setTargetClass] = useState('Semua Kelas');
  const [priority, setPriority] = useState<PushNotificationItem['priority']>('normal');
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const handleRequestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('EduExam AI - Notifikasi Push Aktif', {
          body: 'Perangkat Anda kini terhubung untuk menerima jadwal ujian dan pembaruan tugas secara instan!',
        });
        setPushStatus('Izin push notifikasi browser berhasil diaktifkan!');
      } else {
        setPushStatus('Izin notifikasi ditolak oleh peramban web.');
      }
    } else {
      setPushStatus('Peramban tidak mendukung Web Push Notifications.');
    }
    setTimeout(() => setPushStatus(null), 4000);
  };

  const handleTestInstantPush = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 EduExam AI: Jadwal Ujian Dimulai', {
        body: 'Pengingat: Penilaian Sumatif Matematika Kelas VIII-A dimulai besok pukul 08.00 WIB.',
      });
    }
    onSendNotification({
      title: '🔔 Uji Coba Push Notifikasi Real-Time',
      message: 'Notifikasi berhasil dikirim ke seluruh perangkat siswa dan orang tua murid.',
      category: 'exam_schedule',
      targetClassName: 'Semua Siswa',
      priority: 'high',
    });
    setPushStatus('Push notifikasi berhasil dikirimkan ke perangkat!');
    setTimeout(() => setPushStatus(null), 4000);
  };

  const handleSubmitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onSendNotification({
      title,
      message,
      category,
      targetClassName: targetClass,
      priority,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`EduExam AI: ${title}`, {
        body: message,
      });
    }

    setTitle('');
    setMessage('');
    setPushStatus(`Pesan siaran berhasil dikirimkan ke ${targetClass}!`);
    setTimeout(() => setPushStatus(null), 4000);
  };

  const getCategoryBadge = (cat: PushNotificationItem['category']) => {
    switch (cat) {
      case 'exam_schedule':
        return { label: 'Jadwal Ujian', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'assignment':
        return { label: 'Tugas / Remedial', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      case 'score_ready':
        return { label: 'Hasil Nilai', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      default:
        return { label: 'Sistem', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Pusat Notifikasi Push & Siaran Jadwal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Pemberitahuan Tugas & Jadwal Ujian
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kirimkan pembaruan jadwal ujian, batas remedial tugas, dan hasil nilai ke seluruh perangkat siswa & wali murid secara instan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRequestPushPermission}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Aktifkan Push Browser</span>
          </button>

          <button
            type="button"
            onClick={handleTestInstantPush}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tes Kirim Push Notif</span>
          </button>
        </div>
      </div>

      {pushStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{pushStatus}</span>
        </div>
      )}

      {/* Grid: Broadcast Form (5 cols) & History List (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Broadcast Sender Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Kirim Notifikasi Push Baru
            </h3>
          </div>

          <form onSubmit={handleSubmitBroadcast} className="space-y-4 text-xs">
            
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kategori Notifikasi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="exam_schedule">Pembaruan Jadwal Ujian</option>
                <option value="assignment">Tenggat Waktu / Remedial Tugas</option>
                <option value="score_ready">Publikasi Hasil Nilai</option>
                <option value="system">Pengumuman Sekolah</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Penerima
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Semua Kelas">Semua Kelas & Siswa</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="Siswa Remedial Saja">Hanya Siswa Peserta Remedial</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tingkat Urgensi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl font-bold uppercase text-[10px] border transition-all ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : p === 'high'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {p === 'urgent' ? 'Mendesak' : p === 'high' ? 'Penting' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Judul Notifikasi
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Perubahan Jadwal SAS Matematika"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Isi Pesan Notifikasi (Maks 150 Karakter)
              </label>
              <textarea
                required
                rows={3}
                maxLength={180}
                placeholder="Tuliskan instruksi atau rincian tanggal, ruang, atau batas pengumpulan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Siarkan Notifikasi Push Sekarang</span>
            </button>

          </form>
        </div>

        {/* Notification History List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Riwayat Notifikasi Push ({notifications.length})
            </h3>
            <span className="text-xs text-slate-500">Tersinkronisasi ke Perangkat Siswa</span>
          </div>

          <div className="space-y-3">
            {notifications.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    item.isRead
                      ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {item.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] uppercase animate-pulse">
                          Mendesak
                        </span>
                      )}
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Target: <strong>{item.targetClassName || 'Semua'}</strong>
                      </span>
                    </div>

                    <span className="text-slate-400 text-[10px]">
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Terkirim ke peramban & HP siswa</span>
                    </span>

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(item.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
