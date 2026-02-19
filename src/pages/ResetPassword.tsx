import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase recovery links often arrive with tokens in the URL fragment.
    // Supabase client will parse and set session automatically when the app loads.
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setHasSession(!!data.session);
      } catch {
        setHasSession(false);
      } finally {
        setReady(true);
      }
    };
    init();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!pw1 || pw1.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setMsg("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      setMsg("Password updated. You can now sign in.");
      // send them to home after a moment
      setTimeout(() => nav("/"), 800);
    } catch (err: any) {
      setMsg(err?.message || "Failed to update password.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading…</div>;
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900">Reset link expired or invalid</h1>
          <p className="text-sm text-gray-600 mt-2">
            Request a new password reset email and open it immediately.
          </p>
          <a
            href="/long-line-tracker-v2/#/"
            className="inline-block mt-4 text-sm font-medium text-[#1e3a5f] underline"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] p-6">
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Set a new password</h1>

        {msg && (
          <div className="text-sm rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800">
            {msg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            placeholder="Repeat password"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition-colors disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
