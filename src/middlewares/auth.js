// const adminAuth = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     console.log("Authorization Token: ", req.headers);

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(403).send('Access denied. No valid authorization header.');
//     }

//     const token = authHeader.split(' ')[1];
//     const validToken = 'xyz'; 

//     if (token === validToken) {
//         next();
//     } else {
//         res.status(403).send('Access denied. Admins only.');
//     }
// }

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        const token = cookies.token;
        if (!token) {
            res.status(401).send("Access denied. No token provided.");
            return;
        }

        const decoded = await jwt.verify(token, "devtTechSecretKey");
        console.log("Decoded token:", decoded);
 
        const userId = decoded.userId;
        if (!userId) {
            return res.status(404).send("UserId not found");
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        return res.status(400).send(error.message || 'Invalid token.');
    }
}

module.exports = {
    authToken
};