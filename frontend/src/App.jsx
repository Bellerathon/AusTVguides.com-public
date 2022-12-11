import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieSearch";
import MoviesLeaderboard from "./pages/MoviesLeaderboard";
import Search from "./assets/search_icon";
import Location from "./assets/location_icon";
import ContactForm from "./pages/Form";

function App() {
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = React.useState([]);
  const [detailsChecked, setDetailsChecked] = React.useState(false);
  const [movieDetails, setMovieDetails] = React.useState();
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  // If user has selected a location before use it otherwise default location as Sydney
  const [locationChoice, setLocationChoice] = React.useState(() => {
    let location = localStorage.getItem("location");
    return location ? location : "Sydney";
  });

  const NSW = [
    "Sydney",
    "Wollongong",
    "Orange",
    "Albury_Wodonga",
    "Central_Coast",
    "Newcastle",
    "Coffs_Harbour",
    "South_Coast",
    "Tamworth",
    "Wagga_Wagga",
    "Taree_Port_Macquarie",
    "Broken_Hill",
  ];
  const QLD = ["Brisbane", "Gold_Coast", "Cairns", "Sunshine_Coast", "Griffith", "Toowoomba", "Townsville", "Mackay", "Wide_Bay", "Mandurah", "Rockhampton"];
  const WA = ["Perth", "Bunbury", "Albany", "WA_Regional"];
  const VIC = ["Melbourne", "Geelong", "Gipsland", "Bendigo", "Lismore", "Ballarat", "Mildura_Sunraysia", "Shepperaton"];
  const NT = ["Darwin", "NT_Regional", "Remote_Central"];
  const ACT = ["Canberra"];
  const SA = ["Adelaide", "Port_Augusta", "Riverland", "South_East_SA", "Spencer_Gulf"];
  const TAS = ["Hobart", "Launceston"];

  // This is mapped to the location choice dropdown
  const locations = {
    NSW: NSW,
    QLD: QLD,
    VIC: VIC,
    SA: SA,
    WA: WA,
    NT: NT,
    TAS: TAS,
    ACT: ACT,
  };

  // Get location from the case where someone manually insert location into the url
  const location = useLocation();
  React.useEffect(() => {
    setLocationChoice(location.pathname.split("/au/location/")[1]);
    window.scrollTo(0, 0);
  }, [location]);

  // Called on every keystroke inside searchbar
  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
    let value = e.target.value;
    let title = value.split("+")[0];
    debounceDropDown(title);
  };

  // Called when user changes location in location dropdown, users choice is saved to localstorage
  // and used next time they visit
  const handleLocationChange = (e) => {
    e.preventDefault();
    localStorage.setItem("location", e.target.value);
    setLocationChoice(e.target.value);
    navigate(`/au/location/${e.target.value}`);
  };

  // Get a matching results for users search input
  const searchMovie = (query) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: query }),
    };
    fetch("/api/search_movie", requestOptions)
      .then((response) => response.json())
      .then((res) => {
        setSearchResults(res);
      });
  };

  // Debounce function from: https://stackoverflow.com/q/24004791/1814486
  // Search is only fetched after user stops typing for 1 second
  const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  const debounceDropDown = React.useCallback(
    debounce((nextValue) => searchMovie(nextValue), 1000),
    []
  );

  const parseResult = (result) => {
    setSearch(result.title);
    setMovieDetails(result);
    setDetailsChecked(true);
  };

  return (
    <>
      {detailsChecked && <MovieDetails movie={movieDetails} setDetailsChecked={setDetailsChecked} />}
      <div className="app">
        <header>
          <div className="logo-wrapper">
            <Link to="/">
              <img title="Return to homepage" alt="website logo" className="page-logo" />
            </Link>
          </div>
          <div className="searchbar-wrapper">
            <form className="search-form">
              <div className="searchbar-logo">
                <Search />
              </div>
              <input
                type="search"
                value={search}
                className="searchbar"
                title="Search for a movie"
                placeholder="search a movie..."
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
              ></input>
              {showSearchResults && (
                <div className="search-results-wrapper">
                  {search.length > 1 &&
                    searchResults.map((movie, num) => (
                      <li
                        key={num}
                        className="search-result-item"
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchResults([]);
                          parseResult(movie);
                        }}
                      >
                        {movie === "No matches" ? movie : movie.title + " " + "(" + movie.year + ")"}
                      </li>
                    ))}
                </div>
              )}
            </form>
          </div>
          <button className="top-section-leaderboard" title="View Movies Leaderboard" onClick={() => navigate("./movies_leaderboard")}>
            <Link style={{ fontSize: "0.8rem", color: "white" }} to="./movies_leaderboard"></Link>
          </button>
          <div className="top-section-location">
            <div>
              <Location />
            </div>
            <select title="Select your location" className="tvguide-location-dropdown" value={locationChoice} onChange={(e) => handleLocationChange(e)}>
              {Object.entries(locations).map(([k, v], index) => {
                return (
                  <React.Fragment key={index}>
                    <option className="view-choice-title" key={k} value="" disabled>
                      {k}
                    </option>
                    {v.map((city) => (
                      <option className="view-choice-box" key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </React.Fragment>
                );
              })}
              ;
            </select>
          </div>
        </header>
        <main>
          <Routes>
            <Route exact path="/" element={<Navigate to={`/au/location/${locationChoice}`} />} />
            <Route path={`/au/location/:location`} element={<Home location={locationChoice} />} />
            <Route path="/movies_leaderboard" element={<MoviesLeaderboard />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer>
          <div className="footer-top">
            AusTVguides is Australia's premier TV and Movie guide, providing the richest experience and most features. AusTVguides has a TV and Movie guide for
            every broadcast catchment and location in Australia, as well as all your favourite channels.
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <div className="footer-credits">
                <small>With thanks to</small>
                <a title="Visit TMDB website" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
                  <img
                    alt="tmdb logo"
                    className="tmdb-logo"
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg"
                  />
                </a>
                <small>(This product uses the TMDB API but is not endorsed or certified by TMDB.)</small>
              </div>
              <div className="footer-contactme">
                <span>For Questions, Suggestions, Bug Reports:</span>
                <br />
                <button title="Contact me" className="footer-contact-button">
                  <Link style={{ fontSize: "0.8rem", color: "white" }} to="/contact">
                    Contact Me
                  </Link>
                </button>
              </div>
            </div>
            <div className="footer-bottom-right">
              {Object.entries(locations).map(([k, v], index) => {
                return (
                  <div key={index} style={{ padding: "0.5rem" }}>
                    <div className="footer-location-header">{k}&nbsp;</div>
                    <ul style={{ listStyle: "none" }}>
                      {v.map((city, j) => (
                        <li key={j}>
                          <Link title={`View TV guide for ${city}`} to={`/au/location/${city}`} style={{ cursor: "pointer", fontWeight: "normal" }}>
                            {city}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
