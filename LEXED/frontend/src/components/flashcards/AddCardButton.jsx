import { FiPlus } from "react-icons/fi";

function AddCardButton({ onClick }) {

    return (

        <button
            className="add-card-btn"
            onClick={onClick}
        >

            <FiPlus />

            Add New Card

        </button>

    );

}

export default AddCardButton;