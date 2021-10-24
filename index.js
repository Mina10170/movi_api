const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common')); //Middelware for logger.
app.use(express.static('public')); //Middleware for static files.

// Note that app routing is required in any Express application, so you’ll need to define it in your myFlix application. Along with app routing, you’ll also need to define one middleware function for logging your request, and another one for authenticating your users. The order in which you should do so is as follows:

// App routing
// Note that app routing is rarely a single function, rather, multiple functions depending on the number of routes you want to specify for your app. You’ll learn more about user authentication later in this Achievement.

//Created a topMovies list.
let topMovies = [
  {
    title: 'The Shawshank Redemption',
    genre: ['Prison', 'Drama', 'Crime Fiction'],
    director: { name: 'Frank Darabot' },
  },
  {
    title: 'The Godfather',
    genre: ['Mafia', 'Drama', 'Crime Fiction'],
    director: { name: 'Francis Ford Coppoia' },
  },
  {
    title: 'The Godfather: Part II',
    genre: ['Mafia', 'Drama', 'Crime Fiction'],
    director: { name: 'Francis Ford Coppoia' },
  },
  {
    title: '12 Angry Men',
    genre: ['Drama', 'Trial Drama', 'Crime Film'],
    director: { name: 'Sidney Lumet' },
  },
  {
    title: 'Schindlers List ',
    genre: ['War', 'History', 'Black and White'],
    director: { name: 'Steven Spielberg' },
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    genre: ['Novel', 'Fantasy Fiction', 'Adventure Fiction'],
    director: { name: 'Peter Jackson' },
  },
  {
    title: 'Pulp Fiction',
    genre: ['Comedy', 'Mafia', 'Crime Film'],
    director: { name: 'Quentin Tarantino' },
  },
  {
    title: 'The Good, the Bad and the Ugly',
    genre: ['Spaghetti Western', 'Western', 'Action'],
    director: { name: 'Sergio Leone' },
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    genre: ['Novel', 'Fantasy Fiction', 'Adventure Fiction'],
    director: { name: 'Peter Jackson' },
  },
];

// GET requests

//Get the home page of myFLix App.
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});

// Get Documentation on Request, URL, and Response formats.
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Get a list of all movies to the users.
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});