require('dotenv').config()
const fetch = require('node-fetch');
const express = require('express')
const app = express()
var request = require('request');
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const spotifyAPIBaseUri = 'https://api.spotify.com'
const spotifyAccountsBaseUri = 'https://accounts.spotify.com'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

var access_token = myCache.get("token", (err, value) => {
	if (!err) {
		return value
	} else {
		return false
	}
})


let authOptions = {
	url: 'https://accounts.spotify.com/api/token',
	headers: { 'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64')) },
	form: {
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	},
	json: true
}

const getRecentlyPlayed = () => {
	console.log('Getting recently played tracks')
	return fetch(`${spotifyAPIBaseUri}/v1/me/player/recently-played`, {
		headers: {
			'Authorization': `Bearer ${access_token}`
		}
	})
}

app.get('/my-recently-played', function (req, res, next) {
	myCache.get("token", (err, value) => {
		if (!err) {
			if (value === undefined) {
				request.post(authOptions, (error, response, body) => {
					access_token = body.access_token;
					myCache.set("token", access_token, (err, success) => {
						if (!err && success) {
							console.log(success)
						}
					})
					console.log('New one', access_token)
				}).on('complete', () => {
					console.log(access_token)
					getRecentlyPlayed()
						.then(response => response.json())
						.then(data => res.send(data))
				})
			} else {
				getRecentlyPlayed()
					.then(response => response.json())
					.then(data => res.send(data))
			}
		} else {
			res.status(500).json({
				message: "an error has occurred"
			})
		}
	})
})

app.listen(3030, () => {
	console.log('> Listening on port 3030')
})

