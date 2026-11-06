/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Teacher } from '../../../types';
import { api } from '../../../lib/api';
import { UserCheck, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface TeacherManagerProps {
  teachers: Teacher[];
  onRefresh: () => void;
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({ teachers, onRefresh }) => {
  const [editingTeacher, setEditingTeacher] = useState<Partial<Teacher> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher?.name || !editingTeacher?.role) return;
    setIsSaving(true);
    try {
      await api.saveTeacher(editingTeacher);
      setEditingTeacher(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data guru/staf ini?')) return;
    await api.deleteTeacher(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 10 · Tenaga Pendidik & Kependidikan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Dewan Guru & Asatidz
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Kelola data guru kelas, asatidz tahfidz Al-Qur'an, guru bidang studi, dan staf tata usaha.
          </p>
        </div>

        <button
          onClick={() => setEditingTeacher({
            name: '',
            title: 'S.Pd.',
            role: 'Guru Kelas',
            division: 'Guru Kelas',
            education: 'S1 PGSD',
            quote: '',
            order: teachers.length + 1
          })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Guru Baru</span>
        </button>
      </div>

      {/* Grid of Teachers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teachers.map(tch => (
          <div key={tch.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                  {tch.division}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Urutan #{tch.order}</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{tch.name}</h4>
              <p className="text-emerald-800 font-medium text-[11px]">{tch.title}</p>
              <p className="text-stone-600 mt-1 font-semibold">{tch.role}</p>
              <p className="text-stone-500 text-[11px] mt-0.5">{tch.education}</p>
              {tch.quote && (
                <p className="text-stone-500 text-[10px] italic mt-2 border-t border-stone-100 pt-1">
                  "{tch.quote}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-stone-100">
              <button
                onClick={() => setEditingTeacher(tch)}
                className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-50 rounded"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(tch.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {editingTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTeacher(null);
          }}
        >
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="font-bold text-base text-stone-900">
                {editingTeacher.id ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button type="button" onClick={() => setEditingTeacher(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Nama Lengkap:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ust. Hendra Wijaya"
                value={editingTeacher.name || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium mb-1">Gelar Akademik:</label>
                <input
                  type="text"
                  placeholder="S.Pd.I / M.Pd"
                  value={editingTeacher.title || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Divisi:</label>
                <select
                  value={editingTeacher.division || 'Guru Kelas'}
                  onChange={e => setEditingTeacher({ ...editingTeacher, division: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Pimpinan">Pimpinan</option>
                  <option value="Guru Kelas">Guru Kelas</option>
                  <option value="Guru Al-Qur'an">Guru Al-Qur'an</option>
                  <option value="Guru Bidang Studi">Guru Bidang Studi</option>
                  <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Jabatan / Amanah Tugas:</label>
              <input
                type="text"
                required
                placeholder="Wali Kelas 1 / Koordinator Tahfidz"
                value={editingTeacher.role || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, role: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Pendidikan & Institusi:</label>
              <input
                type="text"
                placeholder="S1 PGSD - Universitas Jember"
                value={editingTeacher.education || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, education: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Motto Mengajar:</label>
              <input
                type="text"
                placeholder="Mendidik dengan teladan..."
                value={editingTeacher.quote || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, quote: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#123B35] text-white font-bold rounded-lg hover:bg-[#1a544b]"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
