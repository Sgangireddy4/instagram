const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema - an array of post objects - that are images with captions and info on who all liked that photo etc.
const PostSchema = new Schema([{
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  image: {
    type: String,
    required: true
  },

  caption: {
    type: String,
    required: true
  },

  name: {
    type: String
  },

  avatar: {
    type: String
  },
  
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
}]);

module.exports = Post = mongoose.model('post', PostSchema);
