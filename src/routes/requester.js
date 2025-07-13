const express = require("express");
const authRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { authToken } = require("../middlewares/auth");

authRouter.post("/request/send/:status/:toUserId",authToken, async (req, res) => {
 try{
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id?.toString();

    if (!status || !toUserId) {
      return res.status(400).send("Status and toUserId are required");
    }

    const validStatuses = ['ignored', 'interested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const toUserIdExists = await User.findById(toUserId);
    if (!toUserIdExists) {
        return res.status(404).send("User with the provided toUserId does not exist");
    }

    const connectionRequestExists = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });
    if (connectionRequestExists) {
      return res.status(409).send("A connection request to this user already exists");
    }

    const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status
    })

    const data = await connectionRequest.save();

    res.json({
      message: "Connection request sent successfully",
      data: data
    });
 }
 catch (error) {
    console.error("Error during login:", error);
    return res.status(400).send(error.message || "Server error");
  } 
})

module.exports = authRouter;