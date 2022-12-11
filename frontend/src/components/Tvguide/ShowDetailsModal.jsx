import React from "react";
import "./ShowDetailsModal.css";

const ShowDetailsModal = (props) => {
  const { setChecked, show } = props;
  let episodeNum = "";
  if (show.episode === "N/A") {
    episodeNum = "N/A";
  } else {
    episodeNum = "Season " + show.episode.split("-")[0] + " Ep. " + show.episode.split("-")[1];
  }

  return (
    <td className="show-details-wrapper" onClick={() => setChecked(false)}>
      <div className="show-details">
        <button className="show-exit-details-button" onClick={() => setChecked(false)}>
          &#10005;
        </button>
        <div className="show-details-title">{show.title}</div>
        <div className="show-details-content">
          <div>
            <b>Length:</b>
            <br />
            {Math.ceil(show.length) + " minutes"}
          </div>
          <b>|</b>
          <div>
            <b>Episode:</b>
            <br />
            {episodeNum}{" "}
          </div>
          <b>|</b>
          <div>
            <b>Rating:</b>
            <br />
            {show.rating}
          </div>
        </div>
        <div className="show-details-desc">{show.desc}</div>
        <div className="show-details-tags">
          <b>Category: </b>
          {show.tag.toString().split(",").join(", ")}
        </div>
      </div>
    </td>
  );
};

export default ShowDetailsModal;
