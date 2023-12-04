import React from "react";
import PropTypes from "prop-types";
import "./movie-card.scss";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export const MovieCard = ({
  movie,
  onAddFavorite,
  onRemoveFavorite,
  isFavorite,
}) => {
  return (
    <Card className="h-100">
      <div className="movie-card-image-wrapper">
        <Card.Img variant="top" src={movie.imagePath} alt={movie.title} />
      </div>
      <Card.Body>
        <Card.Title>
          <strong>{movie.title}</strong>
        </Card.Title>
        <Link to={`/movies/${encodeURIComponent(movie._id)}`}>
          <Button variant="custom">More</Button>
        </Link>
        <div
          className={`heart-icon ${isFavorite ? "favorite" : ""}`}
          onClick={() =>
            isFavorite ? onRemoveFavorite(movie._id) : onAddFavorite(movie._id)
          }
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        ></div>
      </Card.Body>
    </Card>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    director: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    genre: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }).isRequired,
  onAddFavorite: PropTypes.func.isRequired,
  onRemoveFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
};
