const mongoose = require('mongoose');

const UserSchema = new  mongoose.Schema({
    email:{type: String, required: true,unique: true},
    password:{type: String, required: true, unique: true},
    profilePicture: { type: String }, // URL to the profile picture
    createdAt:{type: Date, default: Date.now},
    playlists:[{type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}] // Array of playlist IDs
});

const SongSchema = new mongoose.Schema({
    title:{type: String, required: true, unique: true},
    artist:{type: String, required: true},
    album: { type: String }, // Optional
    genre: { type: String },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,  // This will reference the file stored in GridFS
        ref: 'uploads.files' // Referencing the GridFS collection where the files are stored
    },
    createdAt: { type: Date, default: Date.now }
});

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bio: { type: String },
    profilePicture: { type: String }, // URL to the artist's profile picture
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Array of song IDs
    createdAt: { type: Date, default: Date.now }
});


const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Array of song IDs
    createdAt: { type: Date, default: Date.now }
});


const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Array of song IDs
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['public', 'private'], default: 'private' },
    // updatedAt: { type: Date, default: Date.now }
});


const publicSchema = new mongoose.Schema({
    playlists:[{type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}]
});


const User = mongoose.model('User',UserSchema);
const Song = mongoose.model('Song',SongSchema);
const Artist = mongoose.model('Artist',artistSchema);
const Album = mongoose.model('Album',albumSchema);
const Playlist = mongoose.model('Playlist',playlistSchema);
const Publiclist = mongoose.model('Publiclist',publicSchema);

module.exports={User,Song,Artist,Album,Playlist,Publiclist};