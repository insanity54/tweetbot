
const { getRandomCardListings, getHDImage } = require('../ebay');
const { expect } = require('chai');

const sampleListing = "https://www.ebay.com/itm/124759537256";

describe('ebay', () => {
	describe('getRandomCardListings', function () {
		it('should accept n as parameter and return n listings', async function () {
			this.timeout(120000);
			const howMany1 = 1;
			const howMany2 = 3;
			const listings1 = await getRandomCardListings(howMany1);
			const listings2 = await getRandomCardListings(howMany2);
			console.log(listings1);
			expect(listings1).to.have.lengthOf(howMany1);
			expect(listings2).to.have.lengthOf(howMany2);
			expect(listings1[0]).to.have.property('thumbnailImages');
			expect(listings1[0]).to.have.property('itemWebUrl');
		});
	});
	describe("getAffiliateLink", function() {
		it('should accept an ebay URL and return a shortened ebay affiliate url', async function () {
			this.timeout(60000);
			const link = await getAffiliateLink(sampleListing);
			
		})
	})
});