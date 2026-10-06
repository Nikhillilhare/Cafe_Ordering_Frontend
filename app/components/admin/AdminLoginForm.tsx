"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
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

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

type LoginResponse = {
  error?: string;
};

export default function AdminLoginForm() {
  const router = useRouter();
  const reduceMotion = useHydratedReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (
      !normalizedEmail ||
      !normalizedEmail.includes("@")
    ) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "same-origin",

          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        },
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | LoginResponse
        | null;

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Unable to sign in. Please try again.",
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
              y: 24,
              scale: 0.98,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full rounded-[2rem] border border-[#e2cdbd] bg-white/90 p-6 shadow-[0_24px_65px_rgba(80,37,14,0.16)] backdrop-blur-2xl sm:p-8"
    >
      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 10,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: reduceMotion ? 0 : 0.12,
          duration: 0.4,
        }}
        className="mb-8"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d56b26] to-[#8c3610] shadow-lg shadow-orange-900/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>

        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#b65019]">
          Secure administration
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2b160d]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#7f6d62]">
          Sign in to manage your cafe, menu, orders and
          payments.
        </p>
      </motion.div>

      <div className="space-y-5">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -12,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: reduceMotion ? 0 : 0.2,
            duration: 0.4,
          }}
        >
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-bold text-[#4c2b19]"
          >
            Email address
          </label>

          <div className="group relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9b887c] transition group-focus-within:text-[#b65019]" />

            <input
              id="admin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              disabled={isSubmitting}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder="owner@yourcafe.com"
              className="w-full rounded-2xl border border-[#dfcbbb] bg-[#fffdfa] py-3.5 pl-12 pr-4 text-[#2b160d] outline-none transition placeholder:text-[#ad9a8e] hover:border-orange-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </motion.div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 12,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: reduceMotion ? 0 : 0.27,
            duration: 0.4,
          }}
        >
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-bold text-[#4c2b19]"
          >
            Password
          </label>

          <div className="group relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9b887c] transition group-focus-within:text-[#b65019]" />

            <input
              id="admin-password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-[#dfcbbb] bg-[#fffdfa] py-3.5 pl-12 pr-12 text-[#2b160d] outline-none transition placeholder:text-[#ad9a8e] hover:border-orange-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#9b887c] transition hover:bg-orange-50 hover:text-[#9c4517] disabled:opacity-50"
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
                    y: -6,
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
              y: -6,
            }}
            transition={{
              duration: 0.25,
            }}
            className="mt-5 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
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
        className="group relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#c55d1e] via-[#a74715] to-[#7e2f0c] px-5 py-4 font-bold text-white shadow-[0_14px_28px_rgba(116,45,10,0.24)] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{
            x: "-120%",
          }}
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

      <p className="mt-6 text-center text-xs leading-5 text-[#948176]">
        Access is restricted to authorized cafe
        administrators.
      </p>
    </motion.form>
  );
}