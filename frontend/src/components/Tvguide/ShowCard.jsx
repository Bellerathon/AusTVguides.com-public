import React from "react";
import "./ShowCard.css";
import ShowDetailsModal from "./ShowDetailsModal";
import { default as popcorn } from "/home/will/new_guide/frontend/src/assets/popcornsvg.svg";
import { getDateTime } from "../../helper";

const ShowCard = (props) => {
  const { show } = props;
  const [checked, setChecked] = React.useState(false);

  const values = getDateTime();
  let time = values[1];
  let date = values[0];

  // Calculate the width of a show card based on it's duration restricting its length to atleast 10.5rem
  let runtime = show.length / 3;
  // Reduce width of all show cards to same size on mobile devices for ease of viewing
  if (window.innerWidth < 720) {
    runtime = 5;
  }

  // Only keep the tag with the longest name as it is probably the most informative one
  let longest = show.tag.reduce((a, b) => (a.length > b.length ? a : b));

  // Calculate the width of the red duration overlay on a showcard that visually illustrates how much
  // time has elapsed since the show began and how long remains.
  const getDuration = () => {
    if (show.military_start < time && time < show.military_stop) {
      let year = date.split("/")[2];
      let month = date.split("/")[1];
      let day = date.split("/")[0];
      let today2 = year + "-" + month + "-" + day;
      let now = time.toString();
      var diff = Math.abs(new Date(today2 + " " + show.military_start) - new Date(today2 + " " + show.military_stop));
      var diff2 = Math.abs(new Date(today2 + " " + show.military_stop) - new Date(today2 + " " + now));
      var t1 = Math.floor(diff2 / 1000 / 60);
      var t2 = Math.floor(diff / 1000 / 60);
      // Time remaining
      let c1 = t2 - t1;
      // Time remaining as a percentage of total length
      let c2 = c1 / t2;
      return c2 * 100;
    }
  };

  return (
    <>
      {checked && <ShowDetailsModal show={show} setChecked={setChecked} />}
      <td className="showcard-wrapper">
        <div
          title={show.title + " (" + show.start + " - " + show.end + ")"}
          className={show.backdrop !== "N/A" && typeof show.backdrop !== "undefined" ? "showcard-movie" : "showcard"}
          style={
            show.backdrop !== "N/A" && typeof show.backdrop !== "undefined"
              ? {
                  width: runtime + "rem",
                  backgroundImage:
                    "linear-gradient(90deg, rgba(0,0,0,0.7847514005602241) 0%, rgba(255,255,255,0) 100%), url(https://image.tmdb.org/t/p/w300" +
                    show.backdrop +
                    ")",
                }
              : { width: runtime + "rem" }
          }
          onClick={() => {
            setChecked(!checked);
          }}
        >
          <div className="showcard-info-container">
            <div className="showcard-title">
              {show.title.length > 30 && show.length <= 45 ? show.title.substring(0, 30) + "..." : show.title}
              {show.tag.includes("Cinema movie") && show.length > 90 && (
                <img title="This listing is a movie" alt="movie" className="popcorn-image" src={popcorn} />
              )}
            </div>
            <div className="showcard-time">
              {show.start} - {show.end}
            </div>
          </div>
          {show.military_start < time && time < show.military_stop && show.date === date && (
            <div className="duration-status" style={{ width: getDuration() - 3 + "%" }}></div>
          )}
          <div className="showcard-tags">{longest}</div>
        </div>
      </td>
    </>
  );
};

export default ShowCard;
