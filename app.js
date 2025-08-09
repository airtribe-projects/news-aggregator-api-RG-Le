const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./src/routes/authRoutes');

// All Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    console.log('Welcome to the News Aggregator API');
    res.send('Welcome to the News Aggregator API');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;