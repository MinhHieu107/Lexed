import "../styles/Footer.css";
import { FaInstagram, FaYoutube, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-logo">

                <h1>LEXED</h1>

                <div className="social-icons">

                    <FaXTwitter />
                    <FaInstagram />
                    <FaYoutube />
                    <FaLinkedin />

                </div>

            </div>

            <div className="footer-column">

                <h3>Use Cases</h3>

                <a href="#">UI Design</a>
                <a href="#">UX Design</a>
                <a href="#">Wireframing</a>
                <a href="#">Diagramming</a>
                <a href="#">Brainstorming</a>
                <a href="#">Online Whiteboard</a>
                <a href="#">Team Collaboration</a>

            </div>

            <div className="footer-column">

                <h3>Explore</h3>

                <a href="#">Design</a>
                <a href="#">Prototyping</a>
                <a href="#">Development Features</a>
                <a href="#">Design Systems</a>
                <a href="#">Collaboration Features</a>
                <a href="#">Design Process</a>
                <a href="#">FigJam</a>

            </div>

            <div className="footer-column">

                <h3>Resources</h3>

                <a href="#">Blog</a>
                <a href="#">Best Practices</a>
                <a href="#">Colors</a>
                <a href="#">Color Wheel</a>
                <a href="#">Support</a>
                <a href="#">Developers</a>
                <a href="#">Resource Library</a>

            </div>

        </footer>
    );
}

export default Footer;