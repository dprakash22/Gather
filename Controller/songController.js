// const { gridfsBucket } = require('../server.js'); // Import GridFS and GridFSBucket setup
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {Song}= require('../Models/models.js'); // Import the Song schema


dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const storage = new GridFsStorage({
    url: MONGO_URI,
    file: (req,file)=>{
        return {
            filename: file.originalname,
            bucketName: 'uploads',  // Collection name for the files
            metadata: { contentType: file.mimetype }
        };
    }
});

// Error handling for GridFsStorage connection
storage.on('connection', (db) => {
    console.log('Connected to GridFS');
}).on('error', (error) => {
    console.error('GridFS connection error:', error);
});


const upload = multer({ storage }).single('file'); // Single file upload

const uploadSong =async (req,res)=>{
    upload(req,res,(err)=>{
        if(err){
            return res.status(500).json({message:"Song upload failed", error:err});
        }    
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        console.log("file details", file);
        // Create a new Song document using the file's metadata
        const newSong = new Song({
            title: req.body.title,
            artist: req.body.artist,
            album: req.body.album || 'Unknown',
            genre: req.body.genre || 'Unknown',
            fileId: file.id || file._id // The ID of the file stored in GridFS
        });

        console.log('Saving song with data:', newSong);

        // Save the song metadata to MongoDB
        try{
            newSong.save()
            .then((savedSong) => {
                res.status(201).json({ message: 'Song uploaded successfully', song: savedSong });
            })
            .catch((error) => {
                console.error('Error saving song metadata:', error);  // Improved logging
                res.status(500).json({ message: 'Failed to save song metadata', error: error.message });
            });
        }catch(err){
            console.log("incoming",err)
        }
    });
};


let gridfsBucket;

const getSong = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'No song ID provided' });
    }

    console.log('Fetching song with filename:', id);

    try {
        // Initialize gridfsBucket
        const conn = mongoose.connection;
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

        const objectId = new mongoose.Types.ObjectId(id);

        // Use findOne with promises
        //this search based on name -------------
        // const file = await gridfsBucket.find({ filename: id }).limit(1).next();
        ////this search based on Id -------------
        const file = await gridfsBucket.find({_id:objectId }).limit(1).next();

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if file is an audio file
        if (file.contentType === 'audio/mpeg' || file.contentType === 'audio/mp3') {
            const readStream = gridfsBucket.openDownloadStream(file._id);

            // Error handling for the read stream
            readStream.on('error', (err) => {
                return res.status(500).json({ message: 'Error reading file', error: err });
            });

            // Set proper headers for audio file
            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

            // Stream the audio file to the response
            readStream.pipe(res);
        } else {
            res.status(400).json({ message: 'File is not an audio file' });
        }

    } catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {uploadSong, getSong};