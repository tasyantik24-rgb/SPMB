/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, UserRole } from '../../types';
import { getRoleLabel } from '../../lib/utils';
import {
  Shield,
  UserCheck,
  RefreshCw,
  Bell,
  Menu,
  ChevronDown
} from 'lucide-react';

interface AdminHeaderProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  onRefreshData: () => void;
  onToggleMobileSidebar?: () => void;
  activeMenuTitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  onSwitchRole,
  onRefreshData,
  onToggleMobileSidebar,
  activeMenuTitle
}) => {
  const roles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin' },
    { role: 'admin_sekolah', label: 'Admin Sekolah' },
    { role: 'panitia_spmb', label: 'Panitia SPMB' },
    { role: 'tim_seleksi', label: 'Tim Seleksi' },
    { role: 'kepala_sekolah', label: 'Kepala Sekolah' }
  ];

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors shrink-0"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xs sm:text-base font-bold text-stone-900 truncate">
          {activeMenuTitle || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Role Switcher for Testing */}
        <div className="flex items-center gap-1 bg-[#F7F8F5] border border-stone-300 rounded-lg px-2 py-1 text-xs max-w-[130px] sm:max-w-none">
          <Shield className="w-3.5 h-3.5 text-[#123B35] shrink-0" />
          <span className="font-semibold text-stone-600 hidden lg:inline">Peran Aktif:</span>
          <select
            value={currentUser?.role || 'super_admin'}
            onChange={(e) => onSwitchRole(e.target.value as UserRole)}
            className="bg-transparent font-bold text-[#123B35] focus:outline-hidden cursor-pointer text-[11px] sm:text-xs truncate"
          >
            {roles.map(r => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefreshData}
          title="Sinkronkan & Muat Ulang Data"
          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-[#123B35] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left max-w-[120px] truncate">
            <p className="text-xs font-bold text-stone-900 leading-tight truncate">
              {currentUser?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-stone-500 font-medium truncate">
              {getRoleLabel(currentUser?.role || 'super_admin')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
