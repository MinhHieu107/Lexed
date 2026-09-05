const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (to, code) => {

    const { error } = await resend.emails.send({
        from: "LEXED <onboarding@resend.dev>",
        to,
        subject: "Mã xác thực tài khoản LEXED",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #6b2b1a;">Xác thực email của bạn</h2>
                <p>Nhập mã dưới đây để hoàn tất đăng ký tài khoản LEXED:</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3a352a;">${code}</p>
                <p style="color: #857c68; font-size: 13px;">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            </div>
        `
    });

    if (error) {
        throw new Error(error.message || "Failed to send email");
    }

};

module.exports = {
    sendVerificationEmail
};
