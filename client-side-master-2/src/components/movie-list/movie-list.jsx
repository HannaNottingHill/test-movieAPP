import React, { useState, useEffect, useCallback } from "react";
import MovieCard from "../movie-card/movie-card";
import "./movie-list.scss";

function MovieList({
  movies,
  user,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
}) {
  return (
    <div>
      <h2>Movies</h2>
      <ul>
        {movies.map((movie) => (
          <li key={movie._id}>
            {movie.title}
            {user && (
              <button
                onClick={() => {
                  if (favorites.some((fav) => fav === movie._id)) {
                    onRemoveFavorite(movie._id);
                  } else {
                    onAddFavorite(movie._id);
                  }
                }}
              >
                {favorites.some((fav) => fav === movie._id)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;
