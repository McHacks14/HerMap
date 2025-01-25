const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: String,
    content: String,
    date: Date,
    toplevel: Boolean,
    comments: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
  });

const userSchema = new Schema({
  username: String,
  password: String
});

const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Post, User}