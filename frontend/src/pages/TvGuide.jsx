import React from "react";
import "./TvGuide.css";
import ShowCard from "../components/Tvguide/ShowCard";
import { getDateTime, checkDates, getYesterdaysDate, getChannelImage } from "../helper";

function TvGuide(props) {
  const { location } = props;
  const [TV, setTV] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [viewingDate, setViewingDate] = React.useState("");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [viewChoice, setViewChoice] = React.useState("now");
  const [channelFilter, setChannelFilter] = React.useState(false);
  const [deletedRows, setDeletedRows] = React.useState(false);

  // Channels that aee kept when user presses "Filter lesser channels"
  let popularChannels = ["10", "Seven", "Nine", "7flix", "9Go!", "7mate", "9Gem", "9Life"];
  const values = getDateTime();
  let timeNow = values[1];
  let todaysDate = values[0];

  React.useEffect(() => {
    setLoading(true);
    setViewingDate(todaysDate);
    createGuide();
  }, [location]);

  React.useEffect(() => {
    !loading && channelFilter && deleteEmptyRows();
    !loading && !channelFilter && deletedRows && createGuide();
  }, [channelFilter, loading]);

  const getTV = (location) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: location }),
    };
    return fetch("/api/get_tv", requestOptions).then((response) => response.json());
  };

  const createGuide = () => {
    getTV(location)
      .then((response) => {
        if (typeof response === "undefined" || response.length === 0 || !response) {
          alert("Error: The guide for that location is unavaliable, please select a different one and try again later");
        }
        const arry = [];
        for (const [key, value] of Object.entries(response)) {
          arry.push(value);
        }
        return arry;
      })
      .then((guide) => {
        // If a user is viewing the guide between 12am and 3am
        if (timeNow >= "00:00" && timeNow <= "03:00") {
          return getYesterdaysShows(guide);
        }
        return guide;
      })
      .then((newGuide) => {
        setTV(newGuide);
      })
      .then(() => {
        setLoading(false);
      });
  };

  // fetch yesterdays TV guide and return the shows that started yesterday and ended today
  const getYesterdaysShows = (res) => {
    let showsToAdd = [];
    res.forEach((tvArray) => {
      if (tvArray.date === getYesterdaysDate()) {
        Object.entries(tvArray.tv).forEach((k) => {
          k[1].forEach((show) => {
            if (show.military_stop < show.military_start) {
              showsToAdd.push(show);
            }
          });
        });
      }
    });
    return appendYesterdaysShows(showsToAdd, res);
  };

  // Append the shows found above to todays guide
  const appendYesterdaysShows = (yesterdaysShow, res) => {
    let newTV = [...res];
    newTV.forEach((tvArray) => {
      if (tvArray.date === todaysDate) {
        Object.entries(tvArray.tv).forEach((k) => {
          yesterdaysShow.forEach((show) => {
            if (k[0] === show.channel_name) {
              show.date = todaysDate;
              show.military_start = "00:00";
              k[1].unshift(show);
            }
          });
        });
      }
    });
    return newTV;
  };

  // Get all the dates in the tv guide to be added to the choose date dropdown menu
  const getDates = () => {
    let dates = [];
    !loading &&
      TV.forEach((tvArray) => {
        if (!dates.includes(tvArray["date"]) && checkDates(tvArray["date"], todaysDate)) {
          dates.push(tvArray["date"]);
        }
      });
    return dates;
  };

  const getToday = (viewingDate) => {
    if (!todaysDate.localeCompare(viewingDate)) {
      return "Today";
    }
    return viewingDate;
  };

  // Clicking "Filter lesser channels" removes the channels not included in the popularChannels array
  // above from view but doesn't actually alter the datastructure that is being mapped therefore React doesn't
  // notice a state change and the table is not updated to remove the rows that are now empty in the guide.
  // Thus this functions physically deletes those entries in the datastructue so the empty rows are removed and React
  // updates the state and the rows are removed from the table.
  const deleteEmptyRows = () => {
    let newTV = [...TV];
    newTV.map((show, i) => {
      if (show.date == viewingDate) {
        Object.keys(show.tv).map((channel, j) => {
          if (!popularChannels.some((o) => channel.includes(o))) {
            delete show.tv[channel];
          }
        });
      }
    });

    setDeletedRows(true);
    setTV(newTV);
  };

  return !loading ? (
    <div>
      <div className="tvguide-options">
        <select title="Select viewing date" className="tvguide-option" onChange={(event) => setViewingDate(event.target.value)}>
          {getDates().map((date, i) => (
            <option key={i} value={date} className="view-choice-box" onClick={() => setViewingDate(date)}>
              {getToday(date)}
            </option>
          ))}
        </select>
        <p className="border-bar">|</p>
        <select title="Select viewing time" className="tvguide-option" onChange={(event) => setViewChoice(event.target.value)}>
          <option className="view-choice-box" value="now">
            Now
          </option>
          <option className="view-choice-box" value="early morning">
            Early Morning
          </option>
          <option className="view-choice-box" value="morning">
            Morning
          </option>
          <option className="view-choice-box" value="afternoon">
            Afternoon
          </option>
          <option className="view-choice-box" value="night">
            Night
          </option>
        </select>
        <p className="border-bar">|</p>
        <button title="Expand viewer size" className="tvguide-option" onClick={() => setFullscreen(!fullscreen)}>
          Expand
        </button>
        <p className="border-bar">|</p>
        <button className="tvguide-option" onClick={() => setChannelFilter(!channelFilter)}>
          Filter lesser channels
        </button>
      </div>
      <div className="main-content-section" style={fullscreen ? { height: "100%" } : { height: "82vh" }}>
        {!loading &&
          TV.map((tvArray, num) => (
            <table key={num} className="tvguide-table">
              <tbody>
                {tvArray.date === viewingDate &&
                  Object.entries(tvArray.tv).map((k, idx) => (
                    <tr className="tvguide-tr" key={idx}>
                      <th className="tvguide-th">
                        <img alt={k[0]} title={k[0]} width="50" height="50" className="channel-image" src={getChannelImage(k[0])} />
                      </th>
                      {k[1].map((show, num) => {
                        switch (viewChoice) {
                          case "now":
                            show.military_stop < show.military_start ? (show.military_stop = "23:59") : (show.military_stop = show.military_stop);
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  ((show.military_start <= timeNow && timeNow <= show.military_stop) || show.military_start >= timeNow) && (
                                    <ShowCard show={show} key={num} />
                                  )
                              : ((show.military_start <= timeNow && timeNow < show.military_stop) || show.military_start >= timeNow) && (
                                  <ShowCard show={show} key={num} />
                                );
                          case "early morning":
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  show.military_start >= "00:00" &&
                                  show.military_start <= "06:00" && <ShowCard show={show} key={num} />
                              : show.military_start >= "00:00" && show.military_start <= "06:00" && <ShowCard show={show} key={num} />;
                          case "morning":
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  show.military_start >= "06:00" &&
                                  show.military_start <= "12:00" && <ShowCard show={show} key={num} />
                              : show.military_start >= "06:00" && show.military_start <= "12:00" && <ShowCard show={show} key={num} />;
                          case "afternoon":
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  show.military_start >= "12:00" &&
                                  show.military_start <= "18:00" && <ShowCard show={show} key={num} />
                              : show.military_start >= "12:00" && show.military_start <= "18:00" && <ShowCard show={show} key={num} />;
                          case "night":
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  show.military_start >= "18:00" &&
                                  show.military_start <= "24:00" && <ShowCard show={show} key={num} />
                              : show.military_start >= "18:00" && show.military_start <= "24:00" && <ShowCard show={show} key={num} />;
                          default:
                            show.military_stop < show.military_start ? (show.military_stop = "23:59") : (show.military_stop = show.military_stop);
                            return channelFilter
                              ? popularChannels.some((o) => show.channel_name.includes(o)) &&
                                  ((show.military_start <= timeNow && timeNow <= show.military_stop) || show.military_start >= timeNow) && (
                                    <ShowCard show={show} key={num} />
                                  )
                              : ((show.military_start <= timeNow && timeNow <= show.military_stop) || show.military_start >= timeNow) && (
                                  <ShowCard show={show} key={num} />
                                );
                        }
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
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
  );
}

export default TvGuide;
