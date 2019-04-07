const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
const Post = require('../../models/Post');
// Load Validation
const validateProfileInput = require('../../validation/profile');

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get('/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};
    const user = {};

    Profile.findOne({user: req.user.id})
      .then(profile => {
        if (!profile){
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        user.profile = profile;
      })
      .catch(err => res.status(404).json(err));
      
      Post.findOne({user: req.user.id})
      .then(posts => {
        if (posts){user.posts = posts;}
        res.json(user);
      })
      .catch(err => res.status(404).json(err));
  }

)

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  const user = {};

  Profile.findOne({ handle: req.params.handle })
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      user.profile  = profile;
    })
    .catch(err => res.status(404).json(err));

    Post.findOne({user: req.user.id})
      .then(posts => {
        if (posts){user.posts = posts;}
        res.json(user);
    })
      .catch(err => res.status(404).json(err));

});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  const user = {};

  Profile.findOne({ handle: req.params.handle })
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      user.profile  = profile;
    })
    .catch(err => res.status(404).json(err));

    Post.findOne({user: req.user.id})
      .then(posts => {
        if (posts){user.posts = posts;}
        res.json(user);
    })
      .catch(err => res.status(404).json(err));
});


//@route POST api/profile/user/follow/:user_id
// @desc    follow someone's profile
// @access  Private

router.post(
  '/follow/:user_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findbyId(req.params.id)
        .then(profile => {
          if (profile.followers.filter(follow => follow.user.toString() === req.user.id).length > 0) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already following this Profile' });
            }

          // Add user id to likes array
          profile.followers.unshift({ user: req.user.id });
          profile.save().then(profile=> res.json(profile));
          Profile.findbyId(req.user.id)
        .then(myprofile => {
          myprofile.following.unshift({ user: req.params.id });
          myprofile.save().then(profile=> res.json(profile));

        }).catch(err => res.status(404).json({ myprofilenotfound: 'No profile found'}))
      })

        .catch(err => res.status(404).json({ profilenotfound: 'No profile found' }));
    });
  


// @route   POST api/posts/unfollow/:user_id
// @desc    Unfollow a user account
// @access  Private
router.post(
  '/unfollow/:user_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findbyId(req.params.id).then(profile => {
          if (
            profile.followers.filter(follow => follow.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notfollowed: 'You are not following this Profile' });
          }

          // Get remove index
          const removeIndex = profile.followers
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          profile.followers.splice(removeIndex, 1);

          // Save
          profile.save().then(profile => res.json(profile));
          Profile.findbyId(req.user.id)
        .then(myprofile => {
          const removeIndex = myprofile.following.map(item => item.user.toString()).indexOf(req.params.id);
          myprofile.following.splice(removeIndex, 1);
          myprofile.save().then(profile=> res.json(profile));
        })
        .catch(err => res.status(404).json({ myprofilenotfound: 'No profile found'}))
      })
        .catch(err => res.status(404).json({ profilenotfound: 'No profile found' }));
    });
  

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    // Hobbies- Spilt into array
    if (typeof req.body.hobbies !== 'undefined') {
      profileFields.hobbies = req.body.hobbies.split(',');
    }

    Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle })
        .then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }
         // Save Profile
         new Profile(profileFields)
         .save()
         .then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        Post.findOneAndRemove({ _id: req.user.id }).then(() =>res.json({ success: true }));
    });
  })
});



module.exports = router;