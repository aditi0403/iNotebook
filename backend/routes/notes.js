const express= require('express');
const router = express.Router();
const Note = require('../models/Note'); 
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE 1: get all the notes using: GET '/api/notes/fetchallnotes'. login required
router.get('/fetchallnotes', fetchuser, async (req,res) => {
    try {
        const note = await Note.find({user: req.user.id})
    res.json(note) 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    
})
// ROUTE 2: Add a new note using: POSt '/api/notes/addnote'. login required
router.post('/addnote', fetchuser, [
    body('title', 'Provide a title for your note').isLength({min:3}),
    body('description', 'Description must be 6 characters long').isLength({min: 6})
], async (req,res) => {
    try {
        const {title, description, tag} = req.body;
    // if there are errors then return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json ({errors: errors.array()})
    };

    const note = new Note({
        title, description, tag, user: req.user.id
    })
    const savedNote = await note.save()

    res.json(savedNote)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    
})

// ROUTE 3: update an existing note using: PUT '/api/notes/updatenote'. login required
router.put('/updatenote/:id', fetchuser, async (req,res) => {
    const {title, description, tag}= req.body;
    try {
        // create a new note object
        const newNote = {};
        if(title) {newNote.title= title};
        if(description) {newNote.description= description};
        if(tag) {newNote.tag = tag};

        //find the ote to be updated and upodte it
        let note = await Note.findById(req.params.id);
        if(!note) {return res.status(404).send("Not Found")}
        if(note.user.toString() !== req.user.id) {return res.status(401).send("Not Allowed")};

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
        res.json({note});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    
 })

// ROUTE 4: delete an existing note using: DELETE '/api/notes/deletenote'. login required
router.delete('/deletenote/:id', fetchuser, async (req,res) => {
    const {title, description, tag}= req.body;

    try {
       //find the ote to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if(!note) {return res.status(404).send("Not Found")}

        //allow deletion only if user owns this note
        if(note.user.toString() !== req.user.id) {return res.status(401).send("Not Allowed")};

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"success": "note has been deleted", note: note}); 
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
    }
    
 })


module.exports = router

