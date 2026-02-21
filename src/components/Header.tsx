import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenAuth: () => void;
  currentView: string;
  onScanResult?: (qrCode: string) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ onOpenAuth, currentView, onScanResult, onToggleSidebar }: HeaderProps) {
  const { user, isAdmin, setDemoRole, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    equipment: 'Equipment Registry',
    detail: 'Equipment Detail',
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => onToggleSidebar?.()}
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-slate-100 truncate">
            {viewTitles[currentView] || 'Dashboard'}
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Scan Button */}
          <button
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-semibold transition-colors"
          >
            Scan QR
          </button>

          {/* Role Toggle */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setDemoRole('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                isAdmin
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setDemoRole('standard')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                !isAdmin
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
          </div>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:block text-sm text-slate-300">
                {user?.full_name || 'User'}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-slate-100">{user?.full_name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
