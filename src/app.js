const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

// const adminAuth = require('./middlewares/auth');

// app.use('/admin', adminAuth.adminAuth);

// app.get('/admin/allDetails', (req, res) => {
//     console.log("Admin Details");
//     res.send('Admin Details Page');
// })

// app.get('/user/:userID',(req,res)=>{
//     console.log("userID: ",req.params.userID);
//     res.send('New User');
// })

// app.get('/country', (req, res) => {
//     console.log("Country: 1");
//     res.send('Country Page 1');
// })

// app.get('/country', (req, res,next) => {
//     console.log("Country: 2");
//     next();
// })

// app.use('/about',(req,res)=>{
//     res.send('About Page');
// })

// app.use('/contact',(req,res)=>{
//     res.send('Contact Page');
// })

// app.use("/register",(req,res,next)=>{
//         next()
//         // res.send('Register Page 1');
//     },
//     (req, res) => {
//         res.send('Register Page 2');
//     },
//     (req, res) => {
//         res.send('Register Page 3');
//     },
//     (req, res) => {
//         res.send('Register Page 4');
//     }
// )

app.post("/signup", async (req, res) => {
    // Creating a new instance of the User model
    const user = new User(req.body);
    console.log("User Data:", user);
    try {
        // Validate the user data before saving
        await user.save();
        res.send("User created successfully");
    } catch (error) {
        console.error("Validation error:", error);
        return res.status(400).send("Validation failed");
    }
});

app.get("/users", async (req, res) => {
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

app.get("/feed", async (req, res) => {
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

app.patch("/users/update", async (req, res) => {
    try {
        // Email can not be updated.
        const ALLOWED_FIELDS = ["firstName", "lastName", "password", "age"];
        console.log("Request body:", req.body);
        const {userId, ...updatedData} = req.body;
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

app.use((err, req, res, next) => {
    console.error("Error caught:", err.stack);
    res.status(500).send("Something broke!");
});

connectDB()
.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
})
.catch((err) => {
    console.error("Database connection error:", err);
});
