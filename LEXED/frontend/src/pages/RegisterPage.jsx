import AuthLayout from "../components/auth/AuthLayout";
import "../styles/AuthForm.css";

import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const { user } = useAuth();

    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleRegister = async () => {

        if (!username || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        setError("");

        try {

            await register(username, email, password);

            navigate("/verify-email", { state: { email } });

        } catch (err) {

            setError(
                err.response?.data?.message || "Register failed"
            );

        } finally {

            setSubmitting(false);

        }

    };

    return (

        <AuthLayout>

            <div className="auth-box">

                <h1>Register</h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

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

                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                    <p className="error-text">
                        {error}
                    </p>
                )}

                <button onClick={handleRegister} disabled={submitting}>
                    {submitting ? "Creating account..." : "Sign up"}
                </button>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Log in
                    </Link>
                </p>

            </div>

        </AuthLayout>

    );

}

export default RegisterPage;
