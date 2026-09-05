import "./AuthLayout.css";
import background from "../../assets/auth-background.jpg";

function AuthLayout({ children }) {
    return (
        <div className="auth-container">

            <div
                className="auth-left"
                style={{
                    backgroundImage: `url(${background})`
                }}
            >

                <div className="overlay">

                    <div className="logo-box">

                        <h1>LEXED</h1>

                        <p>Legal Tech Education</p>

                    </div>

                </div>

            </div>

            <div className="auth-right">

                {children}

            </div>

        </div>
    );
}

export default AuthLayout;