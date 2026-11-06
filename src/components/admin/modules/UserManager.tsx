/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { User, UserRole } from '../../../types';
import { api } from '../../../lib/api';
import { getRoleLabel, formatDateId } from '../../../lib/utils';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Lock,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Upload,
  Camera,
  RefreshCw
} from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onRefresh: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, onRefresh }) => {
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Password Reset Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(true);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [completedResetInfo, setCompletedResetInfo] = useState<{ username: string; password: string; name: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!editingUser?.email || !editingUser?.name || !editingUser?.username) {
      setErrorMsg('Nama lengkap, username, dan email wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await api.saveUser({
        ...editingUser,
        role: editingUser.role || 'panitia_spmb',
        isActive: editingUser.isActive ?? true
      });
      setEditingUser(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.role === 'super_admin' && user.username === 'admin_utama') {
      alert('Akun Super Admin Utama tidak dapat dinonaktifkan.');
      return;
    }
    const targetStatus = !user.isActive;
    const confirmMsg = targetStatus
      ? `Aktifkan kembali akun ${user.name}?`
      : `Nonaktifkan akun ${user.name}? Pengguna ini tidak akan bisa login ke dashboard.`;

    if (confirm(confirmMsg)) {
      await api.toggleUserStatus(user.id, targetStatus);
      onRefresh();
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'super_admin') {
      alert('Akun Super Admin tidak dapat dihapus demi keamanan sistem.');
      return;
    }
    if (confirm(`Hapus permanen akun "${user.name}" (${user.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      await api.deleteUser(user.id);
      onRefresh();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setPhotoUploadError('Ukuran file foto maksimal 3MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setPhotoUploadError('Format file harus berupa JPG, PNG, atau WEBP.');
      return;
    }

    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setEditingUser(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setEditingUser(prev => prev ? { ...prev, avatarUrl: '' } : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'SDIT-';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetFeedback(null);

    if (newPassword.length < 6) {
      setResetFeedback({ type: 'error', message: 'Password baru minimal 6 karakter demi keamanan akun.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetFeedback({ type: 'error', message: 'Konfirmasi password tidak cocok dengan password baru.' });
      return;
    }

    try {
      setIsResetting(true);
      await api.resetUserPassword(resetTargetUser.id, newPassword);
      setCompletedResetInfo({
        username: resetTargetUser.username,
        password: newPassword,
        name: resetTargetUser.name
      });
      setResetFeedback({
        type: 'success',
        message: `Kata sandi akun @${resetTargetUser.username} berhasil diatur ulang! Simpan dan berikan kredensial login ini kepada petugas.`
      });
      onRefresh();
    } catch (err: any) {
      setResetFeedback({ type: 'error', message: err.message || 'Gagal mengatur ulang password.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 19 · Manajemen Pengguna Internal (RBAC)
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Pengelolaan Akun Petugas Sekolah
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Akun login hanya untuk 5 peran internal: Super Admin, Admin Sekolah, Panitia SPMB, Tim Seleksi, dan Kepala Sekolah.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setEditingUser({
              name: '',
              username: '',
              email: '',
              role: 'panitia_spmb',
              jabatan: 'Anggota Panitia',
              phone: '',
              isActive: true,
              password: ''
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Akun Petugas</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F5] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama & Username</th>
                <th className="py-3 px-4">Email & WhatsApp</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Hak Akses (Role)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Terakhir Login</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#123B35] text-white font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{u.name}</span>
                        <span className="text-[11px] font-mono text-stone-500">@{u.username || u.email.split('@')[0]}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-stone-700 font-mono block text-[11px]">{u.email}</span>
                    <span className="text-stone-500 text-[11px]">{u.phone || '-'}</span>
                  </td>

                  <td className="py-3 px-4 text-stone-700 font-medium">
                    {u.jabatan || '-'}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] inline-block ${
                      u.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'admin_sekolah'
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === 'panitia_spmb'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'tim_seleksi'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        u.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Klik untuk ubah status aktif/nonaktif"
                    >
                      {u.isActive !== false ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-700" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 text-rose-700" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-stone-500 text-[11px]">
                    {u.lastLoginAt ? formatDateId(u.lastLoginAt) : u.lastLogin ? formatDateId(u.lastLogin) : 'Belum pernah'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setResetTargetUser(u);
                          setNewPassword('');
                          setConfirmPassword('');
                          setResetFeedback(null);
                        }}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="Atur Ulang / Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setErrorMsg(null);
                          setEditingUser({ ...u, password: '' });
                        }}
                        className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        title="Edit Data Akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create User Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-bold text-base text-stone-900">
                {editingUser.id ? 'Edit Akun Petugas' : 'Tambah Akun Petugas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Faisal, S.Pd"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="username_petugas"
                  value={editingUser.username || ''}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="petugas@sdit.sch.id"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">
                  Jabatan / Bagian:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Waka Kesiswaan / Panitia"
                  value={editingUser.jabatan || ''}
                  onChange={e => setEditingUser({ ...editingUser, jabatan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Peran Akses (Role):
                </label>
                <select
                  value={editingUser.role || 'panitia_spmb'}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-medium"
                >
                  <option value="super_admin">Super Admin (Akses Penuh Seluruh Sistem)</option>
                  <option value="admin_sekolah">Admin Sekolah (CMS Konten, Berita & Guru)</option>
                  <option value="panitia_spmb">Panitia SPMB (Verifikasi Dokumen & Kuota)</option>
                  <option value="tim_seleksi">Tim Seleksi (Observasi & Penilaian)</option>
                  <option value="kepala_sekolah">Kepala Sekolah (Laporan & Monitoring)</option>
                </select>
              </div>
            </div>

            {/* Foto Profil / Avatar (Device Upload with Preview, Change & Remove) */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <label className="block font-bold text-stone-900 text-xs">
                Foto Profil / Avatar Petugas
              </label>

              {photoUploadError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoUploadError}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {editingUser.avatarUrl ? (
                    <img
                      src={editingUser.avatarUrl}
                      alt="Pratinjau Foto"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400">
                      <Camera className="w-6 h-6 mb-0.5" />
                      <span className="text-[9px] font-bold">Tanpa Foto</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D5AA53]" />
                      <span>{editingUser.avatarUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </button>

                    {editingUser.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-stone-500 leading-tight">
                    Pilih file gambar langsung dari perangkat Anda (JPG, PNG, atau WEBP maks 3MB).
                  </p>
                </div>
              </div>
            </div>

            {/* Password Input with Show/Hide & Quick Generate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-stone-800">
                  {editingUser.id ? 'Password Baru (Kosongkan jika tidak diubah):' : 'Password Akun Login:'}
                  {!editingUser.id && <span className="text-rose-500">*</span>}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = generateRandomPassword();
                    setEditingUser({ ...editingUser, password: pass });
                    setShowEditPassword(true);
                  }}
                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#D5AA53]" />
                  <span>Generate Acak</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder={editingUser.id ? 'Biarkan kosong untuk mempertahankan password lama' : 'Minimal 6 karakter'}
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full p-2.5 pr-10 rounded-lg border border-stone-300 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title={showEditPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">Status Keaktifan Akun</span>
                <span className="text-[11px] text-stone-500">
                  {editingUser.isActive !== false ? 'Akun aktif dan diizinkan login.' : 'Akun nonaktif dan diblokir dari login.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.isActive !== false}
                  onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#123B35]"></div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dedicated Reset Password Modal for Super Admin */}
      {resetTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setResetTargetUser(null);
              setCompletedResetInfo(null);
              setResetFeedback(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Atur Ulang Password Petugas</h3>
                  <p className="text-[11px] text-stone-500 font-mono">@{resetTargetUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetTargetUser(null);
                  setCompletedResetInfo(null);
                  setResetFeedback(null);
                }}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If reset already completed successfully, display credentials card */}
            {completedResetInfo ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Password Baru Berhasil Diatur Ulang!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Silakan salin kredensial login berikut dan serahkan kepada <strong>{completedResetInfo.name}</strong>:
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-sans">Username Petugas</span>
                        <span className="font-bold text-stone-900">@{completedResetInfo.username}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`@${completedResetInfo.username}`, 'user_copy')}
                        className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-md border border-stone-200 hover:bg-stone-50 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'user_copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                        <span>{copiedField === 'user_copy' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-sans">Password Sementara</span>
                        <span className="font-bold text-amber-800 tracking-wider">{completedResetInfo.password}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(completedResetInfo.password, 'pass_copy')}
                        className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-md border border-stone-200 hover:bg-stone-50 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'pass_copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                        <span>{copiedField === 'pass_copy' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const fullText = `*KREDENSIAL LOGIN SISTEM SDIT INSAN CENDIKIA KALIBARU*\n\nNama Petugas: ${completedResetInfo.name}\nUsername: @${completedResetInfo.username}\nPassword Baru: ${completedResetInfo.password}\n\n*Catatan:* Demi keamanan akun, Anda akan diminta mengubah password saat pertama kali masuk ke sistem.`;
                      copyToClipboard(fullText, 'full_copy');
                    }}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedField === 'full_copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'full_copy' ? 'Format Lengkap Tersalin!' : 'Salin Format Pesan WhatsApp'}</span>
                  </button>

                  <p className="text-[10px] text-emerald-700 italic">
                    * Akun petugas ini otomatis ditandai harus mengganti kata sandi saat pertama kali login.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetTargetUser(null);
                      setCompletedResetInfo(null);
                      setResetFeedback(null);
                    }}
                    className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Tutup & Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-4">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                  <p>
                    Nama Petugas: <strong>{resetTargetUser.name}</strong>
                  </p>
                  <p>
                    Email Login: <strong className="font-mono">{resetTargetUser.email}</strong>
                  </p>
                  <p>
                    Jabatan: <strong>{resetTargetUser.jabatan || '-'}</strong>
                  </p>
                  <p className="text-amber-800 font-semibold pt-1">
                    * Password lama tidak ditampilkan demi privasi. Password baru akan langsung aktif dan dicatat di audit log.
                  </p>
                </div>

                {resetFeedback && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      resetFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{resetFeedback.message}</span>
                  </div>
                )}

                {/* Quick Generator Button */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 text-xs">Atur Password Baru:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateRandomPassword();
                      setNewPassword(generated);
                      setConfirmPassword(generated);
                      setShowResetNewPassword(true);
                      setShowResetConfirmPassword(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-[#D5AA53]" />
                    <span>Generate Password Acak</span>
                  </button>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Password Baru: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 rounded-lg border border-stone-300 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      title={showResetNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Konfirmasi Password Baru: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Ketik ulang password baru"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 rounded-lg border border-stone-300 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      title={showResetConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setResetTargetUser(null);
                      setCompletedResetInfo(null);
                      setResetFeedback(null);
                    }}
                    className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting || !newPassword}
                    className="px-5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Key className="w-4 h-4 text-[#D5AA53]" />
                    <span>{isResetting ? 'Menyimpan...' : 'Perbarui Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
