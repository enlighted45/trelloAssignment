import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";

export default function List({
    id,
    title,
    children,
    onRename,
    onDelete,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(title);
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
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `list-${id}`,
        data: {
            type: "list",
            id,
        },
        transition: {
            duration: 200,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
    });

    const {
        setNodeRef: setDroppableNodeRef,
        isOver,
    } = useDroppable({
        id: `list-drop-${id}`,
        data: {
            type: "list-drop",
            listId: id,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        willChange: "transform",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="
                flex shrink-0 max-h-[80vh] w-[280px] flex-col
                rounded-[22px] border border-white/10 bg-slate-900/75 p-2 shadow-[0_18px_30px_rgba(15,23,42,0.5)]
            "
        >
            <div
                {...attributes}
                {...listeners}
                className="
                    mb-2 flex shrink-0
                    items-center justify-between
                    cursor-grab rounded-xl px-2 py-2 active:cursor-grabbing
                "
            >
                {isRenaming ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            const trimmedTitle = newTitle.trim();

                            if (trimmedTitle && trimmedTitle !== title) {
                                onRename?.(trimmedTitle);
                            }

                            setNewTitle(trimmedTitle || title);
                            setIsRenaming(false);
                        }}
                        onClick={(event) => event.stopPropagation()}
                        className="flex min-w-0 flex-1"
                    >
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={(event) => setNewTitle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    event.preventDefault();
                                    setNewTitle(title);
                                    setIsRenaming(false);
                                }
                            }}
                            className="min-w-0 w-full rounded-xl border border-violet-400/40 bg-slate-950/80 px-2 py-1.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-violet-500/20"
                            aria-label="List name"
                        />
                    </form>
                ) : (
                    <h4 className="min-w-0 truncate text-sm font-bold uppercase tracking-[0.08em] text-slate-100">
                        {title}
                    </h4>
                )}

                <div ref={menuRef} className="relative ml-2 shrink-0">
                    <button
                        type="button"
                        aria-label={`Actions for ${title}`}
                        aria-expanded={menuOpen}
                        onClick={(event) => {
                            event.stopPropagation();
                            setMenuOpen((current) => !current);
                        }}
                        className="rounded-full px-2 py-1 text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                        ...
                    </button>

                    {menuOpen && (
                        <div
                            onClick={(event) => event.stopPropagation()}
                            className="absolute right-0 top-7 z-20 w-28 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 py-1 text-sm shadow-xl"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setNewTitle(title);
                                    setIsRenaming(true);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-200 hover:bg-white/5"
                            >
                                Rename
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete?.();
                                }}
                                className="w-full px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={setDroppableNodeRef}
                className={`
                    min-h-[40px]
                    overflow-y-auto
                    overflow-x-hidden
                    scrollbar-thin
                    rounded-xl
                    px-1
                    ${isOver ? "bg-violet-500/10" : ""}
                `}
            >
                {children}
            </div>
        </div>
    );
}