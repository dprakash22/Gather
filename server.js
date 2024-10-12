const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const router = require('./Router/router.js');
const cors = require('cors');

// Initialize the app
const app = express();

dotenv.config();

// Middleware to parse JSON
app.use(express.json());

// Use morgan middleware for logging HTTP requests
app.use(morgan('dev'));

// Enable CORS
app.use(cors());

// Use your router
app.use('/gather', router);

// Choose the port for the server to run on
const PORT = process.env.PORT || 5500;
const MONGO_URI = process.env.MONGO_URI;

let gridfsBucket;

app.listen(PORT, async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected...');

        // // Initialize GridFSBucket
        const conn = mongoose.connection;
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
        console.log('GridFSBucket initialized...');
        // console.log("grid",gridfsBucket);
        
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }

    console.log(`Server running on port ${PORT}`);
});

// Export gridfsBucket to use in other modules
module.exports = { gridfsBucket };
