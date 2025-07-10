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

authRouter.patch("/profile/update", authToken, async (req,res)=>{
    try{
        const user = req.user;
        console.log("User from authToken middleware:", user);
        if(!user){
            throw new Error("User not found");
        }

        const updatedData = req.body;
        if(!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error("No data provided to update");
        }

        const ALLOWED_FIELDS = ["firstName", "lastName","age","gender","skills"];

        const validFields = Object.keys(updatedData).filter((key) => ALLOWED_FIELDS.includes(key));
        const invalidFields = Object.keys(updatedData).filter((key) => !ALLOWED_FIELDS.includes(key));
        console.log("Valid fields:", validFields);
        
        if (invalidFields.length > 0) {
            return res.status(400).send("Invalid fields: " + invalidFields.join(", "));
        }
        if (validFields.length === 0) {
            return res.status(400).send("Enter valid fields to update");
        }

        // Only update allowed fields
        validFields.forEach((field) => {
            user[field] = updatedData[field];
        }); 

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: user
        })
    }
    catch (error) {
        console.error("Error during profile update:", error);
        return res.status(400).send(error.message || "Server error");
    }
})


module.exports = authRouter;