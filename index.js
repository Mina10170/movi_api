const express = require('express'),
  morgan = require('morgan');
  mongoose = require('mongoose'),
 bodyParser = require("body-parser"),
  Models = require('./models.js');

const app = express();
const Movies = Models.Movie,
      Users = Models.User,
      Directors = Models.Director,
      Genres = Models.Genre;

mongoose.connect('mongodb://127.0.0.1/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(morgan('common')); //Middelware for logger.
app.use(express.static('public')); //Middleware for static files.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require("./auth")(app);

const passport = require('passport');
require('./passport');



// Get the list of ALL movies
app.get('/movies',
  passport.authenticate("jwt", { session: false }),(req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + err);
      });
  });

// Add new movie

app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("body: ", req.body);
    Movies.findOne({ Title: req.body.Title })
      .then(movie => {
        if (movie) {
          return res.status(400).send(req.body.Title + "already exists");
        } else {
          Movies.create({
            Title: req.body.Title,
            Description: req.body.Description,
            Genre: {
              Name: req.body.Genre.Name,
              Description: req.body.Genre.Description
            },
            Director: {
              Name: req.body.Director.Name,
              Bio: req.body.Director.Bio,
              Birth: req.body.Director.Birth,
              Death: req.body.Director.Death
            },
            Actors: req.body.Actors,
            ImagePath: req.body.ImagePath,
            Featured: req.body.Featured
          })
            .then(movie => {
              res.status(201).json(movie);
            })
            .catch(error => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

  //Get a list of all Genres
  app.get('/genres',passport.authenticate("jwt", { session: false }), (req, res) => {
    Genres.find()
    .then((genres) => {
      res.status(201).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  //Get a genre by name
  app.get('/genres/:Name',passport.authenticate("jwt", { session: false }),(req, res) => {
    Genres.findOne({Name: req.params.Name})
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
  })

// Get data about a movie by title
app.get('/movies/:Title',passport.authenticate("jwt", { session: false }),(req, res) => {
    Movies.findOne({Title: req.params.Title})
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {//error callback
            console.error(err);
            res.status(500).send('Error: ' + err);
    });
});

// Get data about movies by genre
app.get('/movies/Genre/:Name', (req, res) => {
    Movies.find({"Genre.Name": req.params.Name})
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//get data of all directors
app.get('/directors',passport.authenticate("jwt", { session: false }), (req, res) => {
    Directors.find()
    .then((directors) => {
        res.status(201).json(directors);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });;
})

//Get data of a director's information by name
app.get('/directors/:Name',passport.authenticate("jwt", { session: false }),(req, res) => {
    Directors.findOne({Name: req.params.Name})
    .then((director) => {
        res.status(201).json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users',passport.authenticate("jwt", { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username',passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Remove a movie to a user's list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Remove an existing user
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});