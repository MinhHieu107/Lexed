import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";
import heroImage from "../assets/hero.jpg";

function Hero() {

    const navigate = useNavigate();

    return (
        <section
            className="hero"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="hero-overlay">

                <h1>
                    STUDY SMARTER,
                    <br />
                    PRACTICE BOLDER
                </h1>

                <p>
                    "The life of the law has not been logic; it has been experience."
                </p>

                <button onClick={() => navigate("/register")}>
                    SIGN UP FOR FREE
                </button>

            </div>
        </section>
    );
}

export default Hero;