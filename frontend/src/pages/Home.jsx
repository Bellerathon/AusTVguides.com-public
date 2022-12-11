import React from "react";
import "./Home.css";
import MovieGuide from "./MovieGuide";
import TvGuide from "./TvGuide";

function Home(props) {
  const { location } = props;
  const [viewMovies, setViewMovies] = React.useState(false);
  const viewSelect = React.useRef(null);

  React.useEffect(() => {
    viewSelect.current.focus();
  }, []);

  return (
    <div>
      <div className="home-options-section">
        <div className="home-view-select">
          <button ref={viewSelect} className="view-choice-title" onClick={() => setViewMovies(false)}>
            <p title="View TV guide">TV Guide</p>
          </button>
          <button className="view-choice-title" onClick={() => setViewMovies(true)}>
            <p title="View Movie guide">Movie Guide</p>
          </button>
        </div>
      </div>
      <div>{viewMovies ? <MovieGuide location={location} /> : <TvGuide location={location} />}</div>
    </div>
  );
}

export default Home;
