const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
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

usersRouter.get("/users/requests/recieved", authToken, async (req, res) => {
    try{
        const loggedInUserId = req.user._id?.toString();
        if (!loggedInUserId) {
            return res.status(400).send("User not authenticated");
        }

        const recievedRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
        }).populate('fromUserId', 'firstName lastName emailId age');

        if (recievedRequests.length === 0) {
            return res.status(404).send("No connection requests received");
        }
        res.json(recievedRequests);

        
    }
    catch (error) {
        console.error("Error fetching received requests:", error);
        res.status(500).send("Server error");
    }  
})

usersRouter.get("/users/connections", authToken, async (req, res) => {
    try{
        const loggedInUserId = req.user._id?.toString();
        if (!loggedInUserId) {
            return res.status(400).send("User not authenticated");
        }

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId, status: 'accepted' },
                { toUserId: loggedInUserId, status: 'accepted' }
            ]
        }).populate('fromUserId', 'firstName lastName emailId age')
          .populate('toUserId', 'firstName lastName emailId age');

        if (connections.length === 0) {
            return res.status(404).send("No connections found");
        }
        res.json(connections);
    }
    catch (error) {
        console.error("Error fetching connections:", error);
        res.status(400).send(error.message || "Server error");
    }
})

usersRouter.get("/users/feed", authToken, async (req, res) => {
    try{
        const loggedInUserId = req.user._id?.toString();
        if (!loggedInUserId) {
            return res.status(400).send("User not authenticated");
        }

        const developersFeed = await User.find({})
            .where('_id').ne(loggedInUserId) // Exclude the logged-in user
        
        res.json(developersFeed);
    }
    catch (error) {
        console.error("Error fetching connections:", error);
        res.status(400).send(error.message || "Server error");
    }
})


module.exports = usersRouter;

