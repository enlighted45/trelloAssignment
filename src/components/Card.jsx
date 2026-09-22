import { useEffect, useRef, useState } from "react";

export default function Card({
    className = "",
    title,
    description,
    src,
    onOpen,
    onRename,
    onDelete,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;

        function closeMenu(event) {
            if (!menuRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("pointerdown", closeMenu);
        return () => document.removeEventListener("pointerdown", closeMenu);
    }, [menuOpen]);

    return (
        <div
            onClick={onOpen}
            className={`
                group relative overflow-hidden
                rounded-[22px] border border-white/10 bg-slate-900/80 shadow-[0_20px_40px_rgba(15,23,42,0.4)]
                ${onOpen ? "cursor-pointer" : ""}
                ${className}
            `}
            title={description}
        >
            <img
                src={src}
                alt={title}
                className="h-[118px] w-full object-cover"
            />

            <div className="p-4">
                <h2 className="truncate pr-6 text-base font-semibold text-slate-50">
                    {title}
                </h2>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
                    Workspace
                </p>
            </div>

            {(onRename || onDelete) && (
                <div ref={menuRef} className="absolute right-3 top-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((current) => !current);
                        }}
                        className="
                            flex h-8 w-8 items-center justify-center
                            rounded-full border border-white/10 bg-slate-950/70 text-lg text-slate-200
                            opacity-0 transition hover:bg-slate-800
                            group-hover:opacity-100
                        "
                    >
                        •••
                    </button>

                    {menuOpen && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                                absolute right-0 top-10 z-20
                                w-32 overflow-hidden
                                rounded-xl border border-white/10 bg-slate-950/95 py-1 shadow-2xl
                            "
                        >
                            {onRename && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onRename();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                                >
                                    Rename
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onDelete();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}