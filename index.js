const express = require("express"),
  bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());

const auth = require("./auth")(app);
const passport = require("passport");
require("./passport");
const bcrypt = require("bcrypt");

const morgan = require("morgan");
const uuid = require("uuid");
const path = require("path");

const { check, validationResult } = require("express-validator");

const fs = require("fs");
const mongoose = require("mongoose");
const Models = require("./models");

const Movies = Models.Movie;
const Users = Models.User;

const { error } = require("console");

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://movieApp:159753mnJK@movieapp.vasbwq5.mongodb.net/MovieApp?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((e) => {
    console.log("successfully connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.static("public"));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//APIs

app.get("/", (req, res) => {
  res.send("Welcome to my movie API!");
});

//Get a list of ALL movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (error) {
      console.log(error);
      res.status(404).send("Not found");
    }
  }
);

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

//Add a new user
app.post(
  "/users",
  [
    check("username", "Username is required.").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required.").not().isEmpty(),
    check("email", "Email does not appear to be valid.").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashPassword = Users.hashPassword(req.body.password);
    try {
      const user = await Users.findOne({ username: req.body.username });
      if (user) {
        return res.status(400).send(req.body.username + " already exists");
      }
      const newUser = await Users.create({
        username: req.body.username,
        password: hashPassword,
        email: req.body.email,
        birthday: req.body.birthday,
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

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
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//Update a user's information (username)
app.put(
  "/users/:username",
  passport.authenticate("jwt", {
    session: false,
  }),
  [
    check("username", "Username is required.").not().isEmpty(),
    check(
      "username",
      "Username contains nonalphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required.").isEmpty(),
    check("email", "Email is required.").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const existingUser = await Users.findOne({
        username: req.params.username,
      });

      //check if the user exists
      if (!existingUser) {
        return res.status(404).send("User not found");
      }

      // Check if the username in the JWT payload matches the requested username
      if (req.user.username !== req.params.username) {
        return res.status(400).send("Permission denied");
      }

      existingUser.username = req.body.username;
      existingUser.password = req.body.password;
      existingUser.email = req.body.email;
      existingUser.birthday = req.body.birthday;

      const updatedUser = await existingUser.save();

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

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
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send("Something went wrong!");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on Port " + port);
});
