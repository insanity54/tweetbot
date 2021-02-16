const { 
	doMakeTweet,
	uploadRemoteImageToTwitter
} = require('../twitter');

describe('twitter', () => {
	describe('doMakeTweet', () => {
		it('should post a tweet to twitter', async () => {
			const tweetId = await doMakeTweet('hello world!', 'https://i.ebayimg.com/00/s/MTYwMFgxMTg2/z/1-oAAOSwPlFenEfq/$_1.JPG');
			expect(tweetId).toStrictEqual(expect.any(String));
		}, 1000*60);
	});
	describe('uploadRemoteImageToTwitter', () => {
		it('should upload an image and return a media_id', async () => {
			const mediaId = await uploadRemoteImageToTwitter('https://i.ebayimg.com/00/s/MTYwMFgxMTg2/z/1-oAAOSwPlFenEfq/$_1.JPG')
			expect(mediaId).toStrictEqual(expect.any(String));
		})
	})
});