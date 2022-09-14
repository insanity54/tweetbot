require('dotenv').config();
const debug = require('debug')('tweetbot');
const envImport = require('@grimtech/envimport');
const fs = require('fs');
const fsp = fs.promises;
const fetch = require('node-fetch');
const path = require('path');

var Twitter = require('twitter-lite');
 
const TWITTER_API_KEY = envImport('TWITTER_API_KEY')
const TWITTER_API_SECRET = envImport('TWITTER_API_SECRET')
const TWITTER_API_ACCESS_TOKEN = envImport('TWITTER_API_ACCESS_TOKEN')
const TWITTER_API_ACCESS_TOKEN_SECRET = envImport('TWITTER_API_ACCESS_TOKEN_SECRET')

debug(`TWITTER_API_KEY=${TWITTER_API_KEY}, TWITTER_API_SECRET=${TWITTER_API_SECRET}, TWITTER_API_ACCESS_TOKEN=${TWITTER_API_ACCESS_TOKEN}, TWITTER_API_ACCESS_TOKEN_SECRET=${TWITTER_API_ACCESS_TOKEN_SECRET}`)

function clientFactory(subdomain = 'api') {
	debug('clientFactory()')
	return new Twitter({
		subdomain,
		consumer_key: TWITTER_API_KEY,
		consumer_secret: TWITTER_API_SECRET,
		access_token_key: TWITTER_API_ACCESS_TOKEN,
		access_token_secret: TWITTER_API_ACCESS_TOKEN_SECRET
	});
}

debug('creating twitter api client')
const apiClient = clientFactory();
const uploadClient = clientFactory('upload');


const downloadImage = async (imageUrl) => {
	debug('downloadImage()')

	try {
		const imageRes = await fetch(imageUrl);
		if (imageRes.status !== 200) throw new Error(`status code ${imageRes.status} while attempting to fetch image ${imageUrl}`);
		const destFilename = `/tmp/${new Date().valueOf()}.jpg`;
		const dest = fs.createWriteStream(destFilename);
		imageRes.body.pipe(dest);
			
		return new Promise((resolve, reject) => {
			dest.on('close', () => {
				resolve({
					filename: destFilename,
					size: dest.bytesWritten
				});
			})
			dest.on('error', reject);
		})
	} catch (e) {
		console.error(`error while downloading image ${imageUrl}`)
		console.error(e);
	}
}


/**
 * @param {String} imageUrl
 * @return {String} mediaId
 */
const uploadRemoteImageToTwitter = async (imageUrl) => {
	try {
		debug('uploadRemoteImageToTwitter()')
		if (typeof imageUrl === 'undefined') throw new Error('imageUrl was undefined');

		debug('let us downloadImage so we can get the filename and the size')
		const { filename, size } = await downloadImage(imageUrl);

		debug('let us parse the path to get the name')
		const name = path.parse(filename).base;
		const imageData = await fsp.readFile(filename);
		const imageDataB64 = imageData.toString('base64');

		debug('let us upload the image to twitter')
		const { media_id_string } = await uploadClient.post('media/upload', { media_data: imageDataB64 });
		return media_id_string;
	} catch (e) {
		console.error(e)
	}
}


/**
 * @param {String} message
 * @param {String} imageUrl
 * @return {String} id - tweet ID
 */
const doMakeTweet = async (message, imageUrl) => {
	debug('doMakeTweet()')

	debug('lets verify credentials')

	try {
		const verif = await apiClient.get('account/verify_credentials')
	} catch (e) {
		console.error('error while attempting to verify creds')
		console.error(e)
	}


	if (typeof imageUrl === 'undefined') throw new Error('imageUrl was undefined');
	if (typeof message === 'undefined') throw new Error('message was undefined');
	const media_id = await uploadRemoteImageToTwitter(imageUrl);
	const media_ids = [media_id];
	const res = await apiClient.post('statuses/update', { status: message, media_ids });
	if (typeof res.id_str === 'undefined') {
		throw res;
	}
	return res.id_str
}




module.exports = {
	doMakeTweet,
	uploadRemoteImageToTwitter
}