import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { user, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                <p className="text-lg font-medium">Loading workspace...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/boards" replace />;
    }

    async function handleEmailSubmit(e) {
        e.preventDefault();

        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleGoogleLogin() {
        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleForgotPassword() {
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Enter your email first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent. Check your inbox.");
        } catch (error) {
            setError(getErrorMessage(error));
        }
    }

    function changeMode() {
        setIsSignup((current) => !current);
        setError("");
        setMessage("");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.32),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.24),_transparent_28%),linear-gradient(135deg,#020817_0%,#0f172a_40%,#111827_100%)] px-4 py-10">
            <div className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/70 shadow-[0_30px_80px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600/30 via-sky-500/10 to-slate-900 p-10 lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.2),_transparent_25%)]" />
                        <div className="relative">
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-violet-100">
                                Productive workflow
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-white">
                                Turn ideas into momentum.
                            </h1>
                            <p className="mt-4 max-w-md text-base text-slate-200/80">
                                Plan projects, align priorities, and keep every team moving with a beautifully focused workspace.
                            </p>
                        </div>

                        <div className="relative grid gap-4">
                            {[
                                "Visual planning boards",
                                "Fast team collaboration",
                                "Progress that stays clear",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-lg text-emerald-300">
                                        ✓
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                                    FlowBoard
                                </div>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                {isSignup ? "Create account" : "Welcome back"}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white">
                                {isSignup ? "Get started" : "Sign in"}
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                                {isSignup
                                    ? "Build your next big workflow in minutes."
                                    : "Access your project board and keep moving."}
                            </p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Enter your password"
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            {!isSignup && (
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-violet-300 transition hover:text-violet-200 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            )}

                            {error && (
                                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">or</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 font-medium text-slate-100 transition hover:border-violet-400/60 hover:bg-slate-800 disabled:opacity-60"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                                G
                            </span>
                            Continue with Google
                        </button>

                        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
                            {isSignup ? "Already have an account?" : "Don’t have an account?"}
                            <button
                                type="button"
                                onClick={changeMode}
                                className="ml-1 font-semibold text-violet-300 transition hover:text-violet-200"
                            >
                                {isSignup ? "Log in" : "Sign up"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getErrorMessage(error) {
    const code = error?.code;

    switch (code) {
        case "auth/email-already-in-use":
            return "An account with this email already exists.";

        case "auth/invalid-email":
            return "Enter a valid email address.";

        case "auth/weak-password":
            return "Password is too weak.";

        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Incorrect email or password.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        default:
            return "Something went wrong. Please try again.";
    }
}