
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const { getRandomCardListings, pluckInterestingData } = require('./ebay');
const { doMakeTweet } = require('./twitter');
const envImport = require('@grimtech/envimport');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const debug = require('debug')('tweetbot');


const scheduler = new ToadScheduler();

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
  const task = new AsyncTask('make a tweet', () => {
    console.log('Task triggered');
    return main();
  }, (err) => {
    console.error('there was an error while running the task')
    console.error(err);
  });

  const job = new SimpleIntervalJob({ hours: 2, runImmediately: true }, task);
  scheduler.addSimpleIntervalJob(job);


  app.get('/', (req, res) => {
    console.log(`job status: ${job.getStatus()}`);

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
