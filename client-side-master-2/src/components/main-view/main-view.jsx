import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";
import { LoginView } from "../login-view/login-view";
import { SignupView } from "../signup-view/signup-view";
import { NavigationBar } from "../navigation-bar/navigation-bar";
import ProfileView from "../profile-view/profile-view";

export const MainView = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    // Check for stored user and token
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    } else {
      // If there's no user or token in localStorage, reset states
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    // Fetch movies if token is present
    if (token) {
      fetchMovies();
    }
  }, [token]);

  useEffect(() => {
    fetchUserData();
  }, [user, token, movies]);

  const fetchMovies = async () => {
    try {
      const response = await fetch("http://localhost:8080/movies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Handle response errors
        console.error("Failed to fetch movies:", response.status);
        return;
      }

      const moviesData = await response.json();
      setMovies(moviesData);
    } catch (error) {
      // Handle fetch errors
      console.error("Error fetching movies:", error);
    }
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setFavorites(userData.favorites || []); // Set favorites from fetched data
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onLoggedIn = (loggedUser, token) => {
    setUser(loggedUser);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
  };

  const onLoggedOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Function to add a movie to favorites
  const addFavorite = async (movieId) => {
    await fetch(
      `http://localhost:8080/users/${user.username}/movies/${movieId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setFavorites([...favorites, movieId]);
  };

  // Function to remove a movie from favorites
  const removeFavorite = async (movieId) => {
    await fetch(
      `http://localhost:8080/users/${user.username}/movies/${movieId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setFavorites(favorites.filter((id) => id !== movieId));
  };

  // Define the handleUserUpdate function
  const handleUserUpdate = async (updatedUserData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.username}`, // Ensure this is the correct username
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Ensure the token is valid
          },
          body: JSON.stringify(updatedUserData), // Ensure this contains username, email, and optionally password
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response error:", errorData);
        throw new Error("Error in updating profile: " + errorData.message);
      }

      const updatedUser = await response.json();
      setUser(updatedUser); // Update user in the state
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update user in localStorage
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Define the handleUserDeregister function
  const handleUserDeregister = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.username}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } else {
        throw new Error("Failed to delete user account");
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
    }
  };

  // Filter favorite movies
  const favoriteMovies = movies.filter((movie) =>
    favorites.includes(movie._id)
  );

  const handleFilterChange = (inputText) => {
    setFilterKeyword(inputText);
  };

  useEffect(() => {
    const filtered = movies.filter((movie) =>
      movie.title.toLowerCase().includes(filterKeyword.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [filterKeyword, movies]);

  return (
    <BrowserRouter>
      <NavigationBar
        user={user}
        onLoggedOut={() => onLoggedOut()}
        movies={movies}
        handleFilterChange={handleFilterChange}
        filterKeyword={filterKeyword}
        setFilteredMovies={setFilteredMovies}
      />

      <Row className="justify-content-md-center">
        <Routes>
          <Route
            path="/signup"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5}>
                    <SignupView />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5}>
                    <LoginView
                      onLoggedIn={(user, token) => {
                        setUser(user);
                        setToken(token);
                      }}
                    />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileView
                user={user}
                favoriteMovies={favoriteMovies}
                onUserUpdate={handleUserUpdate}
                onUserDeregister={handleUserDeregister}
                onAddFavorite={addFavorite}
                onRemoveFavorite={removeFavorite}
              />
            }
          />

          <Route
            path="/movies/:movieId"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" replace />
                ) : movies.length === 0 ? (
                  <Row>
                    <Col>The list is empty!</Col>
                  </Row>
                ) : (
                  <Col md={8}>
                    <MovieView movies={movies} />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Container>
                  <Row xs={1} md={2} lg={3} xl={3} xxl={4} className="g-4">
                    {filteredMovies.map((movie) => (
                      <Col key={movie._id}>
                        <MovieCard
                          movie={movie}
                          onAddFavorite={addFavorite}
                          onRemoveFavorite={removeFavorite}
                          isFavorite={favorites.includes(movie._id)}
                        />
                      </Col>
                    ))}
                  </Row>
                </Container>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Row>
    </BrowserRouter>
  );
};
