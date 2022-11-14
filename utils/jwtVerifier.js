import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    console.log(authHeader); // Bearer token
    const token = authHeader.split(' ')[1];
    console.log("token",token);
    jwt.verify(
        token,
        process.env.JWT,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            console.log("verified")
            req.userId = decoded.id;
            next();
        }
    );
}