
/**
 * ebay.js
 */

require('dotenv').config();
const debug = require('debug')('tweetbot');

const envImport = require('@grimtech/envimport');

const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;
const EBAY_DEV_ID = process.env.EBAY_DEV_ID;

if (typeof EBAY_APP_ID === 'undefined') throw new Error('EBAY_APP_ID is not defined');
if (typeof EBAY_CERT_ID === 'undefined') throw new Error('EBAY_CERT_ID is not defined');
if (typeof EBAY_DEV_ID === 'undefined') throw new Error('EBAY_DEV_ID is not defined');


const eBayApi = require('ebay-node-api');
let ebay = new eBayApi({
  clientID: EBAY_APP_ID,
  clientSecret: EBAY_CERT_ID,
  env: 'PRODUCTION',
  headers: {
    'X-EBAY-SOA-GLOBAL-ID': 'EBAY-US',
  },
  body: {
    grant_type: 'client_credentials',
    scope: 'https://api.ebay.com/oauth/api_scope'
  }
})


// greets https://stackoverflow.com/a/7228322/1004931
const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}


// https://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=ChrisGri-sbtp-PRD-3d4ac9777-b6aeed40&OPERATION-NAME=findItemsIneBayStores&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&storeName=SakuraBlossomTradingPost&affiliate.customId=TWTR&affiliate.networkId=9&affiliate.trackingId=5338784863&paginationInput.entriesPerPage=100&keywords=card&itemFilter(0).name=categoryID&itemFilter(0).value=1345&outputSelector(0)=SellerInfo&outputSelector(1)=PictureURLLarge&GLOBAL-ID=EBAY-US


const getRandomCardListings = async (howMany) => {

  const totalEntries = 200;
  const params = {
    filter: 'sellers:{sakurablossomtradingpost}',
    keyword: 'card',
    categoryId: '1345',
  };
  await ebay.getAccessToken();

  const result = await ebay.searchItems(params);
  const res = JSON.parse(result);
  const items = res.itemSummaries;

  const total = res.total;
  let selectedListingIndices = [];
  for (var i = 0; i < howMany; i++) {
    selectedListingIndices.push(randomIntFromInterval(1, total)-1);
  }

  let selectedItems = [];
  for (const i of selectedListingIndices) {
    const rP = Object.assign({}, params, {
      limit: '1',
      offset: i,
    })
    const res = await ebay.searchItems(rP);
    const r = JSON.parse(res);
    const item = r.itemSummaries[0];
    selectedItems.push(item);
  }

  return selectedItems;
}

const pluckInterestingData = (cards) => {
  const plucked = [];
  for (var i=0; i<cards.length; i++) {
    let standardImage = cards[i]['image']['imageUrl'];
    let superSizeImage = cards[i]['thumbnailImages'][0]['imageUrl'];
    let data = {
      image: superSizeImage,
      standardImage: standardImage,
      title: cards[i]['title'],
      url: cards[i]['itemWebUrl'],
      id: cards[i]['legacyItemId']
    };
    plucked.push(data);
  }
  return plucked;
}



module.exports = {
  getRandomCardListings,
  pluckInterestingData
}

