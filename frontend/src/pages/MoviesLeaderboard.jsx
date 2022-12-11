import React from "react";
import "./MoviesLeaderboard.css";

function MoviesLeaderboard() {
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getLeaderboard();
  }, []);

  function getLeaderboard() {
    fetch("/api/get_movie_leaderboard")
      .then((response) => response.json())
      .then((response) => {
        setLeaderboard(response);
      })
      .then(() => {
        setLoading(false);
      });
  }

  const renderTableHeader = () => {
    let header = Object.keys(leaderboard[0]);
    return header.map((key, index) => {
      return (
        <th className="md-th" key={index}>
          {key.toUpperCase()}
        </th>
      );
    });
  };

  const renderTableData = () => {
    return leaderboard.map((record, index) => {
      const { title, count } = record;
      return (
        <tr className="md-tr" key={index}>
          <td className="md-td">{title}</td>
          <td className="md-td">{count}</td>
        </tr>
      );
    });
  };

  return !loading ? (
    <div className="ml-main">
      <div className="ml-title">Top 10 Most Occuring Movies On TV</div>
      <div className="ml-leaderboard">
        <table className="md-table" id="students">
          {leaderboard.length > 0 ? (
            !loading &&
            leaderboard && (
              <tbody className="md-tbody">
                <tr className="md-tr">{renderTableHeader()}</tr>
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
  ) : (
    <div className="md-page-loading">
      <div className="lds-facebook">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default MoviesLeaderboard;
