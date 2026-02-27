import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { UI } from "@/lib/ui";

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
      setTimeout(() => nav("/"), 800);
    } catch (err: any) {
      setMsg(err?.message || "Failed to update password.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${UI.shell}`}>
        <div className={`${UI.card} ${UI.cardPad}`}>
          <div className={`llt-body-sm ${UI.textMuted}`}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${UI.shell}`}>
        <div className={`${UI.card} ${UI.cardPad} max-w-md w-full`}>
          <h1 className="llt-h2">Reset link expired or invalid</h1>
          <p className={`llt-body-sm mt-2 ${UI.textMuted}`}>
            Request a new password reset email and open it immediately.
          </p>

          <a
            href="/long-line-tracker-v2/#/"
            className="inline-flex mt-4 text-sm font-medium underline underline-offset-4 text-primary hover:opacity-90"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${UI.shell}`}>
      <form onSubmit={onSubmit} className={`${UI.card} ${UI.cardPad} max-w-md w-full space-y-4`}>
        <h1 className="llt-h2">Set a new password</h1>

        {msg && (
          <div className={`text-sm rounded-lg border ${UI.divider} llt-surface-2 px-3 py-2`}>
            {msg}
          </div>
        )}

        <div>
          <label className={`block llt-label mb-1 ${UI.textSubtle}`}>New password</label>
          <input
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-lg text-sm border ${UI.input}`}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className={`block llt-label mb-1 ${UI.textSubtle}`}>Confirm new password</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-lg text-sm border ${UI.input}`}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
