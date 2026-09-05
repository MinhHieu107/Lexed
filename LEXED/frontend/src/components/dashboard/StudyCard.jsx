import { useNavigate } from "react-router-dom";
import { FaBalanceScale } from "react-icons/fa";
import "../../styles/dashboard/StudyCard.css";

function StudyCard({ subject, cardCount, mastered, gradient, setId }) {

    const navigate = useNavigate();

    const handleClick = () => {

        if (setId) {
            navigate(`/flashcards/set/${setId}`);
        }

    };

    return (

        <div
            className="study-card"
            onClick={handleClick}
            role={setId ? "button" : undefined}
        >

            <div
                className="study-card-image"
                style={{ background: gradient }}
            >
                <FaBalanceScale />
            </div>

            <div className="study-card-body">

                <h3>{subject}</h3>

                <p>{cardCount} cards &bull; {mastered}% mastered</p>

                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${mastered}%` }}
                    />
                </div>

            </div>

        </div>

    );

}

export default StudyCard;
