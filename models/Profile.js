const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  handle: {
    type: String,
    required: true,
    max: 40
  },  
  location: {
    type: String
  },

  hobbies: {
    type: [String],
    required: true
  },

  bio: {
    type: String
  },

  followers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
  }],

  following: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
  }],

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);