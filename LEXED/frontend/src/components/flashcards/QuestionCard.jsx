import { useQuestionAnswer } from "../../hooks/useQuestionAnswer";
import "../../styles/flashcards/QuestionCard.css";

function QuestionCard({ question, onAnswered }) {

    const { selected, isRevealed, isCorrect, answer } = useQuestionAnswer(question, onAnswered);

    if (!question) {
        return null;
    }

    return (

        <div className="question-card">

            <div className="question-statement">
                {question.noi_dung}
            </div>

            <div className="question-answers">

                <button
                    className={[
                        "answer-btn",
                        "answer-true",
                        selected === "ĐÚNG" ? "selected" : ""
                    ].join(" ").trim()}
                    onClick={() => answer("ĐÚNG")}
                    disabled={isRevealed}
                >
                    TRUE
                </button>

                <button
                    className={[
                        "answer-btn",
                        "answer-false",
                        selected === "SAI" ? "selected" : ""
                    ].join(" ").trim()}
                    onClick={() => answer("SAI")}
                    disabled={isRevealed}
                >
                    FALSE
                </button>

            </div>

            {isRevealed && (

                <div className={`question-reveal ${isCorrect ? "correct" : "incorrect"}`}>

                    <p className="reveal-verdict">
                        Nhận định trên là {question.nhan_dinh === "ĐÚNG" ? "Đúng" : "Sai"}
                        {isCorrect ? " — Bạn trả lời đúng!" : " — Bạn trả lời sai."}
                    </p>

                    {question.co_so_phap_ly && (
                        <p className="reveal-basis">
                            <strong>Cơ sở pháp lý:</strong> <em>{question.co_so_phap_ly}</em>
                        </p>
                    )}

                    {question.giai_thich && (
                        <p className="reveal-explanation">
                            <strong>Giải thích:</strong> {question.giai_thich}
                        </p>
                    )}

                </div>

            )}

        </div>

    );

}

export default QuestionCard;
