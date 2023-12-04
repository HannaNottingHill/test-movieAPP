import React, { useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import "./movie-view.scss";

export const MovieView = ({ movies }) => {
  const { movieId } = useParams();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const movie = movies.find((m) => m._id === movieId);

  if (!movie) {
    return <div>Movie not found</div>;
  }

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div className="movie-view-container">
      <h1>
        {movie.title} ({movie.year})
      </h1>
      <img className="movie-image" src={movie.imagePath} alt={movie.title} />

      <div className="movie-info">
        <div className="movie-details">
          <p>
            {showFullDescription
              ? movie.description
              : `${movie.description.substring(0, 100)}...`}
            <button onClick={toggleDescription} className="description-button">
              {showFullDescription ? "Less" : "More"}
            </button>
          </p>
        </div>
        <div className="additional-details">
          <p>
            <strong>Director:</strong> {movie.director.name}
          </p>
          <p>
            <strong>Genre:</strong> {movie.genre.name}
          </p>
          <Link to={`/`}>
            <button className="back-button">Back</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
