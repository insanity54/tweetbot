
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const { getRandomCardListings, pluckInterestingData } = require('./ebay');
const { doMakeTweet } = require('./twitter');
const envImport = require('@grimtech/envimport');
const schedule = envImport('TWEET_SCHEDULE');
const scheduler = require('node-schedule');
const express = require('express');
const app = express();
var lastTweet = null;
var lastRunDate = null;

const main = (async () => {
  const cards = await getRandomCardListings(1);
  const { image, title, url } = pluckInterestingData(cards)[0];
  const id = await doMakeTweet(`${title}\n${url}`, image);
  lastRunDate = new Date().valueOf();
  lastTweet = `https://twitter.com/ebay_sbtp/status/${id}`;
  console.log(lastTweet);
})

app.get('/', (req, res) => {
	if (new Date().valueOf() - lastRunDate > 86400000) {
	  // if the last run date is older than 24h
		res.json({ status: 'FAILED', lastRun: lastRunDate, lastTweet: lastTweet });
	} else {
    // the last run date is newer than 24h
		res.json({ status: 'OK', lastRun: lastRunDate, lastTweet: lastTweet });
	}
})


if (argv.oneshot) {
  main();
} else {
  const job = scheduler.scheduleJob(schedule, main);
  console.log(`Tweetbot is running using schedule definition ${schedule}.\nNext invocation is at ${job.nextInvocation()}`);
}