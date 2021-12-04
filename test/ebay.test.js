
const { getRandomCardListings, getHDImage } = require('../ebay');
const { expect } = require('chai');


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
		});
	});
});