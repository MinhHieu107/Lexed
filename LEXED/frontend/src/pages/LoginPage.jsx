import AuthLayout from "../components/auth/AuthLayout";
import "../styles/AuthForm.css";

import { useState } from "react";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";

function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const { user, setUser } = useAuth();

    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = async () => {

        try {

            setError("");
            setNeedsVerification(false);

            const data = await login(email, password);

            localStorage.setItem(
                "accessToken",
                data.accessToken
            );

            localStorage.setItem(
                "refreshToken",
                data.refreshToken
            );

            // Lấy thông tin user
            const currentUser = await getCurrentUser();

            // Lưu vào AuthContext
            setUser(currentUser);

            navigate("/home");

        } catch (err) {

            setError(
                err.response?.data?.message || "Login failed"
            );

            setNeedsVerification(!!err.response?.data?.needsVerification);

        }

    };

    return (

        <AuthLayout>

            <div className="auth-box">

                <h1>Login</h1>

                {location.state?.verified && !error && (
                    <p className="info-text">
                        Email verified! You can log in now.
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p className="error-text">
                        {error}
                        {needsVerification && (
                            <>
                                {" "}
                                <Link to="/verify-email" state={{ email }}>
                                    Verify now
                                </Link>
                            </>
                        )}
                    </p>
                )}

                <button onClick={handleLogin}>
                    Login
                </button>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">
                        Sign up
                    </Link>
                </p>

            </div>

        </AuthLayout>

    );
}

export default LoginPage;
