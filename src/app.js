const express = require('express');

const app = express();

app.use('/',(req,res)=>{
    console.log('Middleware executed');
    res.send('Namaste Express');
})

app.use('/about',(req,res)=>{
    res.send('About Page');
})

app.use('/contact',(req,res)=>{
    res.send('Contact Page');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})