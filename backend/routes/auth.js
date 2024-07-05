const express = require('express');
const User = require('../models/User'); 
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const cors = require('cors'); // Add this line

const app = express();

app.use(cors({ // Add this block
  origin: ['http://localhost:3000'], // adjust to your React app's origin
  credentials: true,
}));

const JWT_SECRET = 'taylorswift$is';

// ROUTE 1: create  a User using: POST '/api/auth/createuser'. No login required
router.post('/createuser',[
    body('name', 'Enter a name that is atleat 3 characters long').isLength({min:3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be 6 characters long').isLength({min: 6})
], async (req,res) => {
    let success= false;
    // if there are errors then return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json ({success, errors: errors.array()})
    };

    try {
        //check whether a user with this email exists already
        let user = await User.findOne({email: req.body.email});
        if (user) {
            return res.status(400).json({success, error: "Sorry a user with this email already exists :("})
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        //create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email, 
            password: secPass
        })

        const data= {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        console.log(authtoken);

        // res.json(user)
        success=true;
        res.json({success, authtoken});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    
})

// ROUTE 2: Authenticate  a User using: POST '/api/auth/login'. No login required
router.post('/login',[
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be empty').exists()
], async (req,res) => {
    let success= false;
    // if there are errors then return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json ({errors: errors.array()})
    };

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user){
            success= false;
            return res.status(400).json({error: "Login with correct credentials"});
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare){
            success= false;
            return res.status(400).json({success, error: "Login with correct credentials"});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authtoken});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3: get logged in User details using: POST '/api/auth/getuser'. login required
router.post('/getuser', fetchuser, async (req,res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})

module.exports = router;