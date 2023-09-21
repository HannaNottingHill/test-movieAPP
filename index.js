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

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/cfDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((e) => {
    console.log("successfully connected to DB");
  })
  .catch((err) => {
    console.log(err);
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
    res.status(200).json(movies);
  } catch (error) {
    console.log(error);
    res.status(404).send("Not found");
  }
});

//Get data about a single movie by title
app.get("/movies/:title", async (req, res) => {
  try {
    const movie = await Movies.findOne({ title: req.params.title });
    res.json(movie);
  } catch (error) {
    console.log(error);
    res.status(404).send("Not found");
  }
});

//Get data about genre by title
app.get("/movies/genre/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const movie = await Movies.findOne({ title: title });

    if (!movie) {
      res.status(404).send("Movie not found");
    } else {
      const genre = movie.genre;
      res.json(genre);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Get data about the director by name
app.get("/movies/director/:name", async (req, res) => {
  try {
    const directorName = req.params.name;
    const director = await Movies.find({
      "director.name": directorName,
    });

    res.status(200).json(director);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Add a new user !!/; ////THIS
app.post("/users", async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.body.username });
    if (user) {
      return res.status(400).send(req.body.username + " already exists");
    }
    const newUser = await Users.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Create a new user
app.post("/users", async (req, res) => {
  try {
    // Create a new User instance from the request body
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user." });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(201).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Get a user by username
app.get("/users/:username", async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
    res.json(user);
  } catch (err) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Update a user's information (username)
app.put("/users/:username", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Add a movie to a user's favorites list
app.post("/users/:username/:movieId", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { favorites: req.params.movieId },
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// Remove a movie from the favorites list
app.delete("/users/:username/:movieId", async (req, res) => {
  try {
    const username = req.params.username;
    const movieId = req.params.movieId;
    const user = await Users.findOne({ username: username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if user has favorites array, and if not, initialize it as an empty array
    if (!user.favorites) {
      user.favorites = [];
    }

    // Filter out the movie from the favorites
    const filteredMovies = user.favorites.filter(
      (currentMovieId) => currentMovieId.toString() !== movieId
    );

    // Update the user's favorites
    user.favorites = filteredMovies;

    // Save the updated user
    await user.save();

    res.status(200).send("Movie removed from favorites successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error.message);
  }
});

// Delete a user by username
app.delete("/users/:username", async (req, res) => {
  try {
    const deleted = await Users.findOneAndRemove({
      username: req.params.username,
    });
    if (!deleted) {
      res.status(400).send(req.params.username + " was not found");
    }
    res.status(200).send(req.params.username + " was deleted.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//server port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
