import ContentCard from "../components/ContentCard.jsx";
import List from "../components/List.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../firebase.js";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

const initialLists = [];

const initialContents = [];

export default function Board() {
    const { user } = useAuth();
    const { boardId } = useParams();
    const [addingToList, setAddingToList] = useState(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [addingList, setAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);

    const textareaRef = useRef(null);
    const listInputRef = useRef(null);
    const dragStartContentsRef = useRef(initialContents);
    const isDraggingRef = useRef(false);

    const [activeId, setActiveId] = useState(null);

    const [lists, setLists] = useState(initialLists);
    const [contents, setContents] = useState(initialContents);
    const [editingContent, setEditingContent] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [draftDescription, setDraftDescription] = useState("");
    const [draftTags, setDraftTags] = useState("");
    const [draftDeadline, setDraftDeadline] = useState("");

    useEffect(() => {
        if (!user || !boardId) return;

        setDataLoaded(false);
        const boardRef = doc(db, "users", user.uid, "boards", boardId);

        return onSnapshot(boardRef, (snapshot) => {
            if (isDraggingRef.current) return;

            const data = snapshot.data();

            if (data?.lists && data?.contents) {
                setLists(data.lists);
                setContents(data.contents);
            } else {
                setLists(initialLists);
                setContents(initialContents);
                void setDoc(boardRef, {
                    lists: initialLists,
                    contents: initialContents,
                }, { merge: true });
            }

            setDataLoaded(true);
        });
    }, [boardId, user]);

    useEffect(() => {
        if (!user || !boardId || !dataLoaded || activeId !== null) return;

        void setDoc(doc(db, "users", user.uid, "boards", boardId), {
            lists,
            contents,
        }, { merge: true });
    }, [activeId, boardId, contents, dataLoaded, lists, user]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const collisionDetectionStrategy = (args) => {
        const activeType = args.active.data.current?.type;

        if (activeType === "list") {
            return closestCenter({
                ...args,
                droppableContainers:
                    args.droppableContainers.filter(
                        (container) =>
                            container.data.current?.type === "list"
                    ),
            });
        }

        return closestCenter({
            ...args,
            droppableContainers:
                args.droppableContainers.filter((container) => {
                    const type = container.data.current?.type;

                    return (
                        type === "card" ||
                        type === "list-drop"
                    );
                }),
        });
    };

    function handleDragStart(event) {
        isDraggingRef.current = true;
        dragStartContentsRef.current = contents;
        setActiveId(event.active.id);
    }

    function handleDragOver(event) {
        const { active, over } = event;

        if (!over) return;

        if (active.data.current?.type !== "card") {
            return;
        }

        const activeCardId = active.data.current.id;
        const overType = over.data.current?.type;

        setContents((currentContents) => {
            const activeIndex = currentContents.findIndex(
                (content) => content.id === activeCardId
            );

            if (activeIndex === -1) {
                return currentContents;
            }

            const activeCard = currentContents[activeIndex];

            if (overType === "list-drop") {
                const targetListId = over.data.current?.listId;

                if (
                    targetListId === undefined ||
                    activeCard.listId === targetListId
                ) {
                    return currentContents;
                }

                return currentContents.map((content) =>
                    content.id === activeCardId
                        ? {
                            ...content,
                            listId: targetListId,
                        }
                        : content
                );
            }

            if (overType === "card") {
                const overCardId = over.data.current?.id;

                const overIndex = currentContents.findIndex(
                    (content) => content.id === overCardId
                );

                if (overIndex === -1) {
                    return currentContents;
                }

                const overCard = currentContents[overIndex];

                if (activeCard.listId === overCard.listId) {
                    return currentContents;
                }

                const updatedContents = currentContents.map(
                    (content) =>
                        content.id === activeCardId
                            ? {
                                ...content,
                                listId: overCard.listId,
                            }
                            : content
                );

                return arrayMove(
                    updatedContents,
                    activeIndex,
                    overIndex
                );
            }

            return currentContents;
        });
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        isDraggingRef.current = false;
        setActiveId(null);

        if (!over) {
            if (active.data.current?.type === "card") {
                setContents(dragStartContentsRef.current);
            }
            return;
        }

        if (active.id === over.id) return;

        if (active.data.current?.type === "list") {
            const activeListId = active.data.current.id;
            const overListId = over.data.current?.id;

            if (overListId === undefined) return;

            setLists((currentLists) => {
                const oldIndex = currentLists.findIndex(
                    (list) => list.id === activeListId
                );

                const newIndex = currentLists.findIndex(
                    (list) => list.id === overListId
                );

                if (oldIndex === -1 || newIndex === -1) {
                    return currentLists;
                }

                return arrayMove(
                    currentLists,
                    oldIndex,
                    newIndex
                );
            });

            return;
        }

        if (active.data.current?.type === "card") {
            const activeCardId = active.data.current.id;
            const overCardId = over.data.current?.id;

            if (overCardId === undefined) return;

            setContents((currentContents) => {
                const activeCard = currentContents.find(
                    (content) =>
                        content.id === activeCardId
                );

                const overCard = currentContents.find(
                    (content) =>
                        content.id === overCardId
                );

                if (!activeCard || !overCard) {
                    return currentContents;
                }

                if (activeCard.listId !== overCard.listId) {
                    return currentContents;
                }

                const oldIndex = currentContents.findIndex(
                    (content) =>
                        content.id === activeCardId
                );

                const newIndex = currentContents.findIndex(
                    (content) =>
                        content.id === overCardId
                );

                return arrayMove(
                    currentContents,
                    oldIndex,
                    newIndex
                );
            });
        }
    }

    function handleDragCancel() {
        isDraggingRef.current = false;
        setContents(dragStartContentsRef.current);
        setActiveId(null);
    }

    function startAddingList() {
        setAddingList(true);
        setNewListTitle("");
        requestAnimationFrame(() => listInputRef.current?.focus());
    }

    function addList() {
        const title = newListTitle.trim();
        if (!title) return;

        setLists((currentLists) => {
            const nextId = Math.max(0, ...currentLists.map((list) => list.id)) + 1;

            return [
                ...currentLists,
                {
                    id: nextId,
                    title,
                },
            ];
        });
        setNewListTitle("");
        setAddingList(false);
    }

    function renameList(id, title) {
        setLists((currentLists) =>
            currentLists.map((list) =>
                list.id === id ? { ...list, title } : list
            )
        );
    }

    function deleteList(id) {
        if (!window.confirm("Are you sure you want to delete this list?")) return;

        setLists((currentLists) => currentLists.filter((list) => list.id !== id));
        setContents((currentContents) =>
            currentContents.filter((content) => content.listId !== id)
        );
    }

    function addCard(listId) {
        const title = newCardTitle.trim();
        if (!title) return;

        setContents((currentContents) => {
            const nextId = Math.max(0, ...currentContents.map((content) => content.id)) + 1;

            return [
                ...currentContents,
                {
                id: nextId,
                listId,
                title,
                description: "",
                tags: [],
                deadline: "",
                completed: false,
            },
            ];
        });

        setNewCardTitle("");

        requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            textarea.style.height = "";
            textarea.focus();
        });
    }

    function startAddingCard(listId) {
        setAddingToList(listId);
        setNewCardTitle("");
    }

    function openContentEditor(content) {
        setEditingContent(content);
        setDraftTitle(content.title);
        setDraftDescription(content.description);
        setDraftTags((content.tags ?? []).join(", "));
        setDraftDeadline(content.deadline ?? "");
    }

    function closeContentEditor() {
        setEditingContent(null);
    }

    function saveContent() {
        if (!editingContent || !draftTitle.trim()) return;

        const tags = draftTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        setContents((currentContents) =>
            currentContents.map((content) =>
                content.id === editingContent.id
                    ? {
                        ...content,
                        title: draftTitle.trim(),
                        description: draftDescription.trim(),
                        tags,
                        deadline: draftDeadline,
                    }
                    : content
            )
        );
        closeContentEditor();
    }

    function toggleContentCompleted(id) {
        setContents((currentContents) =>
            currentContents.map((content) =>
                content.id === id
                    ? {
                        ...content,
                        completed: !content.completed,
                    }
                    : content
            )
        );
    }

    function deleteContent() {
        if (!editingContent) return;
        if (!window.confirm("Are you sure you want to delete this card?")) return;

        setContents((currentContents) =>
            currentContents.filter((content) => content.id !== editingContent.id)
        );
        closeContentEditor();
    }

    const activeCard = contents.find(
        (content) => `card-${content.id}` === activeId
    );

    const activeList = lists.find(
        (list) => `list-${list.id}` === activeId
    );

    return (
        <div className="
            h-full w-full min-w-0
            overflow-x-auto overflow-y-hidden
            scrollbar-thin
        ">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={lists.map(
                        (list) => `list-${list.id}`
                    )}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="
                        flex w-max min-w-full
                        items-start gap-4 p-4
                    ">
                        {lists.map((list) => {
                            const listContents =
                                contents.filter(
                                    (content) =>
                                        content.listId === list.id
                                );

                            return (
                                <List
                                    key={list.id}
                                    id={list.id}
                                    title={list.title}
                                    onRename={(title) => renameList(list.id, title)}
                                    onDelete={() => deleteList(list.id)}
                                >
                                    <SortableContext
                                        items={listContents.map(
                                            (content) =>
                                                `card-${content.id}`
                                        )}
                                        strategy={
                                            verticalListSortingStrategy
                                        }
                                    >
                                        {listContents.map(
                                            (content) => (
                                                <ContentCard
                                                    key={content.id}
                                                    id={content.id}
                                                    listId={content.listId}
                                                    title={content.title}
                                                    description={content.description}
                                                    tags={content.tags}
                                                    deadline={content.deadline}
                                                    completed={content.completed ?? false}
                                                    onCompletedChange={() =>
                                                        toggleContentCompleted(content.id)
                                                    }
                                                    onOpen={() => openContentEditor(content)}
                                                />
                                            )
                                        )}
                                    </SortableContext>

                                    {addingToList === list.id ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                addCard(list.id);
                                            }}
                                            className="
                                                rounded-lg
                                                bg-white p-2 mb-2
                                                text-left shadow-sm
                                            "
                                        >
                                            <textarea
                                                ref={textareaRef}
                                                autoFocus
                                                value={newCardTitle}
                                                onChange={(e) =>
                                                    setNewCardTitle(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key ===
                                                            "Enter" &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault();
                                                        e.currentTarget.form?.requestSubmit();
                                                    }
                                                }}
                                                onInput={(e) => {
                                                    const textarea =
                                                        e.currentTarget;

                                                    textarea.style.height =
                                                        "auto";

                                                    textarea.style.height =
                                                        `${textarea.scrollHeight}px`;
                                                }}
                                                placeholder="Enter card title..."
                                                rows={2}
                                                className="
                                                    w-full
                                                    resize-none
                                                    overflow-hidden
                                                    box-border
                                                    leading-5
                                                    bg-transparent
                                                    outline-none
                                                "
                                            />
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                startAddingCard(list.id)
                                            }
                                            className="
                                                flex w-full
                                                items-center
                                                rounded-lg
                                                bg-white p-2 mb-2
                                                text-left shadow-sm
                                            "
                                        >
                                            + Add new card
                                        </button>
                                    )}
                                </List>
                            );
                        })}

                        {addingList ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    addList();
                                }}
                                className="h-fit w-[250px] shrink-0 rounded-xl bg-gray-100/70 p-2 shadow-md"
                            >
                                <input
                                    ref={listInputRef}
                                    value={newListTitle}
                                    onChange={(event) => setNewListTitle(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Escape") {
                                            setAddingList(false);
                                            setNewListTitle("");
                                        }
                                    }}
                                    placeholder="Enter list name..."
                                    aria-label="New list name"
                                    className="mb-2 w-full rounded-lg bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                    >
                                        Add list
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddingList(false);
                                            setNewListTitle("");
                                        }}
                                        className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={startAddingList}
                                className="w-[250px] shrink-0 rounded-xl bg-gray-100/70 p-2 text-left shadow-md"
                            >
                                + Add new list
                            </button>
                        )}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeCard ? (
                        <div className="
                            w-[234px]
                            rounded-lg
                            bg-white
                            p-2
                            shadow-lg
                            cursor-grabbing
                        ">
                            <p className="break-words">
                                {activeCard.title}
                            </p>
                        </div>
                    ) : activeList ? (
                        <div className="
                            w-[250px]
                            max-h-[80vh]
                            overflow-hidden
                            rounded-xl
                            bg-gray-100
                            p-2
                            shadow-xl
                            cursor-grabbing
                        ">
                            <div className="
                                mb-2 ps-2
                                text-sm font-bold
                            ">
                                {activeList.title}
                            </div>

                            {contents
                                .filter(
                                    (content) =>
                                        content.listId ===
                                        activeList.id
                                )
                                .map((content) => (
                                    <div
                                        key={content.id}
                                        className="
                                            mb-2
                                            rounded-lg
                                            bg-white
                                            p-2
                                            shadow-sm
                                        "
                                    >
                                        {content.title}
                                    </div>
                                ))}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {editingContent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
                    onClick={closeContentEditor}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="content-card-dialog-title"
                        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 id="content-card-dialog-title" className="text-lg font-semibold">
                                Edit card
                            </h2>
                            <button
                                type="button"
                                onClick={closeContentEditor}
                                className="text-xl text-gray-500 hover:text-gray-800"
                                aria-label="Close dialog"
                            >
                                x
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                                <input
                                    value={draftTitle}
                                    onChange={(event) => setDraftTitle(event.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Description
                                <textarea
                                    value={draftDescription}
                                    onChange={(event) => setDraftDescription(event.target.value)}
                                    rows={4}
                                    className="mt-1 w-full resize-y rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Tags
                                <input
                                    value={draftTags}
                                    onChange={(event) => setDraftTags(event.target.value)}
                                    placeholder="design, urgent, review"
                                    className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Deadline
                                <input
                                    type="date"
                                    value={draftDeadline}
                                    onChange={(event) => setDraftDeadline(event.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={deleteContent}
                                className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete card
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeContentEditor}
                                    className="rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveContent}
                                    disabled={!draftTitle.trim()}
                                    className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}