const express = require('express');
const app = express();

const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI
// Connect to DB
mongoose.connect(db)
.then(()=> console.log('mongodb connected'))
.catch(err => console.log(err));

const bodyparser = require('body-parser');
// Body parser middleware
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());


const passport = require('passport');
//passport middleware
app.use(passport.initialize());
//passport configure
require('./config/passport')(passport);


const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')
// app.get('/', (req, res)=> res.send('Hello!'));
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5300;
app.listen(port, () => console.log(`Server running on ${port}`));