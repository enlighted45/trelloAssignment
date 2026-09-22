
import './App.css'
import Navbar from './components/Navbar.jsx'

import { Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Boards from "./pages/Boards.jsx";
import Board from "./pages/Board.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/boards" replace />} />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/boards"
                element={
                    <ProtectedRoute>
                        <div className="app-shell">
                            <Navbar />
                            <main className="board-shell">
                                <Boards />
                            </main>
                        </div>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/boards/:boardId"
                element={
                    <ProtectedRoute>
                        <div className="app-shell app-shell--board">
                            <Navbar />
                            <div className="board-surface">
                                <Board />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
    );
}