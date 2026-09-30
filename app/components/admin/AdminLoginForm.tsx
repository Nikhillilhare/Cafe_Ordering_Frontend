"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

type LoginResponse = {
  error?: string;
};

export default function AdminLoginForm() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | LoginResponse
        | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to sign in. Please try again.",
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 28,
              scale: 0.97,
              filter: "blur(8px)",
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.15,
          duration: 0.4,
        }}
        className="mb-8"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Secure administration
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Sign in to manage your cafe, menu, orders and payments.
        </p>
      </motion.div>

      <div className="space-y-5">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.24,
            duration: 0.4,
          }}
        >
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            Email address
          </label>

          <div className="group relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-indigo-400" />

            <input
              id="admin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@yourcafe.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-4 text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-indigo-400/40 focus:-translate-y-0.5 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.31,
            duration: 0.4,
          }}
        >
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            Password
          </label>

          <div className="group relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-indigo-400" />

            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-12 text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-indigo-400/40 focus:-translate-y-0.5 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={error}
            role="alert"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }
            }
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -8,
            }}
            transition={{
              duration: 0.25,
            }}
            className="mt-5 overflow-hidden rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={
          reduceMotion || isSubmitting
            ? undefined
            : {
                y: -2,
                scale: 1.01,
              }
        }
        whileTap={
          reduceMotion || isSubmitting
            ? undefined
            : {
                scale: 0.98,
              }
        }
        className="group relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 px-5 py-4 font-bold text-white shadow-xl shadow-indigo-950/40 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-120%" }}
          whileHover={
            reduceMotion || isSubmitting
              ? undefined
              : {
                  x: "120%",
                }
          }
          transition={{
            duration: 0.65,
          }}
        />

        <span className="relative flex items-center gap-2">
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in to dashboard
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
      </motion.button>

      <p className="mt-6 text-center text-xs leading-5 text-slate-500">
        Access is restricted to authorized cafe administrators.
      </p>
    </motion.form>
  );
}