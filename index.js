
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const { getRandomCardListings, pluckInterestingData } = require('./ebay');
const { doMakeTweet } = require('./twitter');
const envImport = require('@grimtech/envimport');
const schedule = envImport('TWEET_SCHEDULE');
const scheduler = require('node-schedule');


const main = (async () => {
  const cards = await getRandomCardListings(1);
  const { image, title, url } = pluckInterestingData(cards)[0];
  const id = await doMakeTweet(`${title}\n${url}`, image);
  console.log(`https://twitter.com/ebay_sbtp/status/${id}`);
})



if (argv.oneshot) {
  main();
} else {
  const job = scheduler.scheduleJob(schedule, main);
  console.log(`Tweetbot is running using schedule definition ${schedule}. Next invocation is at ${job.nextInvocation()}`);
}