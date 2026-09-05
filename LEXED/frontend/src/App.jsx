import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import FlashcardsPage from "./pages/FlashcardsPage";
import FlashcardQuizPage from "./pages/FlashcardQuizPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProrectedRoute";
import CreateFlashcardSet from "./components/flashcards/CreateFlashcardSet";
import ClassesPage from "./pages/ClassesPage";
import SetProgressPage from "./pages/SetProgressPage";
function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/verify-email"
                    element={<VerifyEmailPage />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>

                            <DashboardPage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>

                            <HomePage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/flashcards"
                    element={
                        <ProtectedRoute>

                            <FlashcardsPage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/flashcards/addnewsetcard"
                    element={
                        <ProtectedRoute>

                            <CreateFlashcardSet />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/flashcards/set/:setId/edit"
                    element={
                        <ProtectedRoute>

                            <CreateFlashcardSet />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/flashcards/set/:setId/progress"
                    element={
                        <ProtectedRoute>

                            <SetProgressPage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/flashcards/set/:setId"
                    element={
                        <ProtectedRoute>

                            <FlashcardQuizPage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/classes"
                    element={
                        <ProtectedRoute>

                            <ClassesPage />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>

                            <SettingsPage />

                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;