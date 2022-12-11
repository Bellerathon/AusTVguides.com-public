import requests
import time

# =============================================================================================================================================== #
# This file is used to fetch all the raw XML data for all broadcast catchments which is used in generate_movie_guide.py and generate_tv_guide.py  #
# =============================================================================================================================================== #

locations = [
    "Sydney", "Wollongong", "Orange_Dubbo", "Albury_Wodonga", "Central_Coast", "Newcastle", "Coffs_Harbour", "South_Coast", "Tamworth", "Wagga_Wagga", "Taree_Port_Macquarie", 
    "Broken_Hill", "Brisbane", "Goldcoast", "Cairns", "Sunshine_Coast", "Griffith", "Toowoomba", "Townsville", "Mackay", "Wide_Bay", "Mandurah", "Rockhampton", "Perth", "Bunbury", 
    "Albany", "WA_Regional", "Melbourne", "Geelong", "Gippsland", "Bendigo", "Lismore", "Ballarat", "Mildura_Sunraysia", "Shepparton", "Darwin", "NT_Regional", "Remote_Central", 
    "Canberra", "Adelaide", "Port_Augusta", "Riverland", "South_East_SA", "Spencer_Gulf", "Hobart", "Launceston"
]
base_url = "http://xmltv.net/xml_files"
for location in locations:
    try:
        url = f"{base_url}/{location}.xml"
        header = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0'}
        res = requests.get(url, headers=header, allow_redirects=True)
        open(f"./data/raw_xml_data/{location}.xml", "wb+").write(res.content)
    except Exception as e:
        pass

    # Person running the site i fetch data from is only a hobbiest so don't want to overload him with requests too quickly and be blacklisted
    time.sleep(1)