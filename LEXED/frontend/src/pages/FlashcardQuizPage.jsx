import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiBook, FiEdit2, FiUsers, FiTrash2 } from "react-icons/fi";
import { FaBalanceScale } from "react-icons/fa";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import QuestionCard from "../components/flashcards/QuestionCard";
import { getSet, getSetQuestions, deleteSet } from "../services/setService";
import { getSummary } from "../services/progressService";
import { gradientForExam } from "../utils/subjectTheme";
import { useAuth } from "../context/AuthContext";
import "../styles/flashcards/FlashcardQuizPage.css";

function FlashcardQuizPage() {

    const { setId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [set, setSet] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [masteredPercent, setMasteredPercent] = useState(0);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {

        const confirmed = window.confirm(
            `Xóa set "${set.title}"? Toàn bộ flashcard trong set này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`
        );

        if (!confirmed) return;

        setDeleting(true);

        try {

            await deleteSet(setId);
            navigate("/flashcards");

        } catch (err) {

            console.log(err.response?.data);
            alert(err.response?.data?.message || "Xóa set thất bại.");
            setDeleting(false);

        }

    };

    const refreshMastery = async () => {

        try {

            const summary = await getSummary();

            const match = summary.find(
                (row) => String(row.set_id) === setId
            );

            setMasteredPercent(match ? match.mastered_percent : 0);

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            try {

                const [setData, questionData] = await Promise.all([
                    getSet(setId),
                    getSetQuestions(setId)
                ]);

                setSet(setData);
                setQuestions(questionData);
                setIndex(0);

            } catch (err) {

                console.log(err.response?.data);

            } finally {

                setLoading(false);

            }

        };

        load();
        refreshMastery();

    }, [setId]);

    const currentQuestion = questions[index];

    const goPrev = () => {
        setIndex((prev) => (prev === 0 ? questions.length - 1 : prev - 1));
    };

    const goNext = () => {
        setIndex((prev) => (prev === questions.length - 1 ? 0 : prev + 1));
    };

    return (

        <div className="quiz-layout">

            <Sidebar />

            <div className="quiz-main">

                <Topbar />

                <div className="quiz-content">

                    {!loading && set && (

                        <>

                            <div className="quiz-header">

                                <div className="quiz-header-titlerow">

                                    <h1>
                                        {set.visibility === "CLASS" && set.class_name
                                            ? `${set.title} (${set.class_name})`
                                            : set.title}
                                    </h1>

                                    {set.owner_id === user?.id && (

                                        <div className="quiz-header-actions">

                                            {set.visibility === "CLASS" && (
                                                <Link to={`/flashcards/set/${setId}/progress`} className="quiz-edit-link">
                                                    <FiUsers />
                                                    <span>Tiến độ</span>
                                                </Link>
                                            )}

                                            <Link to={`/flashcards/set/${setId}/edit`} className="quiz-edit-link">
                                                <FiEdit2 />
                                                <span>Edit Set</span>
                                            </Link>

                                            <button
                                                className="quiz-delete-link"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                            >
                                                <FiTrash2 />
                                                <span>{deleting ? "Đang xóa..." : "Xóa Set"}</span>
                                            </button>

                                        </div>

                                    )}

                                </div>

                                <span className="quiz-header-meta">
                                    {questions.length} cards &bull; {masteredPercent}% mastered
                                </span>

                            </div>

                            <div className="quiz-progress-track">
                                <div
                                    className="quiz-progress-fill"
                                    style={{ width: `${masteredPercent}%` }}
                                />
                            </div>

                            <div
                                className="quiz-banner"
                                style={{ background: gradientForExam(set.exam_id, setId) }}
                            >
                                <FaBalanceScale />
                            </div>

                            {currentQuestion && (

                                <div className="quiz-navigator">

                                    <button className="quiz-nav-btn" onClick={goPrev}>
                                        <FiArrowLeft />
                                    </button>

                                    <QuestionCard
                                        question={currentQuestion}
                                        onAnswered={refreshMastery}
                                    />

                                    <button className="quiz-nav-btn" onClick={goNext}>
                                        <FiArrowRight />
                                    </button>

                                </div>

                            )}

                            <p className="quiz-position">
                                Card {index + 1} / {questions.length}
                            </p>

                            <Link to="/dashboard" className="quiz-back-link">
                                <FiBook />
                                <span>Back to Your Library</span>
                            </Link>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}

export default FlashcardQuizPage;
