import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UI } from '@/lib/ui';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, error, clearError, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'standard' as 'admin' | 'standard',
  });
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!form.email || !form.password) {
      setLocalError('Email and password are required');
      return;
    }

    if (mode === 'signup' && !form.fullName) {
      setLocalError('Full name is required');
      return;
    }

    if (mode === 'signin') {
      await signIn(form.email, form.password);
    } else {
      await signUp(form.email, form.password, form.fullName, form.role);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${UI.card} w-full max-w-md overflow-hidden`}>
        <div className="px-6 py-5 bg-slate-900/60 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-sm text-white/70 mt-0.5">
                {mode === 'signin' ? 'Sign in to your account' : 'Set up your new account'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {displayError}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="John Smith"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none ${UI.input}`}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none ${UI.input}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Enter password"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none ${UI.input}`}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none ${UI.input}`}
              >
                <option value="standard">Standard User (Read-only)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-amber-500/90 text-slate-950 rounded-lg text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); clearError(); setLocalError(''); }}
              className="text- font-medium hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}



