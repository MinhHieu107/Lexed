import AuthLayout from "../components/auth/AuthLayout";
import "../styles/AuthForm.css";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { verifyEmail, resendCode } from "../services/authService";

function VerifyEmailPage() {

    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState(
        location.state?.email ? "We sent a 6-digit code to your email." : ""
    );
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {

        if (cooldown === 0) {
            return;
        }

        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);

        return () => clearTimeout(timer);

    }, [cooldown]);

    const handleVerify = async () => {

        if (!email || !code) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        setError("");
        setInfo("");

        try {

            await verifyEmail(email, code);

            navigate("/login", {
                state: { verified: true }
            });

        } catch (err) {

            setError(
                err.response?.data?.message || "Verification failed"
            );

        } finally {

            setSubmitting(false);

        }

    };

    const handleResend = async () => {

        if (!email || cooldown > 0) {
            return;
        }

        setError("");
        setInfo("");

        try {

            await resendCode(email);

            setInfo("A new code has been sent to your email.");
            setCooldown(30);

        } catch (err) {

            setError(
                err.response?.data?.message || "Could not resend code"
            );

        }

    };

    return (

        <AuthLayout>

            <div className="auth-box">

                <h1>Verify Email</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                />

                {error && (
                    <p className="error-text">
                        {error}
                    </p>
                )}

                {info && !error && (
                    <p className="info-text">
                        {info}
                    </p>
                )}

                <button onClick={handleVerify} disabled={submitting}>
                    {submitting ? "Verifying..." : "Verify"}
                </button>

                <p>
                    Didn't get a code?{" "}
                    <span
                        className={cooldown > 0 ? "resend-disabled" : "resend-link"}
                        onClick={handleResend}
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </span>
                </p>

                <p>
                    <Link to="/login">
                        Back to login
                    </Link>
                </p>

            </div>

        </AuthLayout>

    );

}

export default VerifyEmailPage;
