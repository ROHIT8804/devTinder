const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Authorization Token: ", req.headers);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).send('Access denied. No valid authorization header.');
    }

    const token = authHeader.split(' ')[1];
    const validToken = 'xyz'; 

    if (token === validToken) {
        next();
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}

module.exports = {
    adminAuth,
};