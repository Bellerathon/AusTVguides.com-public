# AusTVguides.com

// This repo is not actively updated and does not contain any real commits, this is a seperate public repo for illustrative purposes but is 95% the same as the main private repo

Completed from scratch a deployed full-stack web application that generates a TV guide for any broadcast catchment in Australia. 
Fully interactive with information modals for every TV show, filtering for date/time/channel.
A tab dedicated to just movies complete with trailers, cast info, historical showing data, and platform availability for each.
Other features include a search bar, a leaderboards table for the movies most played on TV, mobile responsive and more. 

TV guide information is retrieved from an open-source GitHub program that allowed me to sidestep the inefficiencies of web scraping. 
This community run and open source program uploads the data to a website which hosts the raw XML data. (https://www.xmltv.net/)
This data is then parsed using Python and saved into JSON format allowing for a fully interactive guide with information modals for every TV show and movie.

Careful consideration was taken to ensure good responsiveness and accessibility across all devices as well as reasonable load times and performance despite being image rich. Achieved 95+ across all categories on Google Lighthouse.  

Frontend: ReactJS, HTML, CSS - all written by me (no plugins etc), Google Analytics and SEO integration 

Backend: Python with a Flask server and connections to TMDB API and using NGINX as a reverse proxy (currently in the proccess of translating the backend to Rust)

Database: MySQL for storing movie information and historical data 

Hosting: Self-hosted on a Ubuntu VM droplet on DigitalOcean connection via SSH, physical server in Singapore, I own the domain name and pay for the hosting. 


URL: https://www.austvguides.com
