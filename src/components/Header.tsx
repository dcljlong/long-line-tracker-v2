import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UI } from "@/lib/ui";

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
    dashboard: "Dashboard",
    equipment: "Equipment Registry",
    detail: "Equipment Detail",
  };

  return (
    <header className="sticky top-0 z-20 llt-nav-shell">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => onToggleSidebar?.()}
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-input llt-surface-2 p-2 text-foreground/80 llt-nav-item"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg font-semibold truncate">
            {viewTitles[currentView] || "Dashboard"}
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Scan Button (wire-up later) */}
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-opacity"
            onClick={() => { /* placeholder: scanner route/modal can be wired here */ }}
          >
            Scan QR
          </button>

          {/* Role Toggle (demo) */}
          <div className="hidden md:flex items-center rounded-lg p-0.5 border border-input bg-card/60">
            <button
              type="button"
              onClick={() => setDemoRole("admin")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isAdmin ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoRole("standard")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                !isAdmin ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard
            </button>
          </div>

          {/* User */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 llt-nav-item"
            >
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <span className="hidden lg:block text-sm text-muted-foreground">
                {user?.full_name || "User"}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 z-40 overflow-hidden rounded-xl border border-border/60 llt-overlay-panel text-popover-foreground ">
                  <div className={`px-4 py-3 border-b ${UI.divider}`}>
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm llt-nav-item"
                  >
                    Account
                  </button>

                  <button
                    type="button"
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
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


