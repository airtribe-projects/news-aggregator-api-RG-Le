const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const newsRoutes = require('./src/routes/newsRoutes');

// All Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', newsRoutes);
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