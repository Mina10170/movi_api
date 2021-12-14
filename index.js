const express = require('express');
  morgan = require('morgan');
  mongoose = require('mongoose');
 bodyParser = require("body-parser");
  Models = require('./models.js');
  const { check, validationResult } = require('express-validator');

const app = express();

// Module import
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;


//import * as atatus from 'atatus-spa';
//atatus.config('b5411a7a2ec644f3a8eeb95d14200f9b').install();

//atatus.notify(new Error('Test Atatus Setup'));


// Database connection
//mongoose.connect('mongodb://127.0.0.1/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect('mongodb+srv://myFlixDBadmin:12345@myflixdb.r1ncm.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
//let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
app.use(passport.initialize());
require('./passport');

// USE and GET requests

app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/documentation.html', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Get list of all movies

app.get("/movies", function (req, res) {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get requests for a specific movie by title

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then(movie => {
      res.json(movie);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get a list of all genres

app.get('/genres', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.find()
    .then((directors) => {
      res.status(201).json(directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a specific genre by name

app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then((genres) => {
      res.status(201).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get list of all directors

app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.find()
    .then((directors) => {
      res.status(201).json(directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

// Get Director by name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Add an user

app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' ' + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Add a movie to favorites

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { Favmovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

// Update an user's info by username

app.put('/user/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});


// Delete a user by username
app.delete('/user/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Babes, try again');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});