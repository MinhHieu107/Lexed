const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {

    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {

        token = authHeader.split(" ")[1];

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {

                if (err) {
                    return res.status(401).json({
                        message: "User is not authorized"
                    });
                }

                req.user = decoded.user;

                next();
            }
        );

    } else {
        return res.status(401).json({
            message: "No token"
        });
    }

};

module.exports = validateToken;