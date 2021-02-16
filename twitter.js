require('dotenv').config();
const envImport = require('@grimtech/envimport');
const fs = require('fs');
const fsp = fs.promises;
const fetch = require('node-fetch');
const path = require('path');

var Twitter = require('twitter-lite');
 

function clientFactory(subdomain = 'api') {
	return new Twitter({
		subdomain,
		consumer_key: envImport('TWITTER_API_KEY'),
		consumer_secret: envImport('TWITTER_API_SECRET'),
		access_token_key: envImport('TWITTER_API_ACCESS_TOKEN'),
		access_token_secret: envImport('TWITTER_API_ACCESS_TOKEN_SECRET')
	});
}
const apiClient = clientFactory();
const uploadClient = clientFactory('upload');


const downloadImage = async (imageUrl) => {
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
	})
}


/**
 * @param {String} imageUrl
 * @return {String} mediaId
 */
const uploadRemoteImageToTwitter = async (imageUrl) => {
	if (typeof imageUrl === 'undefined') throw new Error('imageUrl was undefined');
	const { filename, size } = await downloadImage(imageUrl);
	const name = path.parse(filename).base;
	const imageData = await fsp.readFile(filename);
	const imageDataB64 = imageData.toString('base64');
	const { media_id_string } = await uploadClient.post('media/upload', { media_data: imageDataB64 });
	return media_id_string;
}


/**
 * @param {String} message
 * @param {String} imageUrl
 * @return {String} id - tweet ID
 */
const doMakeTweet = async (message, imageUrl) => {
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