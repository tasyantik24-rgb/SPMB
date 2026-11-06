/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, SchoolProfile } from '../../types';
import { getRoleLabel } from '../../lib/utils';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export type PublicPage = 
  | 'beranda'
  | 'profil'
  | 'program'
  | 'ekstrakurikuler'
  | 'galeri'
  | 'prestasi'
  | 'berita'
  | 'spmb'
  | 'cek-status'
  | 'kontak'
  | 'wizard'
  | 'portal';

interface NavbarProps {
  currentPage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onSwitchRole?: (role: any) => void;
  onGoToDashboard: () => void;
  onLogout: () => void;
  schoolProfile: SchoolProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenLoginModal,
  onGoToDashboard,
  onLogout,
  schoolProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const branding = schoolProfile.branding;
  const logoUrl = branding?.navbarLogoUrl || branding?.mainLogoUrl;
  const showText = branding ? branding.showSchoolNameNextToLogo !== false : true;
  const scale = branding?.logoScale ? branding.logoScale / 100 : 1;

  const navLinks: { key: PublicPage; label: string; highlight?: boolean }[] = [
    { key: 'beranda', label: 'Beranda' },
    { key: 'profil', label: 'Profil' },
    { key: 'program', label: 'Program Unggulan' },
    { key: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
    { key: 'galeri', label: 'Galeri' },
    { key: 'prestasi', label: 'Prestasi' },
    { key: 'berita', label: 'Berita' },
    { key: 'spmb', label: 'SPMB' },
    { key: 'cek-status', label: 'Cek Status Pendaftaran', highlight: true },
    { key: 'kontak', label: 'Kontak' },
  ];

  const isStaff = Boolean(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-3 text-left shrink-0 cursor-pointer"
          >
            {logoUrl ? (
              <div
                className="transition-transform duration-150 flex items-center justify-center shrink-0"
                style={{ transform: `scale(${scale})` }}
              >
                <img
                  src={logoUrl}
                  alt={schoolProfile.name}
                  className="h-10 sm:h-12 w-auto max-w-[140px] object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#123B35] flex items-center justify-center text-white shadow-xs shrink-0">
                <span className="font-serif font-black text-sm text-[#D5AA53]">IC</span>
              </div>
            )}

            {showText && (
              <div>
                <span className="font-extrabold text-sm sm:text-base text-[#123B35] tracking-tight block leading-tight">
                  {schoolProfile.name || 'SDIT INSAN CENDIKIA KALIBARU'}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#174C80] uppercase block">
                  Kalibaru · Banyuwangi
                </span>
              </div>
            )}
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-xs font-semibold text-stone-600">
            {navLinks.map(link => {
              const active = currentPage === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => onNavigate(link.key)}
                  className={`transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'text-[#123B35] font-bold border-b-2 border-[#123B35] py-1'
                      : link.highlight
                      ? 'text-[#123B35] font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs'
                      : 'text-stone-600 hover:text-[#123B35] py-1'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Login */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* If logged in as staff: Dashboard button */}
            {isStaff ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToDashboard}
                  className="px-3.5 py-2 bg-[#174C80] hover:bg-[#2065AA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#D5AA53]" />
                  <span>Dashboard {getRoleLabel(currentUser!.role)}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Keluar dari Akun Petugas"
                  className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Main Public Action: Daftar SPMB Online */}
                <button
                  onClick={() => onNavigate('wizard')}
                  className="px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Daftar SPMB Online</span>
                </button>

                {/* Subtle, small Login Admin button */}
                <button
                  onClick={onOpenLoginModal}
                  className="px-2.5 py-1.5 text-stone-600 hover:text-[#123B35] hover:bg-stone-100 rounded-lg text-[11px] font-semibold border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Login Khusus Petugas Internal Sekolah"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-500" />
                  <span>Login Admin</span>
                </button>
              </>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map(link => (
            <button
              key={link.key}
              onClick={() => {
                onNavigate(link.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                currentPage === link.key
                  ? 'bg-emerald-50 text-[#123B35] font-bold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('wizard');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-[#123B35] text-white text-xs font-bold rounded-lg text-center"
            >
              Mulai Pendaftaran SPMB Online
            </button>

            {isStaff && (
              <button
                onClick={() => {
                  onGoToDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-[#174C80] text-white text-xs font-bold rounded-lg text-center"
              >
                Masuk Dashboard Admin (20 Menu)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
