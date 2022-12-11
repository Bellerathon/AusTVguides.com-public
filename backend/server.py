import mysql.connector
import requests
from helpers import get_details, get_details_without_ID
from flask import Flask, jsonify, request
import json

app = Flask(__name__)
app.debug = True
# Stops JSON data being rearranged during HTTP request transit
app.config['JSON_SORT_KEYS'] = False

# Strings inside this list are the only things from the client-side recognised by the server-side, preventing client side attacks like code injection etc.
valid = ['Sydney', 'Wollongong', 'Orange', 'Albury/Wodonga', 'Central_Coast', 'Newcastle', 'Coffs_Harbour', 'South_Coast', 'Tamworth', 'Wagga_Wagga', 'Taree/Port_Macquarie', 'Broken_Hill', 'Brisbane', 
'Gold_Coast', 'Cairns', 'Sunshine_Coast', 'Griffith', 'Toowoomba', 'Townsville', 'Mackay', 'Wide_Bay', 'Mandurah', 'Rockhampton', 'Perth', 'Bunbury', 'Albany', 'WA Regional', 'Melbourne', 'Geelong', 
'Gipsland', 'Bendigo', 'Lismore', 'Ballarat', 'Mildura/Sunraysia', 'Shepperaton', 'Darwin', 'NT_Regional', 'Remote_Central', 'Canberra', 'Adelaide', 'Port_Augusta', 'Riverland', 'South_East_SA', 
'Spencer_Gulf', 'Hobart', 'Launceston']

# ======================================================= #
# Return the TV guide for a requested broadcast catchment #
# ======================================================= #
@app.route('/api/get_tv', methods=['POST'])
def get_tv():
    try:
        # Retrieve the location from the recieved data
        data = request.get_json()
        location = data['id']

        # Check the request only contains the location for a valid broadcast catchment
        if location not in valid:
            location = "Sydney"
        if not location:
            location = "Sydney"
        tv = json.load(open(f"./data/tvguides/{location}.json"))
        return jsonify(tv)
    except:
        tv = json.load(open(f"./data/tvguides/Sydney.json"))
        return jsonify(tv)

# ========================================================== #
# Return the MOVIE guide for a requested broadcast catchment #
# ========================================================== #
@app.route('/api/get_movies', methods=['POST'])
def get_movies():
    try:
        # Retrieve the location from the recieved data
        data = request.get_json()
        location = data['id']

        # Check the request only contains the location for a valid broadcast catchment
        if location not in valid:
            location = "Sydney"
        if not location:
            location = "Sydney"
        movies = json.load(open(f"./data/movieguides/{location}.json"))
        return jsonify(movies)
    except:
        movies = json.load(open(f"./data/movieguides/Sydney.json"))
        return jsonify(movies)

# ================================================================================================= #
# Return a list of movies that match the search term currently in a users searchbar on the frontend #
# ================================================================================================= #
@app.route('/api/search_movie', methods=['POST'])
def search_movie():
    try:
        # Retrieve the search term from the recieved data
        data = request.get_json()
        url = f"{base}/search/movie?api_key={key}&language=en-US&query={data['title']}"
        res = requests.get(url)
        response = res.json()
        # Make a list of all movies that match given term
        results = []
        for entry in response['results']:
            try:
                result = {}
                # Concats the title, id and release date e.g "Topgun@tt123456@12/04/1984" and the frontend parses it
                result['title'] = entry['title']
                result['imdb_id'] = str(entry['id'])
                result['year'] = entry['release_date'][:4]
                result['desc'] = entry['overview']
                results.append(result)
            except:
                pass
        return jsonify(results)
    except:
        return jsonify(["No matches"])

# ============================================================================================= #
# Returns info about a movie that is then displayed to the user when they search for a movie on # 
# the frontend, queries our database for info about a movie else will query TMDB for the info   #
# ============================================================================================= #
@app.route('/api/get_movie_details', methods=['POST'])
def get_movie_details():
    # Retrieve the search term from the recieved data
    data = request.get_json()
    id = data['id']
    title = data['name']
    desc = data['desc']

    return jsonify(get_details(id, title, desc))

# ===================================================================================================== #
# Returns all unique instances of a movie that is stored in our database and orders them by date played #
# ===================================================================================================== #
@app.route('/api/get_movie_history', methods=['POST'])
def get_movie_history():

    data = request.get_json()
    title = data['title']
    year = data['year']

    # Connect to our database
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()
    mycursor.execute(
        "SELECT * FROM movie_history WHERE title = %s AND year = %s ORDER BY date_played DESC, time_played;", (title, year)
    )
    result = mycursor.fetchall()

    records = []
    for title, year, date, time, channel in result:
        if date != None:
            record = {}
            record['date'] = str(date)
            record['time'] = str(time)[:-3]
            record['channel'] = channel
            records.append(record)

    conn.close()

    return(jsonify(records))

# ================================================================================ #
# Returns a list of 10 movies that appear the most number of times in our database #
# ================================================================================ #
@app.route('/api/get_movie_leaderboard', methods=['GET'])
def get_movie_leaderboard():
    # Connect to our database
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()
    mycursor.execute(
        "SELECT title, year, count(*) FROM movie_history as mh GROUP BY mh.title, mh.year ORDER BY count(*) DESC, mh.title LIMIT 10;"
    )
    result = mycursor.fetchall()

    records = []
    for title, year, count in result:
        record = {}
        record['title'] = title + " (" + year + ")"
        record['count'] = count
        records.append(record)

    conn.commit()
    conn.close()

    return(jsonify(records))
