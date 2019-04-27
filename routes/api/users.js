const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load user model
const User = require('../../models/User')
// @route POST api/users/register
// @desc Register user
// @access public

// Load input validation
const  validateRegisterInput = require('../../validation/register');
const  validateLoginInput = require('../../validation/login');

router.post('/register', (req, res)=> {

    const {errors, isValid} = validateRegisterInput(req.body);

    //check validation
    if (!isValid){return res.status(400).json(errors)};

    User.findOne({email: req.body.email})
    .then(user => {
        
        if(user) {
            errors.email  = 'Email already exists'
            return res.status(400).json(errors)
        }
        else {
            const pic = gravatar.url(req.body.email,{s:'200', r:'pg', d: 'mm'});
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar: pic,
            });
            bcrypt.genSalt(10,(err, salt)=> {
                errors.password = 'Failed, could not generate salt'
                if(err) {return res.status(400).json(errors);}
                bcrypt.hash(newUser.password, salt, (err, hash)=> {
                    errors.password = 'Could not hash'
                    if(err) {return res.status(400).json(errors);}
                    newUser.password = hash;
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            })
        }
    })
    .catch(err => console.log('cant findOne'));
})



// @route POST api/users/login
// @desc Login user
// @access public
router.post('/login', (req, res)=> {
    const {errors, isValid} = validateLoginInput(req.body);
    //check validation
    if (!isValid){return res.status(400).json(errors)};    
    
    User.findOne({email: req.body.email})
    .then(user =>{
        if (!user){return res.status(400).json({email: 'User email id not found'});}
        // Check encrypted password
        bcrypt.compare(req.body.password, user.password)
        .then(isMatch => {
            if (isMatch){
                //Usermatched, create payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                };

                //Sign.token
                jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token)=> {
                    return res.json({success: true, token: 'Bearer '+token});
                })

            }
            else {return res.status(400).json({password: 'Password incorrect'});}
            });
    })
    .catch(err=>console.log(err));
})

// @route GET api/users/current
// @desc Returns current user information
// @access private

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res)=>{res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
})})




module.exports = router; 