"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";
import { usernameToEmail, OWNER_USERNAME } from "@/lib/admin-auth";

/**
 * Owner sign-in. Users only ever see "username" — the synthetic email
 * derived from the username is never shown in the UI or errors.
 */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const email = usernameToEmail(username);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Generic message — never reveals whether the username or the
        // password was wrong, and never mentions the internal email.
        setError("Incorrect username or password. Please try again.");
        return;
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image
            src="/logo.jpg"
            alt="Mun's Haven"
            width={72}
            height={72}
            className="rounded-full object-cover shadow"
          />
          <div className="text-center">
            <h1 className="font-display text-2xl text-espresso">
              Mun&apos;s Haven
            </h1>
            <p className="text-sm text-espresso/60">Owner dashboard sign in</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-espresso mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={OWNER_USERNAME}
              required
              className="w-full rounded-xl border border-espresso/20 bg-ivory px-4 py-2.5 text-espresso placeholder:text-espresso/30"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-espresso mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-espresso/20 bg-ivory px-4 py-2.5 text-espresso placeholder:text-espresso/30"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-espresso text-ivory font-medium py-2.5 hover:bg-espresso/90 disabled:opacity-50 transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-espresso/50 mt-6">
          Owner access only. If you&apos;ve lost your password, ask the person
          who set up the account.
        </p>
      </div>
    </div>
  );
}
