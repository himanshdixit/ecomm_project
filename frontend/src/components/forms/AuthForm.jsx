"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, User2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

const fieldClasses =
  "w-full rounded-[1.3rem] border border-brand/10 bg-brand-soft/70 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-brand/30 focus:bg-white focus:shadow-soft";

export default function AuthForm({ mode = "login" }) {
  const isRegister = mode === "register";
  const schema = useMemo(() => (isRegister ? registerSchema : loginSchema), [isRegister]);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      const user = isRegister ? await registerUser(values) : await login(values);
      const redirectTo = searchParams.get("redirect");
      const destination = redirectTo || (user?.role === "admin" ? "/admin" : "/");
      router.replace(destination);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to complete authentication right now."));
    }
  };

  return (
    <div className="grid gap-6 rounded-[2rem] border border-white/70 bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[0.95fr,1.05fr]">
      <div className="rounded-[1.75rem] bg-brand-dark p-6 text-white">
        <div className="mb-3 inline-flex rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
          JWT + RBAC
        </div>
        <h2 className="mb-4 text-3xl text-white sm:text-4xl">{isRegister ? "Create your customer account" : "Welcome back to your grocery dashboard"}</h2>
        <p className="text-sm leading-7 text-white/72 sm:text-base">
          Authentication is backed by a secure HTTP-only JWT cookie, protected backend middleware, and frontend route guards for user and admin experiences.
        </p>
        <div className="mt-6 space-y-3 text-sm text-white/72">
          <div className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
            Persistent login restored from your active session cookie.
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
            Admin-only routes are protected in both frontend guards and backend authorization middleware.
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6">
          <h3 className="text-3xl">{isRegister ? "Register" : "Login"}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {isRegister
              ? "Start shopping with saved session support and protected checkout access."
              : "Sign in to continue to wishlist, checkout, orders, and admin routes if your role allows it."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {isRegister ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Full name</label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input {...register("name")} placeholder="Jane Shopper" className={`${fieldClasses} pl-12`} />
              </div>
              {errors.name ? <p className="mt-2 text-sm text-rose-500">{errors.name.message}</p> : null}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input {...register("email")} placeholder="you@example.com" className={`${fieldClasses} pl-12`} />
            </div>
            {errors.email ? <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Enter your password" className={`${fieldClasses} pl-12 pr-12`} />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-dark"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password ? <p className="mt-2 text-sm text-rose-500">{errors.password.message}</p> : null}
          </div>

          {submitError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</div> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-pill bg-brand-dark px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-brand-dark hover:text-brand">
            {isRegister ? "Login instead" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
