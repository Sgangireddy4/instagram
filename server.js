const express = require('express');
const app = express();




const bodyparser = require('body-parser');
const passport = require('passport');

const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

// Body parser middleware
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// Connect to DB
mongoose.connect(db)
.then(()=> console.log('mongodb connected'))
.catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());
//passport configure
require('./config/passport')(passport);


app.get('/', (req, res)=> res.send('Hello!'));
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5300;
app.listen(port, () => console.log(`Server running on ${port}`));