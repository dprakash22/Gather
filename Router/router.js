const express = require('express');

const {uploadSong, getSong }= require('../Controller/songController.js');
const { addsongs } = require('../Controller/playlistController.js');
const { newuser, loginuser, newplaylist } = require('../Controller/userSchema.js');
const {getAllPlaylists, getUserPlaylists, displaysongs} = require('../Controller/displaycontroller.js')

const router = express.Router();

//user
router.post('/signup',newuser);
router.post('/login',loginuser);
router.post('/addplaylist',newplaylist);

//songs
router.post('/upload', uploadSong);
router.get('/song', getSong);

//playlist
router.post('/addsong',addsongs);


//displaycontroller
router.get('/displaypublic',getAllPlaylists);
router.get('/UserPlaylists',getUserPlaylists);
router.get('/displaysongs',displaysongs);


module.exports=router;