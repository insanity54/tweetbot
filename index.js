

const { getRandomCardListings, pluckInterestingData } = require('./ebay');

const main = (async () => {

  const cards = await getRandomCardListings(7);
  const plucked = pluckInterestingData(cards);
  console.log(plucked);
})()