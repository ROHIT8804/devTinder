const validateSignUpData = require("../utils/validateSignUpData");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const express = require("express");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {

    try {   
        validateSignUpData(req.body);
        // Assuming password is sent in the request body
        const passwordHash = await bcrypt.hash(req.body.password,10); 
        console.log("Password Hash:", passwordHash);

            // Creating a new instance of the User model
            const user = new User({
                ...req.body,
                password: passwordHash
            })
            console.log("User Data:", user);


        // Validate the user data before saving
        await user.save();
        res.send("User created successfully");
    } catch (error) {
        console.error("Validation error:", error);
        return res.status(400).send(error.message || "Validation failed");
    }
});

authRouter.post("/login", async (req, res) => {
    try{
        const  { emailId, password } = req.body;
        if (!emailId || !password) {
            return res.status(400).send("Email and password are required");
        }
        const user = await User.findOne({ emailId });

        if(!user) {
            return res.status(404).send("User not found");
        }

        const isPasswordValid = await user.validatePassword(password);
        console.log("Is Password Valid:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid password");
        }else{
            const token = await user.getJWT();

            res.cookie("token", token, {
                                httpOnly: true,
                                maxAge: 60 * 60 * 1000 // Cookie expires in 1 hour (in ms)
                                }); 

            // Password is valid, proceed with login
            console.log("User logged in successfully:", user);
            return res.status(200).json({
                message: "Login successful"
            });
        }

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(400).send(error.message || "Server error");
    }
})

authRouter.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });
    res.status(200).send("Logged out successfully");
})

module.exports = authRouter;