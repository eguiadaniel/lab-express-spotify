require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const path = require('path');

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

hbs.registerPartials(__dirname + '/views/partials');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  );

// Our routes go here:

app.get('/', (request, response) => {
  const name = request.params.route;
  response.render('home', {
    pageTitle: 'Home',
    name: name
  });
});

app.get('/artist-search', (request, response) => {
  const searchQuery = request.query.q;
  console.log(searchQuery);

  spotifyApi
    .searchArtists(searchQuery)
    .then((data) => {
      console.log('The received data from the API: ', data.body);
      const searchData = data.body.artists.items;
      console.log('The artist items: ', searchData);
      response.render('artist-search-results', {
        searchQuery: searchQuery,
        searchData: searchData
      });
    })
    .catch((err) =>
      console.log('The error while searching artists occurred: ', err)
    );
});

app.get('/albums/:artistId', (request, response, next) => {
  const artistId = request.params.artistId;
  console.log(artistId);

  spotifyApi.getArtistAlbums(artistId).then(
    function (data) {
      console.log('Artist albums', data.body);
      const artistData = data.body.items;
      response.render('albums', {
        artistData: artistData
      });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get('/albums/tracks/:trackId', (request, response, next) => {
  const trackId = request.params.trackId;
  console.log(trackId);

  // Get tracks in an album
  spotifyApi.getAlbumTracks(trackId, { limit: 5, offset: 1 }).then(
    function (data) {
      console.log('Album tracks', data.body);
      const trackId = data.body.items;
      response.render('tracks', {
        trackId: trackId
      });
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
