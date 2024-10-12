// controllers/playlistController.js
const {Playlist ,User} = require('../Models/models');

// Get all playlists
// const getAllPlaylists = async (req, res) => {
//     try {
//         const playlists = await Playlist.find().populate('name','createdAt'); // Populate the user if needed
//         return res.status(200).json(playlists);
//     } catch (err) {
//         console.error('Error fetching playlists:', err);
//         return res.status(500).json({ message: 'Unable to fetch playlists', error: err.message });
//     }
// };


// Get all public playlists (only name and _id)
const getAllPlaylists = async (req, res) => {
    try {
        // Find playlists that are public and only return their name and _id
        const playlists = await Playlist.find({ type: 'public' }, '_id name'); // Filter by public and project name, _id
        
        if (!playlists.length) {
            return res.status(404).json({ message: 'No public playlists found' });
        }

        return res.status(200).json(playlists);
    } catch (err) {
        console.error('Error fetching playlists:', err);
        return res.status(500).json({ message: 'Unable to fetch playlists', error: err.message });
    }
};


const getUserPlaylists = async (req, res) => {
    try {
        const { userid } = req.query;

        // Check if `userid` is provided
        if (!userid) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find the user by ID and populate the playlists array
        const user = await User.findById(userid).populate('playlists', '_id name'); // Populate with playlist details
        console.log("user",user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If no playlists exist, return an empty array
        if (!user.playlists.length) {
            return res.status(200).json({ message: 'No playlists found for this user', playlists: [] });
        }

        // Return the populated playlists
        return res.status(200).json(user.playlists);
    } catch (err) {
        console.error('Error fetching user playlists:', err);
        return res.status(500).json({ message: 'Unable to fetch playlists', error: err.message });
    }
};


//display songs--
const displaysongs = async (req,res)=>{
    try{
        const {id} = req.query;
        if(!id){
            return res.status(400).json({ message: 'User ID is required' });
        }
        const songlist = await Playlist.findById(id);

        if(!songlist){
            return res.status(404).json({ message: 'playlist not found' });
        }
        
        console.log("songlist",songlist);

        if(!songlist.songs.length){
            return res.status(200).json({ message: 'No songs found for this playlist', songs: []});
        }

        return res.status(200).json(songlist.songs);
    } catch (err) {
        console.error('Error fetching playlist songs:', err);
        return res.status(500).json({ message: 'Unable to fetch songs', error: err.message });
    }
}



module.exports = { getAllPlaylists,getUserPlaylists, displaysongs };
