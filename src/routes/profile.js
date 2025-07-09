const { authToken } = require("../middlewares/auth");
const express = require("express");


const authRouter = express.Router();

authRouter.get("/profile",authToken,  async (req, res) => {
    try{
        const user = req.user

        if(!user) {
            return res.status(404).send("User not found");
        }
        res.send('User ID from cookie: ' + user);
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(400).send(error.message || "Server error");
    }
})

module.exports = authRouter;