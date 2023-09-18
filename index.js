const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const path = require("path");

const fs = require("fs");
const mongoose = require("mongoose");
const Models = require("./models");

const Movies = Models.Movie;
const Users = Models.User;

const moviesData = require("./DB.json/movies.json");
const usersData = require("./DB.json/users.json");
const { error } = require("console");

mongoose.connect("mongodb://localhost:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("public"));
app.use(morgan("dev"));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//set up logger
app.use(morgan("combined", { stream: accessLogStream }));

//default text response when at /
app.get("/", (req, res) => {
  res.send("Welcome to MoviesApp!");
});

//APIs

app.get("/", (req, res) => {
  res.send("Welcome to my movie API!");
  // You can replace this message with your own.
});

//Get a list of ALL movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Get data about a single movie by title
app.get("/movies/:title", async (req, res) => {
  try {
    const movie = await Movies.findOne({ title: req.params.title });
    if (!movie) {
      res.status(404).send("Movie not found");
    } else {
      res.json(movie);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Get data about genre by title
app.get("/movies/:title/:genre", async (req, res) => {
  try {
    const { title, genre } = req.params;
    const movies = await Movies.find({ title, genre });
    if (!movies || movies.length === 0) {
      res
        .status(404)
        .send("No movies found for the specified title and genre.");
    } else {
      res.json(movies);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Get data about the director by name
app.get("/director/:name", async (req, res) => {
  const directorName = req.params.name;

  try {
    const director = moviesData.find(
      (movie) =>
        movie.Director.Name.toLowerCase() === directorName.toLowerCase()
    );
    if (!director) {
      res.status(400).send("Director not found");
      return;
    }
    res.status(200).json(director.Director);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Add a new user !!
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get all users
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username
app.get("/users/:Username", async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Update a user's information (username)
app.put("/users", (req, res) => {
  const oldUsername = req.params.Username;
  const newUsername = req.body.newUsername;

  try {
    const user = usersData.find((user) => user.username === oldUsername);
    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    const usernameExists = usersData.some(
      (user) => user.username === newUsername
    );
    if (usernameExists) {
      res.status(400).send("New username already exists");
      return;
    }

    user.username = newUsername;

    res.status(200).send("Username updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Add a movie to a user's favorites list
app.put("/users/:Username/favorites/:MovieTitle", async (req, res) => {
  const username = req.params.Username;
  const movieTitleToAdd = req.params.MovieTitle;

  try {
    const user = usersData.find((user) => user.username === username);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    if (user.favorites.includes(movieTitleToAdd)) {
      res.status(400).send("Movie already in user's favorites");
      return;
    }
    user.favorites.push(movieTitleToAdd);

    res.status(200).send("Movie added to favorites successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Remove a movie from the favorites list
app.delete("/users/:Username/favorites/:MovieTitle", async (req, res) => {
  const username = req.params.Username;
  const movieTitleToDelete = req.params.MovieTitle;

  try {
    const user = usersData.find((user) => user.username === username);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    const movieIndex = user.favorites.indexOf(movieTitleToDelete);
    if (movieIndex === -1) {
      res.status(404).send("Movie not found in user's favorites");
      return;
    }
    res.status(200).send("Movie removed from favorites successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Remove users account from the users database
app.delete("/users/:Username", async (req, res) => {
  const usernameToDelete = req.params.Username;

  try {
    const deletedUser = usersData.find(
      (user) => user.username === usernameToDelete
    );
    if (!deletedUser) {
      res.status(404).send("User not found");
    } else {
      usersData = usersData.filter(
        (user) => user.username !== usernameToDelete
      );
      res.status(200).send("User deleted successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//server port 3030
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
