// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
// const token = req.headers.authorization?.split(' ')[1];

export const authMiddleware = (req, res, next) => {
const {token} = req.cookies;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = decoded;
        next();
    });
};