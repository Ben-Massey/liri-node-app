require("dotenv").config();

var fs = require("fs");

var request = require("request");

var moment = require("moment");

var keys = require("./keys.js");

var Spotify = require("node-spotify-api");

var spotify = new Spotify(keys.spotify);

var breaker = "\n========================================\n\n"

function liriCase(action, value) {
    switch (action) {
        case "concert-this":
            BandsSearch(value);
            break;

        case "spotify-this-song":
            SpotifySearch(value);
            break;

        case "movie-this":
            OmdbSearch(value);
            break;

        case "do-what-it-says":
            TextFile(value);
            break;

        default:
            console.log("error");
            break;
    }
}

liriCase(process.argv[2], process.argv[3]);

function BandsSearch(bandsName) {
    request("https://rest.bandsintown.com/artists/" + bandsName + "/events?app_id=e20512ce91906ac35a8199f70a0103d7", function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var objectBody = JSON.parse(body);

            var bandData = [];

            for (i = 0; i < objectBody.length; i++) {
                bandData.push("Venue: " + objectBody[i].venue.name);
                bandData.push("City: " + objectBody[i].venue.city + ", " + objectBody[i].venue.country);
                bandData.push(moment(objectBody[i].datetime).format("MM/DD/YY"));
            }

            fs.appendFile("log.txt", bandData + breaker, function(err) {
                if (err) throw err;
                console.log(bandData);
              });
        
        } else {
            console.log(error);
        }
    });
}

function OmdbSearch(movieName) {
    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=56007c94", function (error, response, body) {

        if (!error && response.statusCode === 200 && movieName != undefined) {

            var jsonData = JSON.parse(body);

            var movieData = [
                "Title: " + jsonData.Title,
                "Year Released: " + jsonData.Year,
                "IMDB Rating: " + jsonData.imdbRating,
                "Rotten Tomatoes Rating: " + jsonData.Ratings[1].value,
                "Country: " + jsonData.Country,
                "Language: " + jsonData.Language,
                "Plot Summary: " + jsonData.Plot,
                "Actors: " + jsonData.Actors
            ].join("\n\n");

            fs.appendFile("log.txt", movieData + breaker, function(err) {
                if (err) throw err;
                console.log(movieData);
              });
        } else {
            movieName = "Nobody's Fool"
            OmdbSearch(movieName);
        }
    });
}

function SpotifySearch(songName) {
    if (songName == undefined) {
        songName = "The Sign"
        SpotifySearch(songName);
    } else {
        spotify.search({ type: 'track', query: songName }).then(function (response) {
            var trackItems = response.tracks.items[0];

            var songshow = [
            "Song: " + trackItems.name,
            "Artist: " + trackItems.artists.map(artist => artist.name).join(", "),
            "URL: " + trackItems.album.external_urls.spotify,
            "Album: " + trackItems.album.name
            ].join("\n\n");

            fs.appendFile("log.txt", songshow + breaker, function(err) {
                if (err) throw err;
                console.log(songshow);
              });

        }).catch(function (err) {
            console.log(err);

        });
    }
}

function TextFile(fileName) {
    fs.readFile(fileName, "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        console.log(data);

        var dataArr = data.split(",");

        console.log(dataArr);

        liriCase(dataArr[0], dataArr[1]);

    });
}