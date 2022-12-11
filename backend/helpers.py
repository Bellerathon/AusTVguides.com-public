# ================================================================================================================ #
# Functions in this file are used in more than one of: generate_movie_guide.py, generate_tv_guide.py and server.py #
# ================================================================================================================ #
import mysql.connector
import requests
from bs4 import BeautifulSoup
from difflib import SequenceMatcher
import re
from bs4 import BeautifulSoup
import base64

# ================================================================================================================================== #
# Using the IMDB ID and/or TITLE of a movie search our database for a match and return its associated information, if no record of   #
# the movie exists then query the TMDB API for the information and then save the info to our database for future reference.          #
# ================================================================================================================================== #
def get_details(id, movie_title, desc):
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()
    # Search our database for a record with movie id AND title
    mycursor.execute("SELECT * FROM movie_info as mi where mi.title=%s AND mi.imdb_id=%s", (movie_title, id))
    if mycursor.fetchone() == None:
        if id == "N/A":
            result = get_details_without_ID(movie_title, desc)
            if result:
                save_movie_details(result, movie_title)
            return result
        
        result = get_details_with_ID(id, movie_title, desc)
        if result:
            save_movie_details(result, movie_title)
        return result
    else:
        mycursor.execute("SELECT * FROM movie_info as mi where mi.title=%s AND mi.imdb_id=%s", (movie_title, id))
        result = mycursor.fetchone()
        conn.close()
        return parse_result(result)
    
# =============================================================================================================================== #
# Because the raw XML data contains an IMDB ID for some movies we can query it directly using the TMDB api to get all of its data #
# =============================================================================================================================== #
def get_details_with_ID(id, title, desc):
    id = str(id)
    url = f"https://api.themoviedb.org/3/movie/{id}?api_key={key}&append_to_response=videos,credits,watch/providers&language=en-US"
    res = requests.get(url)
    
    if res.status_code != 200:
        return get_details_without_ID(title, desc)

    response = res.json()

    # Get all data that can be directly indexed, the response obj has more data than required so i only take what i
    # want rather than keeping it all, hence the creation of a new obj.
    attributes = ["imdb_id", "overview", "runtime", "poster_path", "backdrop_path", "overview", "vote_average"]
    movie = {}
    movie['title'] = title
    for attribute in attributes:
        try:
            movie[attribute] = response[attribute]
        except:
            if attribute == "poster_path":
                movie[attribute] = "/xLjJH2SIptQuE3eTZ55lzDTHp6p.jpg"
            elif attribute == "backdrop_path":
                movie[attribute] = "/xGt2OqICxG7NcKtu7J5t57uXfMK.jpg"
            else:
                movie[attribute] = "N/A"

    movie['year'] = "N/A"
    movie['genre'] = "N/A"
    movie['trailer'] = "N/A"
    movie['cast'] = "N/A"
    movie['director'] = "N/A"
    movie['providers'] = "N/A"

    try:
        movie['year'] = response['release_date'][:4]
    except:
        pass
    
    try:
        movie['genre'] = response['genres'][0]['name']
    except:
        pass

    # Get the movies trailer
    try:
        for trailers in response['videos']['results']:
            if trailers['type'] == 'Trailer':
                movie['trailer'] = trailers['key']
    except:
        pass

    # Get the first 6 (already ordered by most renown) actors in the movies cast
    num = 6
    cast = []
    try:
        for actors in response['credits']['cast']:
            if num > 0:
                actor = actors['name'] + "@" + actors['profile_path']
                cast.append(actor)
                num = num - 1
        movie["cast"] = "+".join(cast)
    except:
        pass

    # Get the name of the movies director
    try:
        for crew in response['credits']['crew']:
            if crew['job'] == "Director":
                director = crew["name"]
        movie["director"] = director
    except:
        pass

    # Get all Australian providers for a movie and ignore duplicates
    try:
        buy = response['watch/providers']['results']['AU']['buy']
        rent = response['watch/providers']['results']['AU']['rent']
        # Netlix, Disney+ etc.
        flatrate = response['watch/providers']['results']['AU']['flatrate']
        combined = buy + rent + flatrate
        providers = []
        seen = []
        for result in combined:
            provider = {}
            provider['name'] = result['provider_name']
            provider['logo'] = result['logo_path']
            if provider['name'] not in seen:
                seen.append(provider['name'])
                providers.append(provider['logo'])
        movie['providers'] = "+".join(providers)
    except:
        pass

    return movie

# def convert_base64(image):
#     try:
#         img = str(base64.b64encode(requests.get("https://image.tmdb.org/t/p/original" + image).content))
        
#         return img[2:-1]
#     except:
#         print("error")
#         return image

# ========================================================================================================================================================== #
# Find all movies in the TMDB database with the given title and and compare their descriptions with ours to find the correct ID (see next function for more) #
# ========================================================================================================================================================== #
def get_details_without_ID(my_title, desc):
    url = f"https://api.themoviedb.org/3/search/movie?query={my_title}&api_key={key}&append_to_response=videos&language=en-US"
    res = requests.get(url)
    response = res.json()

    if desc == "N/A":
        id = response['results'][0]['id']
        return get_details_with_ID(id, my_title, desc)

    for movie in response['results']:
        if my_title == movie['title']:
            return get_details_with_ID(movie['id'], my_title, desc)
    
    found, id = find_movie(response, desc)
    if not found:
        return None
    
    result = get_details_with_ID(id, my_title, desc)
    return result

# ======================================================================================================================================= #
# When parsing the raw XML data some movies don't come with an associated IMDB ID or even a release date making it difficult to identify  #
# because there could be multiple movies in the TMDB database with that title. We therefore use the movies description from the XML data  #
# and compare it to the description of movies with the same name in the TMDB database and return the ID of the movie whose description    #
# is most similar to the one in the XML data.                                                                                             #
# ======================================================================================================================================= #
def find_movie(response, my_desc):
    id = ""
    max = 0
    for movie in response['results']:
        # Match is strong enough (at least a 99% positive match) that we can return immediately 
        if SequenceMatcher(None, my_desc, movie['overview']).ratio() >= 99.0:
            return True, movie['id']
        # Only keep the movie with the strongest match and its corresponding ID
        else:
            current_similarity = SequenceMatcher(None, my_desc, movie['overview']).ratio()
            if current_similarity > max:
                max = current_similarity
                id = movie['id']
    
    if not id:
        return False, None

    return True, id

# ========================================================================================================================= #
# Destructring the tuple returned from our database when a movie is queried and storing it in an object, used in next func  #
# ========================================================================================================================= #
def parse_result(result):
    record = {}
    for title, year, runtime, plot, id, score, poster, trailer, backdrop, director, cast, genres, providers in result,:
        record['title'] = title
        record['year'] = year
        record['runtime'] = runtime
        record['overview'] = plot
        record['imdb_id'] = id
        record['vote_average'] = score
        record['poster_path'] = poster
        record['trailer'] = trailer
        record['backdrop_path'] = backdrop
        record['director'] = director
        record['cast'] = cast
        record['genre'] = genres
        record['providers'] = providers

    return record

# ================================================================================================================== #
# Parses the raw XML data to create a map that is searchable so we can easily find a channels name using its number, #
# or its icon source link using its name etc.                                                                        #
# ================================================================================================================== #
def parse_channels(file_name):
    soup = BeautifulSoup(open(f"{file_name}", "rb"), 'html.parser')
    channels = soup.find_all('channel')
    channel_map = []
    channels_seen = []
    for channel in channels:
        c = {}
        c['number'] = channel.find('lcn').get_text()
        c['name'] = channel.find('display-name').get_text()
        try:
            c['logo'] = channel.find('icon').get("src")
        except:
            c['logo'] = "Missing"
        if c['number'] not in channels_seen:
            channels_seen.append(c['number'])
            channel_map.append(c)

    return channel_map

# ========================================================================================================================== #
# Takes a channel number and returns its corresponding name and removes extraneous details (7 -> Channel Seven NSW -> Seven) #
# ========================================================================================================================== #
def get_channel_name(channel_map, channel, location):
    states = ["NSW", "VIC", "Vic", "Victoria", "Melbourne", "SA", "South East", "South Australia", "NT", "Northern", "Northern Teritory", 
    "WA", "Western Australia", "QLD", "Queensland", "Qld", "ACT", "TAS", "Tas", "Tasmania", "Eastern", "Southern"]
    for channels in channel_map:
        if channels['number'] == channel:
            channel_name = channels['name']
            # 7TWO Sydney -> 7TWO
            if location in channel_name:
                channel_name = channel_name.replace(location, "")
            # Channel Seven -> Seven
            if "Channel" in channel_name:
                channel_name = channel_name.replace("Channel", "")
            # SBS Food NSW -> SBS Food
            for state in states:
                if state in channel_name:
                    # Can't use replace because it will replace subsets of words e.g Vic is in Viceland
                    channel_name = re.sub(r'\s*\b' + state + r'\b\s*', "", channel_name)

    return channel_name.strip()

# ============================================================================================================================== #
# Saving movie details in our own database means we don't need to query TMDB next time, reducing calls and script run-time.      #
# If a movie is not already stored in our database then store all of its associated data otherwise only store data that may have #
# changed since its inclusion into the database: its IMDB score, the source of the poster/trailer/backdrop and watch providers   #
# ============================================================================================================================== #
def save_movie_details(details, title):
    # Connect to our database
    conn = mysql.connector.connect(host=myDB['host'], user=myDB['user'], password=myDB['password'], database=myDB['database'])
    mycursor = conn.cursor()
    mycursor.execute("INSERT INTO movie_info VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE title=%s, release_year=%s, runtime=%s, plot=%s, imdb_id=%s, imdb_score=%s, poster=%s, trailer_url=%s, backdrop_poster=%s, director=%s, stars=%s, genres=%s, watch_providers=%s", (
        title,
        details['year'],
        details['runtime'],
        details['overview'],
        details['imdb_id'],
        details['vote_average'],
        details['poster_path'],
        details['trailer'],
        details['backdrop_path'],
        details['director'],
        details['cast'],
        details['genre'],
        details['providers'],
        title,
        details['year'],
        details['runtime'],
        details['overview'],
        details['imdb_id'],
        details['vote_average'],
        details['poster_path'],
        details['trailer'],
        details['backdrop_path'],
        details['director'],
        details['cast'],
        details['genre'],
        details['providers'],
    ))

    conn.commit()
    conn.close()
