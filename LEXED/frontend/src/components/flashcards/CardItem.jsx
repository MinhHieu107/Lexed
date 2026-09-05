import { FiTrash2 } from "react-icons/fi";

import "../../styles/flashcards/CardItem.css";

function CardItem({

    index,
    card,
    onChange,
    onDelete

}) {

    return (

        <div className="card-item">

            <div className="number">
                {index + 1}
            </div>

            <div className="card-content">

                <div className="card-top">

                    <span>FLASHCARD #{index + 1}</span>

                    <FiTrash2
                        className="trash"
                        onClick={() => onDelete(index)}
                    />

                </div>

                <div className="field">

                    <label>NỘI DUNG CÂU HỎI / NHẬN ĐỊNH</label>

                    <textarea
                        rows={2}
                        value={card.noi_dung}
                        onChange={(e) =>
                            onChange(index, "noi_dung", e.target.value)
                        }
                    />

                </div>

                <div className="field">

                    <label>ĐÁP ÁN</label>

                    <select
                        value={card.answer}
                        onChange={(e) =>
                            onChange(index, "answer", e.target.value)
                        }
                    >
                        <option value="ĐÚNG">ĐÚNG</option>
                        <option value="SAI">SAI</option>
                    </select>

                </div>

                <div className="field">

                    <label>CƠ SỞ PHÁP LÝ</label>

                    <textarea
                        rows={2}
                        value={card.legalBasis}
                        onChange={(e) =>
                            onChange(index, "legalBasis", e.target.value)
                        }
                    />

                </div>

                <div className="field">

                    <label>GIẢI THÍCH</label>

                    <textarea
                        rows={4}
                        value={card.explanation}
                        onChange={(e) =>
                            onChange(index, "explanation", e.target.value)
                        }
                    />

                </div>

            </div>

        </div>

    );

}

export default CardItem;