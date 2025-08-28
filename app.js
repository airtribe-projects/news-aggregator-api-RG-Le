require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');

// Consts Def
const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_DB_URI

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Defination
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const newsRoutes = require('./src/routes/newsRoutes');

app.use('/users', authRoutes); // authorization routes
app.use('/users', userRoutes); // user preferences and other user related routes
app.use('/news', newsRoutes);

app.get('/', ( _ , res ) => {
    console.log('Welcome to the News Aggregator API');
    res.send('Welcome to the News Aggregator API');
});

mongoose.connect(DB_URI).then(() => {
    console.log("Database Connection Successfull!!");
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    }); 
}).catch((err) => {
    console.log(`Error Occured while connecting to DB: ${err}`);
});

module.exports = app;