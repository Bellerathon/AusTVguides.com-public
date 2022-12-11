import React from "react";
import "./MovieDetailsModal.css";
import MovieDetails from "../../pages/MovieSearch";

const MovieDetailsModal = (props) => {
  const { setChecked, movie } = props;
  const [detailsChecked, setDetailsChecked] = React.useState(false);
  return (
    <>
      {detailsChecked && <MovieDetails movie={movie} setDetailsChecked={setDetailsChecked} />}
      
      <div className="test">
        <div
          className="movie-details-backdrop"
          style={{
            backgroundImage: "linear-gradient(0deg, #181616 5%, transparent 100%), url(http://image.tmdb.org/t/p/original/" + movie.backdrop_path + ")",
          }}
        >
          <button className="movie-details-exit-button" onClick={() => setChecked(false)}>
            &#10005;
          </button>
          <div title="View more info" className="movie-details-title">
            {movie.title} ({movie.year})
          </div>
        </div>
        <div className="movie-details-content">
          <div className="movie-details-overview">
            <b>Plot:</b> {movie.desc}
          </div>
          <br />
          {movie.trailer !== "N/A" ? (
            <div className="movie-details-trailer">
              <iframe
                width="100%"
                height="100%"
                src={"https://www.youtube.com/embed/" + movie.trailer}
                title="YouTube video player"
                frameBorder="0"
                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          ) : (
            <div className="movie-details-overview">
              <b>Trailer:</b> {movie.trailer}
            </div>
          )}
        </div>
        <button className="more-details-button" onClick={() => setDetailsChecked(true)}>
          Click here to show more information
        </button>
      </div>
      <div className="movie-details-wrapper" onClick={() => setChecked(false)}></div>
    </>
  );
};

export default MovieDetailsModal;
