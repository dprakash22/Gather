const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const { Playlist, User } = require('../Models/models');

let gridfsBucket;

const addsongs = async (req, res) => {
    const filename = req.body.songid;
    const playlistname = req.body.playlistname;
    const userid = req.body.userid;

    if (!filename) {
        return res.status(404).json({ message: "Song not found" });
    }

    try {
        // Initialize gridfsBucket
        const conn = mongoose.connection;
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

        // Find file by filename in GridFS
        const file = await gridfsBucket.find({ filename: filename }).limit(1).next();
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Find the user by ID
        const whichUser = await User.findOne({ _id: userid });
        if (!whichUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the playlist by name and ensure it belongs to the user
        const playlist = await Playlist.findOne({ name: playlistname, userid: userid });
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found or does not belong to the user' });
        }

        // Check if song is already in the playlist
        if (!playlist.songs.includes(file._id)) {
            playlist.songs.push(file._id); // Add the file ID to the songs array
        } else {
            return res.status(400).json({ message: 'Song is already in the playlist' });
        }

        await playlist.save();

        res.status(200).json({ message: 'Song added to playlist successfully', playlist });

    } catch (e) {
        res.status(500).json({ message: "Error in adding song to playlist", error: e });
    }
}

module.exports = { addsongs };
