import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar(){

    const navigate = useNavigate();

    return(

        <nav className="navbar">

            <div className="logo">
                LEXED
            </div>

            <ul className="nav-links">

                <li>Study tools</li>
                <li>Law Major</li>
                <li>Community</li>
                <li>Resources</li>
                <li>News</li>
                <li>Contact</li>

            </ul>

            <div className="nav-buttons">

                <button
                    className="login-btn"
                    onClick={() => navigate("/login")}
                >
                    Log in
                </button>

                <button
                    className="signup-btn"
                    onClick={() => navigate("/register")}
                >
                    Sign up
                </button>

            </div>

        </nav>

    )

}

export default Navbar;