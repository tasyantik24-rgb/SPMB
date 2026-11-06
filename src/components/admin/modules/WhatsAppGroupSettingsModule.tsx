/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WhatsAppGroupSettings, RegistrationStatus, User } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  History,
  ToggleLeft,
  ToggleRight,
  Save,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface WhatsAppGroupSettingsModuleProps {
  currentUser: User | null;
}

const AVAILABLE_STATUSES: RegistrationStatus[] = [
  'Terverifikasi',
  'Dalam Seleksi',
  'Diterima',
  'Menunggu Daftar Ulang',
  'Selesai Daftar Ulang'
];

export const WhatsAppGroupSettingsModule: React.FC<WhatsAppGroupSettingsModuleProps> = ({
  currentUser
}) => {
  const [settings, setSettings] = useState<WhatsAppGroupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [groupLink, setGroupLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowedStatuses, setAllowedStatuses] = useState<RegistrationStatus[]>([
    'Terverifikasi',
    'Dalam Seleksi',
    'Diterima',
    'Menunggu Daftar Ulang',
    'Selesai Daftar Ulang'
  ]);
  const [infoMessage, setInfoMessage] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getWhatsAppSettings();
      setSettings(data);
      setGroupLink(data.groupLink || '');
      setIsActive(data.isActive ?? true);
      setAllowedStatuses(data.allowedStatuses || ['Terverifikasi']);
      setInfoMessage(
        data.infoMessage ||
          'Selamat, berkas ananda telah terverifikasi! Silakan bergabung ke Grup WhatsApp Resmi SPMB SDIT Insan Cendikia Kalibaru untuk koordinasi jadwal seleksi dan informasi terkini.'
      );
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat pengaturan grup WhatsApp.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleStatus = (status: RegistrationStatus) => {
    if (allowedStatuses.includes(status)) {
      if (allowedStatuses.length === 1) {
        setFeedback({ type: 'error', message: 'Minimal harus memilih satu status pendaftar.' });
        return;
      }
      setAllowedStatuses(allowedStatuses.filter(s => s !== status));
    } else {
      setAllowedStatuses([...allowedStatuses, status]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate link
    const trimmed = groupLink.trim();
    if (!trimmed.startsWith('https://chat.whatsapp.com/')) {
      setFeedback({
        type: 'error',
        message: 'Tautan harus berupa link undangan WhatsApp yang valid (diawali dengan https://chat.whatsapp.com/).'
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateWhatsAppSettings({
        groupLink: trimmed,
        isActive,
        allowedStatuses,
        infoMessage: infoMessage.trim(),
        updatedBy: currentUser?.name || 'Super Admin'
      });
      setSettings(updated);
      setFeedback({
        type: 'success',
        message: 'Pengaturan grup WhatsApp SPMB berhasil disimpan dan langsung aktif di halaman Cek Status.'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
        Memuat data pengaturan WhatsApp SPMB...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Title Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Pengaturan Khusus Super Admin
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <span>Pengaturan Grup WhatsApp SPMB</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Kelola tautan undangan resmi grup WhatsApp yang akan muncul secara otomatis bagi calon murid berstatus Terverifikasi di halaman Cek Status Pendaftaran publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}`} />
            {isActive ? 'Grup WhatsApp Aktif' : 'Grup WhatsApp Dinonaktifkan'}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div>
                <span className="font-bold text-sm text-stone-900 block">Status Fitur Grup WhatsApp</span>
                <span className="text-[11px] text-stone-500">
                  {isActive
                    ? 'Tombol gabung grup tampil pada pendaftar yang statusnya memenuhi syarat.'
                    : 'Tombol gabung grup disembunyikan dari semua pendaftar.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="cursor-pointer focus:outline-hidden"
              >
                {isActive ? (
                  <ToggleRight className="w-9 h-9 text-emerald-700 hover:text-emerald-800 transition-colors" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-stone-400 hover:text-stone-500 transition-colors" />
                )}
              </button>
            </div>

            {/* Invite Link */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Tautan Undangan Grup WhatsApp (Invite Link) <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://chat.whatsapp.com/GXYZ..."
                value={groupLink}
                onChange={e => setGroupLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Format resmi WhatsApp: <code className="bg-stone-100 px-1 py-0.5 rounded">https://chat.whatsapp.com/KodeGrup</code>
              </span>
            </div>

            {/* Allowed Statuses (Multi-select) */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Pendaftar yang Berhak Melihat Tombol Gabung Grup:
              </label>
              <p className="text-[11px] text-stone-500 mb-2">
                Pilih status pendaftar mana saja yang diizinkan untuk melihat dan bergabung ke grup WhatsApp ini.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_STATUSES.map(st => {
                  const isChecked = allowedStatuses.includes(st);
                  return (
                    <label
                      key={st}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStatus(st)}
                        className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>{st}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Info Message Box */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Pesan Instruksi / Ajakan Bergabung:
              </label>
              <textarea
                rows={3}
                value={infoMessage}
                onChange={e => setInfoMessage(e.target.value)}
                placeholder="Tuliskan pesan sambutan atau instruksi untuk orang tua calon murid..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Pesan ini tampil mendampingi tombol WhatsApp di halaman Cek Status pendaftar yang terverifikasi.
              </span>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Terakhir diubah: {settings?.updatedAt ? formatDateId(settings.updatedAt) : 'Belum pernah'}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#D5AA53]" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview & History: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D5AA53]" />
                Pratinjau di Halaman Cek Status
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                Live Preview
              </span>
            </div>

            {isActive ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Grup Resmi WhatsApp SPMB
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      {infoMessage || 'Silakan bergabung ke Grup WhatsApp Resmi SPMB...'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={groupLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Gabung Grup WhatsApp SPMB</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>

                <div className="text-[10px] text-emerald-800 text-center font-medium">
                  Tampak aktif untuk status: {allowedStatuses.join(', ')}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 text-center text-stone-500 text-xs">
                Fitur sedang berstatus <strong>Nonaktif</strong>. Banner grup tidak akan muncul bagi wali murid di halaman publik.
              </div>
            )}
          </div>

          {/* History Log */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <History className="w-4 h-4 text-stone-500" />
              <span>Riwayat Perubahan Tautan WhatsApp</span>
            </h4>

            {settings?.history && settings.history.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {settings.history.slice(-6).reverse().map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center text-stone-500">
                      <span className="font-semibold text-stone-800">{h.updatedBy || h.changedBy || 'Admin'}</span>
                      <span>{formatDateId(h.timestamp || h.changedAt || '')}</span>
                    </div>
                    <div className="font-mono text-[10px] text-stone-600 truncate">
                      {h.previousLink || '(awal)'} &rarr; {h.newLink || h.link}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 text-center py-4">
                Belum ada riwayat perubahan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
