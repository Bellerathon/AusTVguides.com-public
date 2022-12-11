import React from "react";
import MovieDetailsModal from "./MovieDetailsModal";
import "./MovieCard.css";
import { getDateTime, getChannelImage } from "../../helper";

const MovieCard = (props) => {
  const { movie } = props;
  const [checked, setChecked] = React.useState(false);
  const longest = movie.tag.reduce((a, b) => (a.length < b.length ? a : b));
  return (
    <>
      {checked && <MovieDetailsModal movie={movie} setChecked={setChecked} />}
      <div
        className="movie-card"
        onClick={() => {
          setChecked(!checked);
        }}
        title={movie.title + " (" + movie.start + " - " + movie.end + ")"}
      >
        <div className="movie-card-poster">
          <img width="100%" height="100%" loading="lazy" src={"https://image.tmdb.org/t/p/w342" + movie.poster_path}></img>
        </div>
        <div className="movie-card-details">
          <div>
            <h3 className="movie-card-title">
              {movie.title} ({movie.year})
            </h3>
          </div>
          <ul className="movie-card-tags">
            <li key="1" className="movie-card-tags-item1">
              {movie.date === getDateTime()[0] && movie.military_start < getDateTime()[1] && getDateTime()[1] < movie.military_stop && (
                <div className="movie-dot" title="On-Now">
                  <div className="dot"></div>
                  <div className="live">LIVE: &nbsp;</div>
                </div>
              )}
              {movie.channel}
            </li>
            <li key="2" className="movie-card-tags-item2">
              {longest} - {movie.rating}
            </li>
          </ul>
          <div className="movie-card-time">
            {movie.start} - {movie.end}
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieCard;
