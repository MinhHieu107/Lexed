import { useEffect, useState } from "react";
import { useQuestionAnswer } from "../../hooks/useQuestionAnswer";
import { getDailyChallenge, getStats } from "../../services/progressService";
import { gradientForExam } from "../../utils/subjectTheme";
import "../../styles/flashcards/DailyChallengeCard.css";

function DailyChallengeCard() {

    const [question, setQuestion] = useState(null);
    const [stats, setStats] = useState({ streak: 0, totalCorrect: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {

        try {

            const data = await getStats();
            setStats(data);

        } catch (err) {

            console.log(err.response?.data);

        }

    };

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            try {

                const data = await getDailyChallenge();
                setQuestion(data);

            } catch (err) {

                console.log(err.response?.data);

            } finally {

                setLoading(false);

            }

        };

        load();
        loadStats();

    }, []);

    const { selected, isRevealed, isCorrect, answer } = useQuestionAnswer(question, loadStats);

    if (loading || !question) {
        return null;
    }

    return (

        <div className="daily-challenge">

            <h2 className="daily-challenge-title">
                Case of the Day Challenge
            </h2>

            <div
                className="daily-challenge-card"
                style={{ background: gradientForExam(question.exam_id) }}
            >

                <p className="daily-challenge-statement">
                    {question.noi_dung}
                </p>

                <div className="daily-challenge-answers">

                    <button
                        className={`daily-answer-btn ${selected === "ĐÚNG" ? "selected" : ""}`}
                        onClick={() => answer("ĐÚNG")}
                        disabled={isRevealed}
                    >
                        TRUE
                    </button>

                    <button
                        className={`daily-answer-btn ${selected === "SAI" ? "selected" : ""}`}
                        onClick={() => answer("SAI")}
                        disabled={isRevealed}
                    >
                        FALSE
                    </button>

                </div>

                {isRevealed && (

                    <div className="daily-challenge-reveal">

                        <p className="daily-reveal-verdict">
                            Nhận định trên là {question.nhan_dinh === "ĐÚNG" ? "Đúng" : "Sai"}
                            {isCorrect ? " — Chính xác!" : " — Chưa đúng."}
                        </p>

                        {question.co_so_phap_ly && (
                            <p><strong>Cơ sở pháp lý:</strong> {question.co_so_phap_ly}</p>
                        )}

                        {question.giai_thich && (
                            <p>{question.giai_thich}</p>
                        )}

                    </div>

                )}

                <div className="daily-challenge-footer">
                    Current Streak: {stats.streak} Days &nbsp;|&nbsp; Total Correct: {stats.totalCorrect}
                </div>

            </div>

        </div>

    );

}

export default DailyChallengeCard;
