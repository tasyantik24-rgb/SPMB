/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile, Teacher } from '../../types';
import { Building2, Award, Users, BookOpen, CheckCircle2, MapPin } from 'lucide-react';

interface ProfileSectionProps {
  schoolProfile: SchoolProfile;
  teachers: Teacher[];
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ schoolProfile, teachers }) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const filteredTeachers = selectedDivision === 'all'
    ? teachers
    : teachers.filter(t => t.division === selectedDivision);

  const divisions = ['all', 'Pimpinan', 'Guru Kelas', 'Guru Al-Qur\'an', 'Guru Bidang Studi', 'Tenaga Kependidikan'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-stone-800">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Profil Lembaga Pendidikan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Mengenal Lebih Dekat SDIT Insan Cendikia Kalibaru
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Pondasi akidah kokoh, akhlak mulia, hafalan Al-Qur'an tartil, dan kecakapan akademik berkualitas tinggi di Kalibaru Banyuwangi.
        </p>
      </div>

      {/* Identitas Sekolah Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#123B35] border-b border-stone-100 pb-3 mb-4">
          Identitas & Legalitas Sekolah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-stone-500 block">Nama Resmi:</span>
            <span className="font-bold text-stone-900">{schoolProfile.name}</span>
          </div>
          <div>
            <span className="text-stone-500 block">NPSN:</span>
            <span className="font-mono font-bold text-emerald-800">{schoolProfile.npsn}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Akreditasi:</span>
            <span className="font-bold text-stone-900">{schoolProfile.accreditation}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Jenjang Pendidikan:</span>
            <span className="font-bold text-stone-900">Sekolah Dasar (SD)</span>
          </div>
          <div className="lg:col-span-2">
            <span className="text-stone-500 block">Alamat Sekolah:</span>
            <span>{schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Yayasan Pembina:</span>
            <span className="font-semibold text-stone-900">Yayasan Bina Insan Cendikia</span>
          </div>
          <div>
            <span className="text-stone-500 block">Kontak Resmi:</span>
            <span className="font-mono">{schoolProfile.phone} / {schoolProfile.whatsapp}</span>
          </div>
        </div>
      </div>

      {/* Sejarah & Sambutan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider block">
            Kilas Perjalanan
          </span>
          <h3 className="text-2xl font-bold text-stone-900 font-serif">
            Sejarah Pendirian Sekolah
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {schoolProfile.history}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider block">
            Kepala Sekolah
          </span>
          <h3 className="text-2xl font-bold text-stone-900 font-serif">
            Sambutan Ust. H. Rahmat Hidayat, M.Pd.
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
            "{schoolProfile.headmasterGreeting}"
          </p>
        </div>
      </div>

      {/* Visi, Misi & Tujuan */}
      <div className="bg-[#123B35] text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#D5AA53] uppercase tracking-widest">
            Arah & Landasan Pendidikan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Visi dan Misi Lembaga
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center">
          <span className="text-xs text-[#D5AA53] uppercase font-bold tracking-wider block mb-2">
            Visi Sekolah
          </span>
          <blockquote className="text-base sm:text-lg font-serif font-medium leading-relaxed max-w-3xl mx-auto">
            "{schoolProfile.vision}"
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D5AA53] mb-4">
              Misi Pendidikan Sekolah:
            </h4>
            <ul className="space-y-3 text-xs text-stone-200">
              {schoolProfile.mission.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D5AA53] shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D5AA53] mb-4">
              Target Capaian Lulusan:
            </h4>
            <ul className="space-y-3 text-xs text-stone-200">
              {schoolProfile.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D5AA53] shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Dewan Guru & Tenaga Kependidikan */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Pendidik Berkompeten
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
              Data Guru & Tenaga Kependidikan
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Dipandu oleh asatidz yang amanah, berdedikasi, dan tersertifikasi di bidangnya.
            </p>
          </div>

          {/* Filter division */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {divisions.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDivision(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDivision === d
                    ? 'bg-[#123B35] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {d === 'all' ? 'Semua Divisi' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTeachers.map(tch => (
            <div key={tch.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs text-center flex flex-col justify-between">
              <div>
                <div className="w-20 h-20 rounded-full bg-[#123B35] text-[#D5AA53] flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-xs">
                  {tch.name.charAt(0)}
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                  {tch.division}
                </span>
                <h4 className="font-bold text-stone-900 text-sm">{tch.name}</h4>
                <p className="text-xs text-[#174C80] font-medium">{tch.title}</p>
                <p className="text-xs font-semibold text-stone-700 mt-1">{tch.role}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{tch.education}</p>
              </div>
              {tch.quote && (
                <p className="text-[10px] text-stone-500 italic mt-3 pt-2 border-t border-stone-100">
                  "{tch.quote}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fasilitas Sekolah */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Sarana & Prasarana
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Fasilitas Pembelajaran Modern & Asri
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Fasilitas lengkap untuk mendukung kenyamanan ibadah, studi akademik, dan kebugaran ananda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolProfile.facilities.map(fac => (
            <div key={fac.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{fac.name}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{fac.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
