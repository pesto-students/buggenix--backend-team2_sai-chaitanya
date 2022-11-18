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
            let userInfo = {
                "userId":decoded.id,
                "userRole":decoded.role,
                "userSuperAdminId":decoded.superAdminId
            }
            req.userInfo = userInfo;
            if(user)
            next();
        }
    );
}