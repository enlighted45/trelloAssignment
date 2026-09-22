import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ContentCard({
    id,
    listId,
    title,
    description,
    className = "",
    tags = [],
    deadline,
    completed = false,
    onCompletedChange,
    onOpen,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `card-${id}`,
        data: {
            type: "card",
            id,
            listId,
        },
        transition: {
            duration: 200,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onOpen}
            title={description}
            className={`
                group relative mb-2 rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-left shadow-[0_12px_24px_rgba(2,6,23,0.35)]
                transition hover:border-violet-400/40 hover:bg-slate-900
                ${isDragging ? "border-violet-400/50 bg-slate-900" : ""}
                ${className}
            `}
        >
            <input
                type="checkbox"
                checked={completed}
                onChange={onCompletedChange}
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                className="
                    peer absolute
                    left-3 top-[13px]
                    h-4 w-4
                    cursor-pointer
                    rounded border-slate-500 bg-slate-900
                    accent-violet-500
                    opacity-0 transition-all duration-300 ease-in-out
                    group-hover:opacity-100
                    checked:opacity-100
                "
            />

            <div className="min-w-0 cursor-pointer overflow-hidden pl-6">
                <p
                    className={`
                        break-words text-sm font-medium text-slate-50 transition-transform duration-300 ease-in-out
                        ${completed ? "translate-x-2 text-slate-400 line-through" : ""}
                    `}
                >
                    {title}
                </p>

                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="
                                    rounded-full border border-violet-400/40 bg-violet-500/10
                                    px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em]
                                    text-violet-200
                                "
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {deadline && (
                    <div className="mt-2 border-t border-white/10 pt-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        Due {new Date(`${deadline}T00:00:00`).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
}