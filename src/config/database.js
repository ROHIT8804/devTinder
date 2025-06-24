const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://7165551rohitkumar:SjPvxkodIVqEtdgA@cluster0.4ekwdbn.mongodb.net/devTinder?retryWrites=true&w=majority&appName=Cluster0');
};

module.exports = connectDB;
