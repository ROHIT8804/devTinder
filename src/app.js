const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();
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

    app.post('/signup',async(req,res)=>{
        // Creating a new instance of the User model
        const user = new User({
            firstName: 'Rohit',
            lastName: 'Kumar',
            emailId: 'rk@gmail.com',
            password:'test@12345'
        })

        try{
            // Validate the user data before saving
            await user.save()
            res.send('User created successfully');
        } catch (error) {
            console.error("Validation error:", error);
            return res.status(400).send('Validation failed');
        }
        
    })


    app.use((err, req, res, next) => {
        console.error("Error caught:", err.stack);
        res.status(500).send('Something broke!');
    });


    connectDB()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    })
    })
        .catch((err) => {
        console.error("Database connection error:", err);
    });

