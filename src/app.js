const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const validateSignUpData = require("./utils/validateSignUpData");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { authToken } = require("./middlewares/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

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

app.post("/login", async (req, res) => {
    try{
        const  { emailId, password } = req.body;
        if (!emailId || !password) {
            return res.status(400).send("Email and password are required");
        }
        const user = await User.findOne({ emailId });

        if(!user) {
            return res.status(404).send("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
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

app.get("/profile",authToken,  async (req, res) => {
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

app.patch("/users/update/:userId", async (req, res) => {
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
