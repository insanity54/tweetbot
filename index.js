
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const { getRandomCardListings, pluckInterestingData } = require('./ebay');
const { doMakeTweet } = require('./twitter');
const envImport = require('@grimtech/envimport');
const scheduler = require('node-schedule');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const debug = require('debug')('tweetbot');

 // # ┌────────────── second (optional)
 // # │ ┌──────────── minute
 // # │ │ ┌────────── hour
 // # │ │ │ ┌──────── day of month
 // # │ │ │ │ ┌────── month
 // # │ │ │ │ │ ┌──── day of week
 // # │ │ │ │ │ │
 // # │ │ │ │ │ │
 // # * * * * * *


const schedule = envImport('TWEET_SCHEDULE');
var lastTweet = null;
var lastRunDate = null;
var lastProduct = null;

const main = (async () => {
  debug('getting random card listings')
  const cards = await getRandomCardListings(1);

  debug('getting interesting data')
  const { image, title, url } = pluckInterestingData(cards)[0];

  debug('making a tweet')
  const id = await doMakeTweet(`${title}\n${url}`, image);

  debug('saving the last run data')
  lastRunDate = new Date().valueOf();
  lastTweet = `https://twitter.com/ebay_sbtp/status/${id}`;
  lastProduct = url;
  
  console.log(lastTweet);
})



if (argv.oneshot) {
  // make a tweet and then exit
  main();
} else {
  // long-running service
  const job = scheduler.scheduleJob(schedule, main);

  console.log(`Tweetbot is running using schedule definition ${schedule}.\nNext invocation is at ${job.nextInvocation()}`);

  app.get('/', (req, res) => {
    if (new Date().valueOf() - lastRunDate > 86400000) {
      // if the last run date is older than 24h
      res.json({ status: 'FAILED', lastRun: lastRunDate, lastTweet: lastTweet, lastProduct: lastProduct });
    } else {
      // the last run date is newer than 24h
      res.json({ status: 'OK', lastRun: lastRunDate, lastTweet: lastTweet, lastProduct: lastProduct });
    }
  })

  app.listen(PORT, () => {
    console.log(`Tweetbot status page listening on ${PORT}`)
  })
}
