import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../firebase.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

const boardImages = [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1497366811365-6870744d04b2?auto=format&fit=crop&w=400&q=80",
];

const initialCards = [];

export default function Boards() {
    const { user } = useAuth();
    const [cards, setCards] = useState([]);
    const inputRef = useRef(null);
    const seededRef = useRef(false);
    const ignoreBlurRef = useRef(false);

    const navigate = useNavigate();

    function startRenaming(id) {
        if (!user) return;

        void updateDoc(
            doc(db, "users", user.uid, "boards", id),
            {
                isEditing: true,
                isNew: false,
            }
        );
    }

    async function handleDeleteCard(id) {
        if (!user) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this board?"
        );

        if (!confirmed) return;

        await deleteDoc(
            doc(db, "users", user.uid, "boards", id)
        );
    }

    useEffect(() => {
        if (!user) return;

        const boardsRef = collection(db, "users", user.uid, "boards");
        const boardsQuery = query(boardsRef, orderBy("createdAt", "asc"));

        return onSnapshot(boardsQuery, async (snapshot) => {
            if (snapshot.empty && !seededRef.current) {
                seededRef.current = true;
                const batch = writeBatch(db);

                initialCards.forEach((card) => {
                    batch.set(doc(boardsRef, card.id), {
                        ...card,
                        isEditing: false,
                        createdAt: serverTimestamp(),
                    });
                });

                await batch.commit();
                return;
            }

            setCards(
                snapshot.docs.map((board) => ({
                    id: board.id,
                    title: board.data().title,
                    description: board.data().description,
                    seed: board.data().seed,
                    isEditing: board.data().isEditing,
                    isNew: board.data().isNew,
                }))
            );
        });
    }, [user]);

    useEffect(() => {
        if (cards.some((card) => card.isEditing)) {
            inputRef.current?.focus();
        }
    }, [cards]);

    async function handleAddCard() {
        if (cards.some((c) => c.isEditing)) return;
        if (!user) return;

        const newCard = await addDoc(
            collection(db, "users", user.uid, "boards"),
            {
                title: "",
                description: "",
                seed: Math.floor(Math.random() * 1000),
                isEditing: true,
                isNew: true,
                createdAt: serverTimestamp(),
            }
        );

        return newCard.id;
    }

    function commitTitle(id, rawTitle) {
        const title = rawTitle.trim();

        if (!user) return;

        const cardRef = doc(
            db,
            "users",
            user.uid,
            "boards",
            id
        );

        const card = cards.find((card) => card.id === id);

        if (!title) {
            if (card?.isNew) {
                void deleteDoc(cardRef);
            }

            return;
        }

        void updateDoc(cardRef, {
            title,
            isEditing: false,
            isNew: false,
        });
    }

    function cancelEditing(id) {
        if (!user) return;

        const card = cards.find((card) => card.id === id);

        const cardRef = doc(
            db,
            "users",
            user.uid,
            "boards",
            id
        );

        if (card?.isNew) {
            void deleteDoc(cardRef);
            return;
        }

        void updateDoc(cardRef, {
            isEditing: false,
        });
    }

    return (
        <div
            className="boards grid min-h-0 flex-1 content-start auto-rows-max grid-cols-[repeat(auto-fit,minmax(200px,200px))] items-start justify-center gap-3 overflow-auto bg-cover bg-center p-3"
            style={{
                backgroundImage: "url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=85)",
            }}
        >
            {cards.map((card) =>
                card.isEditing ? (
                    <div
                        key={card.id}
                        className="card flex w-[200px] flex-col overflow-hidden rounded-lg bg-white shadow"
                    >
                        <div
                            className="h-[75px] w-full"
                            style={{
                                backgroundImage: `url(${boardImages[card.seed % boardImages.length]})`,
                                backgroundSize: "cover",
                            }}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter card title"
                            defaultValue={card.title}
                            className="w-full border-none p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    ignoreBlurRef.current = true;
                                    e.currentTarget.blur();
                                    cancelEditing(card.id);
                                    ignoreBlurRef.current = false;
                                }
                            }}
                            onBlur={(e) => {
                                if (ignoreBlurRef.current) return;
                                commitTitle(card.id, e.currentTarget.value);
                            }}
                        />
                    </div>
                ) : (
                    <Card
                        key={card.id}
                        className="card w-[200px]"
                        title={card.title}
                        description={card.description}
                        src={boardImages[card.seed % boardImages.length]}
                        onOpen={() => navigate(`/boards/${card.id}`)}
                        onRename={() => startRenaming(card.id)}
                        onDelete={() => handleDeleteCard(card.id)}
                    />
                )
            )}

            <button
                type="button"
                onClick={handleAddCard}
                className="add-card group relative w-[200px]"
                aria-label="Add new card"
            >
                <Card
                    className="card"
                    title="Add new card"
                    description=""
                    src={boardImages[0]}
                />
                
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[75px] items-center justify-center rounded-t-lg bg-black/35 backdrop-blur-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-white text-xl leading-none text-white">
                        +
                    </span>
                </div>
            </button>
        </div>
    );
}