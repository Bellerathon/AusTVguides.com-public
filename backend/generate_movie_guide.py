#!/usr/bin/env python
import mysql.connector
import requests
from helpers import parse_channels, get_channel_name, get_details
from bs4 import BeautifulSoup
from datetime import datetime
from collections import defaultdict
import json
import os
from datetime import datetime

# ========================================================================================================================= #
# Loop through each broadcast catchments raw XML data and generate a JSON file containing a MOVIE guide for the next 7 days #
# ========================================================================================================================= # 
def main():
    # broadcast_catchments = os.listdir('./data/raw_xml_data')
    # for catchment in broadcast_catchments:
    #     generate_movie_guide(catchment)

    generate_movie_guide("Sydney.xml")

# ===================================================================================================================== #
# Parses the raw XML data and generates an object using data from the XML file as well as calling TMDB for more details #
# ===================================================================================================================== #
def generate_movie_guide(catchment):
    soup = BeautifulSoup(open(f"./data/raw_xml_data/{catchment}", "rb"), 'html.parser')
    programs = soup.find_all('programme')
    channels = parse_channels(f"./data/raw_xml_data/{catchment}")

    # movies (variable below) contains a list of movie objects (variable inside second loop) e.g movies = [{movie1}, {movie2}, ...]
    movies = []
    for program in programs:
        categorys = program.find_all('category')
        for category in categorys:
            if category.get_text() == "Cinema movie" or category.get_text() == "Television movie":
                movie = {}
                # 20220217214000 +1030 -> 17/02/2022
                try:
                    date = str(program["start"])[:8]
                    year = date[:4]
                    month = date[4:6]
                    day = date[6:8]
                    string_date = str(day + "/" + month + "/" + year)
                    movie['date'] = string_date
                except:
                    movie['date'] = "N/A"
                
                try:
                    movie['title'] = program.find('title').get_text()
                except:
                    movie['title'] = "N/A"
                print(movie['title'])
                # Show age rating e.g G, MA, R
                try:
                    movie['rating'] = program.find("rating").get_text().strip('\n')
                except:
                    movie['rating'] = "N/A"

                # The plot of the movie
                try:
                    movie['desc'] = program.find('desc').get_text()
                except:
                    movie['desc'] = "N/A"

                # Find movies IMDB ID that TMDB uses to identify movies
                try:
                    id = program.find("episode-num", {"system": "imdb.com"}).get_text()
                    id = id.split('/')[1]
                    if id is not None:
                        # 2 t's at start of ID is format of an IMDB movie ID
                        tcount = id.count("t")
                        # A bug in the raw XML data means the IMDB id sometimes has 4 t's at the front so cut off 2 (tttt123456 -> tt123456)
                        if tcount == 4:
                            id = id[2:]
                            movie['imdb_id'] = id
                        # Movies sometimes have ID's that are not IMDB ID's but TMDB will still recognise it so use it to fetch IMDB ID
                        elif tcount == 0:
                            url = f"https://api.themoviedb.org/3/movie/{id}?api_key={key}&append_to_response=videos&language=en-US"
                            res = requests.get(url)
                            response = res.json()
                            id = response["imdb_id"]
                            movie['imdb_id'] = id
                        else:
                            movie['imdb_id'] = id
                    else:
                        movie['imdb_id'] = "N/A"
                except:
                    movie['imdb_id'] = "N/A"

                # Get show listing tags e.g Cooking, Reality, and ignore extranous tags
                try:
                    tags = []
                    for tag in program.find_all('category'):
                        if tag.get_text() != "Movies" and tag.get_text() != "Movie":
                            tags.append(tag.get_text())
                    movie['tag'] = tags
                except:
                    movie['tag'] = "N/A"

                # Military start/stop variables refer to military time formats e.g. 14:10 == 2:10. It's easier to deal with military
                # time behind the scenes on the frontend as 2:10 could either 2:10am or 2:10pm. I still use the normal time format in 
                # start/end variables for displaying times to users because it's more common and easier to read.
                try:
                    start = str(program["start"])[8:]
                    trimmed_start = start[:4]
                    stop = str(program["stop"])[8:]
                    trimmed_stop = stop[:4]
                    movie['military_start'] = trimmed_start[:2] + ":" + trimmed_start[2:]
                    movie['military_stop'] = trimmed_stop[:2] + ":" + trimmed_stop[2:]
                    movie['start'] = datetime.strptime(trimmed_start, '%H%M').strftime('%I:%M%p').lower()
                    movie['end'] = datetime.strptime(trimmed_stop, '%H%M').strftime('%I:%M%p').lower()
                except:
                    movie['start'] = "N/A"
                    movie['end'] = "N/A"

                # Convert a channels number into its name e.g 7.yourtv.com.au -> 7 -> Seven
                try:
                    channel_number = program["channel"].split('.', 1)[0]
                    movie['channel'] = get_channel_name(channels, channel_number, catchment[:-4])
                except:
                    movie['channel'] = "N/A"

                # Get details from TMDB for the movie but if movie can't be found or there is an error then give default values
                try:
                    response = get_details(movie['imdb_id'], movie['title'], movie['desc'])
                except Exception as e:
                    response = None

                if response != None:
                    attributes = ["imdb_id", "runtime", "year", "poster_path", "backdrop_path", "vote_average", "cast", "providers", "trailer"]
                    for attribute in attributes:
                        try:
                            movie[attribute] = response[attribute]
                        except Exception as e:
                            if attribute == "poster_path":
                                movie[attribute] = "/xLjJH2SIptQuE3eTZ55lzDTHp6p.jpg"
                            elif attribute == "backdrop_path":
                                movie[attribute] = "/xGt2OqICxG7NcKtu7J5t57uXfMK.jpg"
                            else:
                                movie[attribute] = "N/A"
                else:
                    attributes = ["imdb_id", "runtime", "year", "poster_path", "backdrop_path", "vote_average", "cast", "providers", "trailer"]
                    for attribute in attributes:
                        if attribute == "poster_path":
                                movie[attribute] = "/xLjJH2SIptQuE3eTZ55lzDTHp6p.jpg"
                        elif attribute == "backdrop_path":
                            movie[attribute] = "/xGt2OqICxG7NcKtu7J5t57uXfMK.jpg"
                        else:
                            movie[attribute] = "N/A"
                
                # Save movies playing today to the our database that records when movies were played, the database only records
                # the history of movies played in the Sydney broadcast catchment becasuse having a table for every catchment would be
                # excessive as they only vary slightly.
                # try:
                #     todays_date = datetime.today().strftime('%d/%m/%Y')
                #     if (todays_date == movie['date']):
                #         if (catchment == "Sydney.xml"):
                #             save_movie_history(movie['title'], movie['year'], movie['date'], movie['military_start'], movie['channel'])
                # except:
                #     pass

                # Append movie object to the list of movies
                movies.append(movie)

    # Sort the movies by their start time 
    newlist = sorted(movies, key=lambda x: datetime.strptime(x['start'], '%I:%M%p'))
    # Then use previous list as input and now sort by play date
    newlist2 = sorted(newlist, key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))

    # Now group movies into lists according to their play date e.g "{08/10/22: [{movie1}, {movie2}, ...], 09/10/22: [{movie1}, {movie2}, ...], ...}"
    # allowing me to easily map over each date on the frontend and only show what is requested.
    # I'm also reducing bloat by ignoring movies that are identical but played by a HD channel variant e.g 7 and 7HD 
    res = defaultdict(list)
    movies_seen = []
    for i in newlist2:
        if str(i['title'] + i['start'] + i['date']) not in movies_seen:
            res[i['date']].append(i)
            movies_seen.append(i['title'] + i['start'] + i['date'])

    location = catchment[:-4]
    if "/" in location:
        location = location.replace("/", "_")
    saveFile = open(f"./data/movieguides/{location}.json", 'w')
    json.dump(dict(res), saveFile, indent=4)

# ===================================================================================================================== #
# If a movies scheduled play date is the same as the current date - save its details to a table in the database that    #
# records the history of movies played on TV. This table is queried when someone searches for a movie on the website.   #
# A movies play_date and title are set as unique in the table schema therefore if a movie is played twice on the same   #
# day it will only be recorded once, this is a minor oversight i may evenutally fix.                                    #
# ===================================================================================================================== #
def save_movie_history(title, year, play_date, play_time, channel):
    play_time = datetime.strptime(play_time, "%H:%M")
    # Connect to our database
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()

    mycursor.execute("INSERT IGNORE INTO movie_history VALUES(%s, %s, %s, %s, %s)", (title, year, datetime.strptime(play_date, "%d/%m/%Y").date(), datetime.strftime(play_time, "%H:%M"), channel))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()
