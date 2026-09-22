import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <nav className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                    to="/boards"
                    className="flex items-center gap-3 text-lg font-bold tracking-[0.2em] text-white uppercase"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm text-white shadow-lg shadow-violet-500/30">
                        F
                    </span>
                    FlowBoard
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/boards"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/60 hover:text-white"
                    >
                        Dashboard
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-110"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
}