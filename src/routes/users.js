const User = require("../models/user");
const { authToken } = require("../middlewares/auth");

const express = require('express');
const usersRouter = express.Router();

usersRouter.get("/users", async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        let users = await User.findOne({emailId: userEmail});
        if (users?.length > 0) {
            res.json(users);
        } else {
            res.status(404).send("No users found with the provided emailId");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Server error");
    }
});

usersRouter.get("/feed",authToken, async (req, res) => {
    try {
        const users = await User.find();
        if (users.length > 0) {
            res.json(users);
        } else {
            res.status(404).send("No users found");
        }
    } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).send("Server error");
    }
});

usersRouter.patch("/users/update/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const updatedData = req.body;

    try {
        // Email can not be updated.
        const ALLOWED_FIELDS = ["firstName", "lastName", "password", "age","skills"];
        const invalidFields = Object.keys(updatedData).filter((key) => !ALLOWED_FIELDS.includes(key));
        if (invalidFields.length > 0) {
            return res.status(400).send("Invalid fields in request body: " + invalidFields.join(", "));
        }

        if (!userId) {
            return res.status(400).send("userId is required");
        }
        delete updatedData._id; // Prevent _id update if present
        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true, runValidators: true});
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(400).send("UPDATE FAILED: " + error.message);
    }
});


module.exports = usersRouter;

