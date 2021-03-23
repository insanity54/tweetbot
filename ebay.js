
/**
 * ebay.js
 */

require('dotenv').config();
const debug = require('debug')('tweetbot');

const envImport = require('@grimtech/envimport');

const appId = envImport('EBAY_APP_ID');
const certId = envImport('EBAY_CERT_ID');
const devId = envImport('EBAY_DEV_ID');
const affiliateId = envImport('EBAY_AFFILIATE_ID');
const customId = envImport('EBAY_AFFILIATE_CUSTOM_ID');

const eBayApi = require('ebay-node-api');
let ebay = new eBayApi({
  clientID: appId,
  env: 'PRODUCTION',
  headers: {
    'X-EBAY-SOA-GLOBAL-ID': 'EBAY-US'
  }
})

// greets https://stackoverflow.com/a/7228322/1004931
const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}


// https://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=ChrisGri-sbtp-PRD-3d4ac9777-b6aeed40&OPERATION-NAME=findItemsIneBayStores&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&storeName=SakuraBlossomTradingPost&affiliate.customId=TWTR&affiliate.networkId=9&affiliate.trackingId=5338784863&paginationInput.entriesPerPage=100&keywords=card&itemFilter(0).name=categoryID&itemFilter(0).value=1345&outputSelector(0)=SellerInfo&outputSelector(1)=PictureURLLarge&GLOBAL-ID=EBAY-US


const getRandomCardListings = async (howMany) => {
  const totalEntries = 100;
  const params = {
    storeName: 'SakuraBlossomTradingPost',
    affiliate: {
      customId: customId,
      networkId: 9,
      trackingId: affiliateId
    },
    entriesPerPage: totalEntries,
    keywords: 'card',
    categoryID: '1345',
    outputSelector: 'PictureURLSuperSize'
  };
  const result = await ebay.findItemsIneBayStores(params);
  if (result[0]['ack'][0] === 'Failure') {
    throw new Error(JSON.stringify(result));
  }
  const items = result[0].searchResult[0].item;
  
  const getRandomListing = (ls) => ls[(randomIntFromInterval(1, totalEntries)-1)];
  let selected = [];
  for (var i=0; i<howMany; i++) {
    selected.push(getRandomListing(items));
  }

  return selected;
}

const pluckInterestingData = (cards) => {
  const plucked = [];
  for (var i=0; i<cards.length; i++) {
    let standardImage = cards[i].pictureURLLarge[0];
    let superSizeImage = standardImage.replace('$_12', '$_10'); // $_10.jpg is the largest size image available.
    let data = {
      image: superSizeImage,
      standardImage: standardImage,
      title: cards[i].title[0],
      url: cards[i].viewItemURL[0],
      id: cards[i].itemId[0]
    };
    plucked.push(data);
  }
  return plucked;
}



module.exports = {
  getRandomCardListings,
  pluckInterestingData
}

