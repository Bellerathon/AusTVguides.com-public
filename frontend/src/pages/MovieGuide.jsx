import React from "react";
import "./MovieGuide.css";
import MovieCard from "../components/MovieGuide/MovieCard";
import { getDateTime, getDoW, checkDates, getYesterdaysDate } from "../helper";

function MovieGuide(props) {
  const { location } = props;
  let [movies, setMovies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const values = getDateTime();
  let timeNow = values[1];
  let todaysDate = values[0];

  React.useEffect(() => {
    getMovies(location);
  }, [location]);

  const getMovies = (location) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: location }),
    };
    fetch("/api/get_movies", requestOptions)
      .then((response) => response.json())
      .then((response) => {
        const arry = [];
        for (const [key, value] of Object.entries(response)) {
          arry.push(value);
        }
        return arry;
      })
      .then((guide) => {
        // If a user is viewing the guide between 12am and 3am
        if (timeNow > "00:00" && timeNow < "03:00") {
          return getYesterdaysMovies(guide);
        }
        return guide;
      })
      .then((res) => {
        setMovies(res);
      })
      .then(() => {
        setLoading(false);
      });
  };

  // fetch yesterdays Movie guide and return the movies that started yesterday and ended today
  const getYesterdaysMovies = (res) => {
    let moviesToAdd = [];
    res.forEach((movieArray) => {
      movieArray.forEach((movie) => {
        if (movie.date === getYesterdaysDate() && movie.military_stop < movie.military_start) {
          movie.date = todaysDate;
          movie.military_start = "00:00";
          moviesToAdd.push(movie);
        }
      });
    });

    // Sort the movies to be added into ascending time order (earliest start to latest start)
    moviesToAdd.sort((a, b) => b.start.localeCompare(a.start));

    return appendYesterdaysMovies(moviesToAdd, res);
  };

  // Append the movies found above to todays guide
  const appendYesterdaysMovies = (yesterdaysMovies, res) => {
    let newMovies = [...res];
    Object.entries(newMovies).forEach((k, v) => {
      if (k[1][0].date === todaysDate) {
        yesterdaysMovies.forEach((movie) => {
          k[1].unshift(movie);
        });
      }
    });

    return newMovies;
  };

  return !loading ? (
    <div className="movieguide">
      {movies.map(
        (element, index) =>
          checkDates(element[0].date, todaysDate) && (
            <div key={index} className="movieguide-wrapper">
              <div className="movieguide-date-title">
                <h1>{getDoW(element[0].date, todaysDate)}</h1>
              </div>
              <div className="movieguide-container">
                {element.map((movie, num) => {
                  switch (todaysDate === movie.date) {
                    case true:
                      movie.military_stop < movie.military_start ? (movie.military_stop = "23:59") : (movie.military_stop = movie.military_stop);
                      return (
                        ((movie.military_start <= timeNow && timeNow <= movie.military_stop) || movie.military_start >= timeNow) && (
                          <MovieCard movie={movie} key={num} />
                        )
                      );
                    case false:
                      return <MovieCard movie={movie} key={num} />;
                    default:
                      return <MovieCard movie={movie} key={num} />;
                  }
                })}
              </div>
            </div>
          )
      )}
    </div>
  ) : (
    <div className="md-page-loading">
      <div className="lds-facebook">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default MovieGuide;
