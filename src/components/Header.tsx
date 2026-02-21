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
  const [showScanner, setShowScanner] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    equipment: 'Equipment Registry',
    detail: 'Equipment Detail',
  };

  const handleScanResult = useCallback((code: string) => {
    setShowScanner(false);
    onScanResult?.(code);
  }, [onScanResult]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Hamburger + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => onToggleSidebar?.()}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {viewTitles[currentView] || 'Dashboard'}
            </h2>
          </div>

          {/* Right: Actions (wrap on small screens to prevent overflow) */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Scan QR Button */}
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8f5e] text-white rounded-lg text-xs font-semibold hover:from-[#e85d2c] hover:to-[#e87d4e] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
              <span className="hidden sm:inline">Scan QR</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Role Switcher (Demo Mode) */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setDemoRole('admin')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isAdmin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setDemoRole('standard')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !isAdmin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Standard
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center text-white text-sm font-semibold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Standard User'}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium ${
                        isAdmin ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAdmin ? 'Admin' : 'Standard User'}
                      </span>
                    </div>
                    <button
                      onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Sign In / Sign Up
                    </button>
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onResult={handleScanResult}
        />
      )}
    </>
  );
}

/* ─── QR Scanner Modal ─── */
function QRScannerModal({ onClose, onResult }: { onClose: () => void; onResult: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [status, setStatus] = useState<'requesting' | 'scanning' | 'error' | 'manual'>('requesting');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [detectedCode, setDetectedCode] = useState('');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStatus('scanning');
          startDetection();
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'Camera access denied. Please allow camera permissions and try again.'
              : err.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : `Camera error: ${err.message}`
          );
        }
      }
    };

    const startDetection = () => {
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const scan = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(scan);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && !cancelled) {
              const code = barcodes[0].rawValue;
              setDetectedCode(code);
              setTimeout(() => { if (!cancelled) onResult(code); }, 400);
              return;
            }
          } catch { /* ignore */ }
          animFrameRef.current = requestAnimationFrame(scan);
        };
        animFrameRef.current = requestAnimationFrame(scan);
      } else {
        setStatus('manual');
      }
    };

    if (status === 'requesting') {
      startCamera();
    }

    return () => { cancelled = true; };
  }, [onResult, status]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onResult(manualCode.trim());
    }
  };

  const handleSwitchToManual = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setStatus('manual');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e]">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm">QR Code Scanner</h3>
              <p className="text-[11px] text-white/70">Point camera at equipment QR code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-black">
          {(status === 'requesting' || status === 'scanning') && (
            <div className="relative aspect-[4/3]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#ff6b35] rounded-tl-lg" style={{ borderWidth: '3px 0 0 3px' }} />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#ff6b35] rounded-tr-lg" style={{ borderWidth: '3px 3px 0 0' }} />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#ff6b35] rounded-bl-lg" style={{ borderWidth: '0 0 3px 3px' }} />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#ff6b35] rounded-br-lg" style={{ borderWidth: '0 3px 3px 0' }} />
                  <div className="absolute left-2 right-2 h-0.5 bg-[#ff6b35] animate-scan-line" />
                </div>
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center">
                {status === 'requesting' && (
                  <span className="inline-flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Requesting camera access...
                  </span>
                )}
                {status === 'scanning' && !detectedCode && (
                  <span className="inline-flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-[#ff6b35] rounded-full animate-pulse" />
                    Scanning for QR codes...
                  </span>
                )}
                {detectedCode && (
                  <span className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Found: {detectedCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="aspect-[4/3] flex flex-col items-center justify-center bg-gray-900 text-white p-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">Camera Unavailable</p>
              <p className="text-xs text-gray-400 text-center mb-4">{errorMsg}</p>
            </div>
          )}

          {status === 'manual' && !detectedCode && (
            <div className="aspect-[4/3] flex flex-col items-center justify-center bg-gray-50 p-6 relative">
              {streamRef.current && (
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-10" playsInline muted autoPlay />
              )}
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">QR Detection Not Supported</p>
                <p className="text-xs text-gray-500 mb-1">Your browser doesn't support native QR scanning.</p>
                <p className="text-xs text-gray-400">Enter the QR code manually below.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 border-t border-gray-100">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Enter QR code (e.g., QR-TT-0001)"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition-colors disabled:opacity-40"
            >
              Go
            </button>
          </form>

          <div className="flex items-center gap-2">
            {status === 'scanning' && (
              <button
                onClick={handleSwitchToManual}
                className="flex-1 text-center px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Enter code manually instead
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 text-center px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
