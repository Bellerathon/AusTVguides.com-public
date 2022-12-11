import React from "react";
import "./MovieSearch.css";
import { getChannelImage } from "../helper";

function MovieDetails(props) {
  const { setDetailsChecked, movie } = props;
  const [cast, setCast] = React.useState([]);
  const [director, setDirector] = React.useState("");
  const [providers, setProviders] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [poster, setPoster] = React.useState("");
  const [backdrop, setBackdrop] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [genre, setGenre] = React.useState("");
  const [length, setLength] = React.useState("");
  const [year, setYear] = React.useState("");
  const [rating, setRating] = React.useState("");
  const [trailer, setTrailer] = React.useState("");

  React.useEffect(() => {
    (Object.keys(movie).length) === 19 ? parseDetails() : getMovieDetails(false);
    getMovieHistory();
  }, [movie.title]);

  const parseDetails = () => {
    setBackdrop(movie.backdrop_path);
    setPoster(movie.poster_path);
    setRating(movie.vote_average);
    setDesc(movie.desc);
    setGenre(movie.tag[0]);
    setLength(movie.runtime);
    setYear(movie.year);
    setTrailer(movie.trailer);
    getMovieDetails(false);
  }

  const getMovieDetails = (limited) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: movie.imdb_id, name: movie.title, desc: movie.desc }),
    };
    fetch("/api/get_movie_details", requestOptions)
      .then((response) => response.json())
      .then((res) => {
        setDirector(res["director"]);
        setCast(res['cast'].split('+'));
        setProviders(res['providers'].split('+'));

        if (!(limited)) {
          setBackdrop(movie.backdrop ? movie.backdrop : res.backdrop_path);
          setPoster(movie.poster ? movie.poster : res.poster_path);
          setRating(movie.score ? movie.score : res.vote_average);
          setDesc(movie.desc ? movie.desc : res.overview);
          setGenre(movie.genre ? movie.tag[0] : res.genre);
          setLength(movie.length ? movie.length : res.runtime);
          setYear(movie.year ? movie.year : res.year);
          setTrailer(movie.trailer ? movie.trailer : res.trailer);
        }
      })
      .then(() => {
        setLoading(false);
      });
  };

  const getMovieHistory = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: movie.title, year: movie.year }),
    };
    fetch("/api/get_movie_history", requestOptions)
      .then((response) => response.json())
      .then((res) => {
        setHistory(res);
      });
  };

  const renderTableHeader = () => {
    let header = Object.keys(history[0]);
    header.unshift("#");
    return header.map((key, index) => {
      return (
        <th className="md-th" key={index}>
          {key.toUpperCase()}
        </th>
      );
    });
  };

  const renderTableData = () => {
    return history.map((record, index) => {
      const { date, time, channel } = record;
      return (
        <tr className="md-tr" key={index}>
          <td className="md-td">{history.length - index}</td>
          <td className="md-td">{date}</td>
          <td className="md-td">{time}</td>
          <td className="md-td">
            {channel}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="md-page">
      <button
        className="movie-details-exit-button"
        onClick={() => {
          setDetailsChecked(false);
        }}
      >
        &#10005;
      </button>
      <div
        className="md-movie-info"
        style={{
          backgroundImage: `linear-gradient(180deg, #00000088 30%, #282c34 90%), url(http://image.tmdb.org/t/p/original/${backdrop})`,
        }}
      >
        <div className="md-movie-wrapper">
          <div className="md-poster" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${poster})`}}></div>
          <div className="md-details">
            <div className="md-details-title">
              {movie.title} ({year})
            </div>
            <div className="md-details-info">
              <p className="md-details-info-box">{length} mins</p>
              <p className="md-details-info-box">
                <img className="md-imdb-logo" src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png" alt="IMDB logo" />{" "}
                {Math.round(rating * 100) / 100}/10
              </p>
              <p className="md-details-info-box">{genre}</p>
            </div>
            <div className="md-providers-list">
              <p>Avaliable on: &nbsp; </p>
                {!loading && providers.map((name, idx) => (
                  <div key={idx}>
                    <img alt={name} className="md-providers-logo" src={`http://image.tmdb.org/t/p/original/${name}`}/>
                  </div>
                ))}
            </div>
            <div className="md-details-trailer">
              <button className="md-details-trailer-button">
                <a target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${trailer}`}>
                  Trailer
                </a>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="md-movie-history">
        <div className="md-add-info">
          <div className="md-add-info-desc">
            <b className="md-desc-title">Storyline</b>
            <p>{desc}</p>
          </div>
          <div className="md-add-info-director">
            <b>Director:</b> &nbsp; {!loading && director}
          </div>
          <div className="md-add-info-cast-title">
            <b>Main Cast</b>
          </div>
          <div className="md-add-info-cast-list">
            {cast !== "N/A" ? (
              !loading && cast.map(
                (castmember, idx) =>
                  castmember.split("@")[0] !== "N/A" && (
                    <div key={idx} className="cast-name">
                      <img alt="cast member" className="cast-image" src={"http://image.tmdb.org/t/p/original/" + castmember.split("@")[1]} />
                      {castmember.split("@")[0]}
                    </div>
                  )
              )
            ) : (
              <div>N/A</div>
            )}
          </div>
        </div>
        <div className="md-history">
          <div className="md-table-title">TV Showing History</div>
          <table className="md-table" id="history">
            {history.length > 0 ? (
              history && (
                <tbody className="md-tbody">
                  {renderTableHeader()}
                  {renderTableData()}
                </tbody>
              )
            ) : (
              <tbody>
                <tr>
                  <td style={{ fontSize: "1rem" }}>No Data</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
