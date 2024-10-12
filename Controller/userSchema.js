const { User , Playlist, Publiclist} = require("../Models/models");

const newuser = async (req, res) => {
    if (!req.body.email || req.body.email === 'undefined') {
        return res.status(400).json({ message: "Please provide a valid email." });
    }

    try {
        const signup = new User({
            email: req.body.email,
            password: req.body.password,
            profilePicture: req.body.profilePicture || "",
            playlists: []
        });

        const user = await signup.save();
        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Error saving user:', error);
        return res.status(500).json({ message: 'Failed to save user data', error: error.message });
    }
}

const loginuser = async (req, res) => {
    if (!req.body.email || req.body.email === 'undefined' || !req.body.password || req.body.password === 'undefined') {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    try {
        const email = req.body.email;
        const pass = req.body.password;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.password !== pass) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        return res.status(200).json({ message: "User found!" });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Failed to login', error: error.message });
    }
}


const newplaylist = async (req, res) => {
    try {
        // Find the user by email
        const type_list = req.body.type;
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Check if the playlist exists
        if (user.playlists && Array.isArray(user.playlists) && user.playlists.includes(req.body.name)) {
            return res.status(400).json({ message: 'Playlist Already exists' });
        }

        // Create the playlist
        const createplaylist = new Playlist({
            name: req.body.name,
            userid: user._id,  // Link the playlist to the user's ID
            songs: []
        });

        const savedPlaylist = await createplaylist.save();

        // If public, find or initialize the Publiclist document
        if (type_list === "public") {
            let publiclist = await Publiclist.findOne(); // Fetch the public list, assuming you have a single public list

            // If Publiclist doesn't exist, you need to initialize it
            if (!publiclist) {
                publiclist = new Publiclist({ playlists: [] });
            }

            // Ensure Publiclist.playlists is an array before pushing
            if (!publiclist.playlists) {
                publiclist.playlists = [];
            }
            publiclist.playlists.push(savedPlaylist._id);
            await publiclist.save(); // Now that publiclist is a valid document, this will work
        }

        // Ensure user.playlists is initialized
        if (!user.playlists) {
            user.playlists = [];
        }

        // Update the user's playlist array
        user.playlists.push(savedPlaylist._id);
        await user.save();

        return res.status(201).json({ message: "Playlist created successfully", playlist: savedPlaylist });
    } catch (err) {
        console.error('Error creating playlist:', err);
        return res.status(500).json({ message: "Playlist not created", error: err.message });
    }
};


module.exports = { loginuser, newuser , newplaylist };
