#!/usr/bin/env python

from helpers import parse_channels, get_channel_name, parse_result
from bs4 import BeautifulSoup
import mysql.connector
from datetime import datetime, timedelta
from collections import defaultdict
import json
import os

# ====================================================================================================================== #
# Loop through each broadcast catchments raw XML data and generate a JSON file containing a TV guide for the next 7 days #
# ====================================================================================================================== # 
def main():
    broadcast_catchments = os.listdir('./data/raw_xml_data')
    for catchment in broadcast_catchments:
         generate_tv_guide(catchment)

# ============================================================================ #
# Parses the raw XML data and generates an object using data from the XML file #
# ============================================================================ #
def generate_tv_guide(catchment):
    soup = BeautifulSoup(open(f"./data/raw_xml_data/{catchment}", "rb"), 'html.parser')
    programs = soup.find_all('programme')
    shows = []
    dates = []
    channels = parse_channels(f'./data/raw_xml_data/{catchment}')
    for program in programs:
        show = {}
        try:
            show['title'] = program.find('title').get_text()
        except:
            show['title'] = "N/A"

        # 20220217214000 +1030 -> 17/02/2022
        try:
            date = str(program["start"])[:8]
            year = date[:4]
            month = date[4:6]
            day = date[6:8]
            string_date = str(day + "/" + month + "/" + year)
            show['date'] = string_date
            if show['date'] not in dates:
                dates.append(show['date'])
        except:
            show['date'] = "N/A"

        try:
            id = program.find("episode-num", {"system": "imdb.com"}).get_text()
            show['imdb_id'] = id.split('/')[1]
        except:
            show['imdb_id'] = "N/A"

        # Show rating e.g M, MA, R
        try:
            rating_list = program.find_all("rating")
            for rating in rating_list:
                show['rating'] = rating.find("value").get_text()
        except:
            show['rating'] = "N/A"

        # Get show listing tags e.g Cooking, Reality, and for listings that are movies retrieve its backdrop
        # poster so i can be displayed on the frontend
        try:
            tags = []
            show['backdrop'] = "N/A"
            for tag in program.find_all('category'):
                tags.append(tag.get_text())
                if tag.get_text() == "Cinema movie" or tag.get_text() == "Television movie":
                    show['backdrop'] = get_tv_poster(show["title"])
            show['tag'] = tags
        except:
            show['tag'] = ["N/A"]
            show['backdrop'] = "N/A"

        # The plot of the show
        try:
            show['desc'] = program.find('desc').get_text()
        except:
            show['desc'] = "N/A"

        # 0.28. (0-indexed) -> 1-29
        try:
            episode_num = program.find("episode-num", {"system": "xmltv_ns"}).get_text()
            season = episode_num.split('.')[0]
            episode = episode_num.split('.')[1]
            season = season.strip('. ')
            episode = episode.strip('. ')
            season = int(season) + 1
            episode = int(episode) + 1
            show['episode'] = str(season) + '-' + str(episode)

        except:
            show['episode'] = "N/A"

        # Military start/stop variables refer to military time formats e.g. 14:10 == 2:10. It's easier to deal with military
        # time behind the scenes on the frontend as 2:10 could either 2:10am or 2:10pm. I still use the normal time format in 
        # start/end variables for displaying times to users because it's more common and easier to read.
        try:
            start = str(program["start"])[8:]
            trimmed_start = start[:4]
            stop = str(program["stop"])[8:]
            trimmed_stop = stop[:4]
            show['military_start'] = trimmed_start[:2] + ":" + trimmed_start[2:]
            show['military_stop'] = trimmed_stop[:2] + ":" + trimmed_stop[2:]
            show['start'] = datetime.strptime(trimmed_start, '%H%M').strftime('%I:%M%p').lower()
            show['end'] = datetime.strptime(trimmed_stop, '%H%M').strftime('%I:%M%p').lower()
        except:
            show['start'] = "N/A"
            show['end'] = "N/A"

        # Finding the shows length is not a simple as end - start aas the end may be before start e.g 0:100 (today) - 19:00 (previous day),
        # therefore use datetime package to include the date in the calculation
        try:
            t1 = datetime.strptime(show['date'] + " " + show['military_start'], '%d/%m/%Y %H:%M')
            t2 = datetime.strptime(show['date'] + " " + show['military_stop'], '%d/%m/%Y %H:%M')
            if (t2 < t1):
                t1 = datetime.strptime(show['date'] + " " + show['military_start'], '%d/%m/%Y %H:%M')
                t2 = (datetime.strptime(show['date'] + " " + show['military_stop'], '%d/%m/%Y %H:%M') + timedelta(days=1))
                td = t2 - t1
                show['length'] = str(td.total_seconds()/60)[:-2]
            else:
                td = t2 - t1
                show['length'] = str(td.total_seconds()/60)[:-2]
        except:
            show['length'] = "N/A"

        # Convert a channels number into its name e.g 7.yourtv.com.au -> 7 -> Seven
        # Also get the source url for its logo to display on the frontend
        try:
            channel = program["channel"]
            split = channel.split('.', 1)[0]
            show['channel_name'] = get_channel_name(channels, split, catchment[:-4])
        except:
            show['channel'] = "N/A"
            show['channel_name'] = "N/A"

        shows.append(show)

    # Group all shows by date
    date_sorted = defaultdict(list)
    for i in shows:
        date_sorted[i['date']].append(i)

    # Group by channel
    tv = []
    for date, listings in date_sorted.items():
        result = {}
        result['date'] = date
        result['tv'] = group_by_channel(listings)
        tv.append(result)

    final = sorted(tv, key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))

    location = catchment[:-4]
    if "/" in location:
        location = location.replace("/", "_")

    # Example of final JSON structure
    # [
    #   {
    #     "date": "01/09/2022",
    #     "tv": {
    #         "9Gem": [
    #             {...},
    #             {...},
    #         ],
    #         "9Go!": [
    #             {...},
    #             {...},
    #          ],
    #          ...
    #   },
    #   { 
    #     "date": "02/09/2022",
    #     "tv": {
    #       ... 
    #     }
    #   },
    #   ...
    # ]
    saveFile = open(f"./data/tvguides/{location}.json", 'w')
    json.dump(final, saveFile, indent=4)

# ============================================== #
# Takes listings and groups them by channel_name #
# ============================================== #
def group_by_channel(value):
    groups = defaultdict(list)
    shows_seen = []
    for i in value: 
        if str(i['title'] + i['start'] + i['channel_name'] + i['date']) not in shows_seen:
            shows_seen.append(i['title'] + i['start'] + i['channel_name'] + i['date'])
            groups[i['channel_name']].append(i)
    return groups

# ===================================================================================== #
# Because the movie guide is processed first we already have the poster in our database #
# ===================================================================================== #
def get_tv_poster(title):
    # Connect to our database
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()
    mycursor.execute("SELECT * FROM movie_info as mi where mi.title=%s", (title,))
    result = parse_result(mycursor.fetchone())
    conn.close()
    return result["backdrop_path"]

if __name__ == "__main__":
    main()
