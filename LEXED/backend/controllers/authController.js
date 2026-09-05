const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/generateToken");
const { sendVerificationEmail } = require("../utils/sendEmail");
const connection = require("../config/db");

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const createAndSendVerificationCode = (userId, email, res, successMessage, extra = {}) => {

    const code = generateCode();

    connection.query(
        `INSERT INTO email_verifications (user_id, code, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        [userId, code],
        async (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            try {

                await sendVerificationEmail(email, code);

            } catch (emailErr) {

                console.log("Failed to send verification email:", emailErr);

                return res.status(502).json({
                    message: "Could not send verification email"
                });

            }

            res.status(201).json({
                message: successMessage,
                ...extra
            });

        }
    );

};

const register = async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields"
        });
    }

    connection.query(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [email, username],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "User already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            connection.query(
                `INSERT INTO users
                (username,email,password,role)
                VALUES (?,?,?,'USER')`,
                [
                    username,
                    email,
                    hashedPassword
                ],
                (err, result) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    // Tự động active các lời mời vào lớp học (class_members) đang PENDING theo email này
                    connection.query(
                        `UPDATE class_members SET user_id = ?, status = 'ACTIVE'
                         WHERE invited_email = ? AND user_id IS NULL`,
                        [result.insertId, email],
                        (inviteErr) => {

                            if (inviteErr) {
                                console.log("Failed to link pending class invites:", inviteErr);
                            }

                        }
                    );

                    createAndSendVerificationCode(
                        result.insertId,
                        email,
                        res,
                        "Register successfully. Please check your email for the verification code.",
                        { id: result.insertId }
                    );

                }
            );

        }
    );

};

const verifyEmail = (req, res) => {

    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            message: "Email and code are required"
        });
    }

    connection.query(
        "SELECT id, is_verified FROM users WHERE email = ?",
        [email],
        (err, users) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = users[0];

            if (user.is_verified) {
                return res.status(400).json({
                    message: "Email already verified"
                });
            }

            connection.query(
                `SELECT id, code
                 FROM email_verifications
                 WHERE user_id = ? AND expires_at > NOW()
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [user.id],
                (err, verifications) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    if (verifications.length === 0) {
                        return res.status(400).json({
                            message: "Code expired. Please request a new one."
                        });
                    }

                    const verification = verifications[0];

                    if (verification.code !== code) {

                        connection.query(
                            `UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?`,
                            [verification.id]
                        );

                        return res.status(400).json({
                            message: "Invalid code"
                        });

                    }

                    connection.query(
                        "UPDATE users SET is_verified = 1 WHERE id = ?",
                        [user.id],
                        (err) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            connection.query(
                                "DELETE FROM email_verifications WHERE user_id = ?",
                                [user.id]
                            );

                            res.status(200).json({
                                message: "Email verified successfully"
                            });

                        }
                    );

                }
            );

        }
    );

};

const resendCode = (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    connection.query(
        "SELECT id, is_verified FROM users WHERE email = ?",
        [email],
        (err, users) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = users[0];

            if (user.is_verified) {
                return res.status(400).json({
                    message: "Email already verified"
                });
            }

            connection.query(
                "DELETE FROM email_verifications WHERE user_id = ?",
                [user.id],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    createAndSendVerificationCode(
                        user.id,
                        email,
                        res,
                        "Verification code resent. Please check your email."
                    );

                }
            );

        }
    );

};

const login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields"
        });
    }

    connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            if (!user.is_verified) {
                return res.status(403).json({
                    message: "Please verify your email before logging in",
                    needsVerification: true
                });
            }

            const accessToken = generateAccessToken(user);

            const refreshToken = generateRefreshToken(user);
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            // Chỉ cho phép 1 phiên đăng nhập: xóa các refresh token cũ của user trước khi lưu token mới
            connection.query(
                `DELETE FROM refresh_tokens WHERE user_id = ?`,
                [user.id],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    connection.query(
                        `INSERT INTO refresh_tokens
                        (user_id, token, expires_at)
                        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
                        [
                            user.id,
                            hashedRefreshToken
                        ],
                        (err) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            res.status(200).json({
                                accessToken,
                                refreshToken
                            });
                        }
                    );
                }
            );

        }
    );

};
const logout = async (req, res) => {

    const { refreshToken } = req.body;

    if (!refreshToken) {

        return res.status(400).json({
            message: "Refresh token is required"
        });

    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid refresh token"
                });
            }

            connection.query(
                `SELECT id, token
                 FROM refresh_tokens
                 WHERE user_id = ?`,
                [decoded.id],
                async (err, results) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    let tokenId = null;

                    for (const row of results) {

                        const match = await bcrypt.compare(
                            refreshToken,
                            row.token
                        );

                        if (match) {
                            tokenId = row.id;
                            break;
                        }

                    }

                    if (!tokenId) {

                        return res.status(404).json({
                            message: "Refresh token not found"
                        });

                    }

                    connection.query(
                        `DELETE FROM refresh_tokens
                         WHERE id = ?`,
                        [tokenId],
                        (err) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            res.status(200).json({
                                message: "Logout successfully"
                            });

                        }
                    );

                }
            );

        }
    );

};
const currentUser = (req, res) => {
    res.status(200).json(req.user);
}
const refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token is required"
        });
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid refresh token"
                });
            }

            // Lấy tất cả refresh token của user
            connection.query(
                `SELECT token
                 FROM refresh_tokens
                 WHERE user_id = ?`,
                [decoded.id],
                async (err, results) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    if (results.length === 0) {
                        return res.status(403).json({
                            message: "Refresh token not found"
                        });
                    }

                    // So sánh refresh token gửi lên với token đã hash trong DB
                    let matched = false;

                    for (const row of results) {
                        const isMatch = await bcrypt.compare(
                            refreshToken,
                            row.token
                        );

                        if (isMatch) {
                            matched = true;
                            break;
                        }
                    }

                    if (!matched) {
                        return res.status(403).json({
                            message: "Refresh token is invalid"
                        });
                    }

                    // Lấy thông tin user
                    connection.query(
                        `SELECT id, username, email, role
                         FROM users
                         WHERE id = ?`,
                        [decoded.id],
                        (err, users) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            if (users.length === 0) {
                                return res.status(404).json({
                                    message: "User not found"
                                });
                            }

                            const user = users[0];

                            // Tạo access token mới
                            const accessToken = generateAccessToken(user);

                            res.status(200).json({
                                accessToken
                            });
                        }
                    );
                }
            );
        }
    );
};
module.exports = {
    register,
    login,
    currentUser,
    refresh,
    logout,
    verifyEmail,
    resendCode
}