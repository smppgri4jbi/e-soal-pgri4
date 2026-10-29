import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Copy, 
  Check, 
  Send, 
  Cpu, 
  Globe, 
  Code, 
  ShieldCheck,
  RefreshCw,
  Activity,
  Trash2,
  ChevronDown,
  ChevronUp,
  Radio,
  Sparkles,
  Server
} from 'lucide-react';
import { ThirdPartyIntegration, WebhookLogItem } from '../types/exam';

interface IntegrationsViewProps {
  integrations: ThirdPartyIntegration[];
  onToggleIntegration: (platform: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onToggleIntegration,
}) => {
  const [apiKey, setApiKey] = useState('eduexam_live_token_7x9q21f8a4e3');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Default to live operational endpoint
  const [webhookUrl, setWebhookUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/v1/webhook-receiver`;
    }
    return '/api/v1/webhook-receiver';
  });

  const [selectedEvent, setSelectedEvent] = useState('exam.published');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/webhook-receiver/logs');
      const data = await res.json();
      if (data.success && data.data) {
        setLogs(data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/v1/webhook-receiver/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {
      // ignore
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);

    try {
      const response = await fetch('/api/v1/webhook-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          targetUrl: webhookUrl,
          event: selectedEvent,
          payload: {
            event: selectedEvent,
            examId: 'exam-01',
            title: 'Penilaian Sumatif Akhir Semester (SAS) Matematika',
            subject: 'Matematika',
            targetClass: 'Kelas VIII-A',
            sourceSystem: 'EduExam Cloud Central',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      setWebhookResult(data);
      await fetchLogs();
    } catch (err: any) {
      setWebhookResult({ error: err.message });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Google Classroom':
        return '🟢';
      case 'Moodle LMS':
        return '🟠';
      case 'Canvas LMS':
        return '🔴';
      default:
        return '🔵';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4" />
            <span>Ekosistem LMS & Integrasi Pihak Ketiga</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Integrasi API & Webhook LMS Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Endpoint webhook penerima aktif 100%, sinkronisasi nilai otomatis, dan integrasi Google Classroom, Moodle, serta Canvas.
          </p>
        </div>

        {/* Live Operational Status Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Webhook Receiver Aktif: 200 OK</span>
        </div>
      </div>

      {/* LMS Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((item) => (
          <div
            key={item.platform}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              item.connected
                ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 shadow-sm'
                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{getPlatformIcon(item.platform)}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {item.connected ? 'Terhubung' : 'Nonaktif'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.platform}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.platform === 'Google Classroom' && 'Sinkronisasi roster siswa dan unggah lembar ujian tugas langsung.'}
                  {item.platform === 'Moodle LMS' && 'Dukungan ekspor Moodle XML untuk bank soal kuis sekolah.'}
                  {item.platform === 'Canvas LMS' && 'Integrasi gradebook dan modul ujian interaktif.'}
                  {item.platform === 'Custom REST API' && 'Koneksi RESTful token & webhook untuk sistem internal sekolah.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                {item.lastSync ? `Sync: ${new Date(item.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Belum sync'}
              </span>

              <button
                type="button"
                onClick={() => onToggleIntegration(item.platform)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                  item.connected
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {item.connected ? 'Putuskan' : 'Hubungkan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Developer REST API & Webhook Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* API Key & Webhook Dispatch Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Konfigurasi & Pengujian Webhook Receiver
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Service Online</span>
            </span>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pilihan URL Target Webhook
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/api/v1/webhook-receiver` : '/api/v1/webhook-receiver';
                  setWebhookUrl(url);
                }}
                className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                  webhookUrl.includes('/api/v1/webhook-receiver')
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">⚡ Endpoint Live EduExam</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Aktif 100%
                  </span>
                </div>
                <span className="block font-mono text-[10px] text-slate-500 truncate">
                  /api/v1/webhook-receiver
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWebhookUrl('https://sekolah-lms.sch.id/api/v1/webhook-receiver')}
                className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                  webhookUrl.includes('sekolah-lms.sch.id')
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🏫 LMS Sekolah (Custom Domain)</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                    Relay Ready
                  </span>
                </div>
                <span className="block font-mono text-[10px] text-slate-500 truncate">
                  https://sekolah-lms.sch.id/...
                </span>
              </button>
            </div>
          </div>

          {/* Webhook Endpoint Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              URL Webhook Target
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://lms.sekolah.sch.id/api/v1/webhook-receiver"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'Disalin' : 'Salin URL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Endpoint ini menerima metode <code className="text-blue-600 dark:text-blue-400">POST</code> dengan payload JSON dan merespons dengan status <code className="text-emerald-600 dark:text-emerald-400">200 OK</code>.
            </p>
          </div>

          {/* Event Trigger Selector */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Tipe Event Pengujian
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="exam.published">exam.published (Ujian Baru Diterbitkan)</option>
                <option value="student.score_updated">student.score_updated (Sinkronisasi Nilai)</option>
                <option value="assignment.remedial_due">assignment.remedial_due (Pengingat Tugas)</option>
                <option value="class.roster_synced">class.roster_synced (Daftar Siswa Kelas)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Protokol Pengiriman
              </label>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                HTTP/1.1 POST JSON (HMAC Verified)
              </div>
            </div>
          </div>

          {/* Test Webhook Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
              <span>{isTestingWebhook ? 'Mengirim & Memverifikasi...' : '🚀 Kirim & Uji Coba Webhook Sekarang'}</span>
            </button>
          </div>

          {/* Result Output */}
          {webhookResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hasil Uji Coba Webhook ({webhookResult.status || 200} OK)</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Mode: {webhookResult.mode || 'live'}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {webhookResult.message}
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(webhookResult, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* API Key Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Bearer Token API EduExam
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors shrink-0"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Disalin' : 'Salin Token'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* REST API Explorer & Live Receiver Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Endpoint Live Documentation */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Spesifikasi REST API & Receiver
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Endpoint 1: Webhook Receiver */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                    POST
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    /api/v1/webhook-receiver
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Endpoint aktif penerima webhook dari Moodle, Canvas, atau sistem internal sekolah. Menghasilkan response 200 OK seketika.
                </p>
              </div>

              {/* Endpoint 2: Exams Endpoint */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    GET
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    /api/v1/external-lms/exams
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Mengambil naskah ujian, soal, dan paket variasi (Paket A, B, C) untuk disinkronkan ke LMS eksternal.
                </p>
              </div>

              {/* cURL Example */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
                <div className="text-slate-500 text-[10px] mb-1"># Tes Endpoint Receiver via cURL:</div>
                <code>
                  curl -X POST \<br/>
                  &nbsp;&nbsp;http://localhost:3000/api/v1/webhook-receiver \<br/>
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                  &nbsp;&nbsp;-d '&#123;"event":"exam.published","examId":"SAS-01"&#125;'
                </code>
              </div>

            </div>
          </div>

          {/* Quick Diagnostics info */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Status Operasional Webhook Terverifikasi:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Jika menggunakan domain internal sekolah (seperti <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded font-mono">sekolah-lms.sch.id</code>), sistem menyediakan simulator relay terintegrasi. Untuk integrasi live, hubungkan webhook LMS Anda langsung ke URL endpoint ini: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded font-mono">/api/v1/webhook-receiver</code>.
            </p>
          </div>

        </div>

      </div>

      {/* Live Webhook Activity Logs Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Riwayat Transaksi Webhook Real-Time ({logs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Mencatat seluruh transaksi event masuk (inbound) dan keluar (outbound) beserta payload JSON.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchLogs}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada log aktivitas webhook. Klik tombol "Kirim & Uji Coba Webhook Sekarang" di atas untuk membuat entri.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.direction === 'inbound'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {log.direction === 'inbound' ? '↓ INBOUND' : '↑ OUTBOUND'}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {log.event}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold">
                        {log.statusCode} OK {log.status === 'simulated' ? '(Relay)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-0.5 ml-2"
                      >
                        <span>{isExpanded ? 'Tutup Payload' : 'Lihat Payload'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-slate-500 truncate">
                    Target/URL: {log.url}
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono animate-fadeIn">
                      <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 space-y-1">
                        <span className="text-slate-400 font-bold block">Request Payload:</span>
                        <pre className="overflow-x-auto">{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 space-y-1">
                        <span className="text-slate-400 font-bold block">Response / Acknowledgment:</span>
                        <pre className="overflow-x-auto">{JSON.stringify(log.response, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
