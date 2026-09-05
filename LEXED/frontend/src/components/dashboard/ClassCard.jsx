import { FiClock, FiUser } from "react-icons/fi";
import "../../styles/dashboard/ClassCard.css";

function ClassCard({ category, title, time, instructor, avatarColor }) {

    const initial = instructor.charAt(0).toUpperCase();

    return (

        <div className="class-card">

            <div className="class-card-header">

                <span className="class-category">{category}</span>

                <div
                    className="class-avatar"
                    style={{ background: avatarColor }}
                >
                    {initial}
                </div>

            </div>

            <h3 className="class-title">{title}</h3>

            <p className="class-meta">
                <FiClock />
                <span>{time}</span>
            </p>

            <p className="class-meta">
                <FiUser />
                <span>With {instructor}</span>
            </p>

            <button className="join-btn">
                Join Classroom
            </button>

        </div>

    );

}

export default ClassCard;
