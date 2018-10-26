require("dotenv").config();

var fs = require("fs");

var request = require("request");

var moment = require('moment');

var breaker = "========================================"

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

    fs.appendFile("log.txt", action + "," + value, function (err) {

        if (err) {
            return console.log(err);
        }

        console.log("log.txt was updated!");

    });
}

liriCase(process.argv[2], process.argv[3]);

function BandsSearch(bandsName) {
    request("https://rest.bandsintown.com/artists/" + bandsName + "/events?app_id=e20512ce91906ac35a8199f70a0103d7", function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var objectBody = JSON.parse(body);
            for (i = 0; i < objectBody.length; i++) {
                console.log(breaker);
                console.log("Venue: " + objectBody[i].venue.name);
                console.log("City: " + objectBody[i].venue.city + ", " + objectBody[i].venue.country);
                console.log(moment(objectBody[i].datetime).format("MM/DD/YY"));
            }
        } else {
            console.log(error);
        }
    });
}

function OmdbSearch(movieName) {
    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=56007c94", function (error, response, body) {

        if (!error && response.statusCode === 200 && movieName != undefined) {

            console.log(breaker);

            console.log("Title: " + JSON.parse(body).Title);
            console.log("Year Released: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].value);
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot Summary: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
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
        spotify.search({ type: 'track', query: songName })
            .then(function (response) {
                var trackItems = response.tracks.items[0];
                var songData = ""
                songData += breaker + "\n";
                songData += "Song: " + trackItems.name + "\n";
                songData += "Artist: " + trackItems.artists.map(artist => artist.name).join(", ") + "\n";
                songData += "URL: " + trackItems.album.external_urls.spotify + "\n";
                songData += "Album: " + trackItems.album.name;
                console.log(songData)
            }).catch(function (err) {
                console.log(err);

            });
    }
}

function TextFile(fileName) {
    fs.readFile(fileName, "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        }
      
        console.log(data);
      
        var dataArr = data.split(",");
      
        console.log(dataArr);

        liriCase(dataArr[0], dataArr[1]);        

      });
}