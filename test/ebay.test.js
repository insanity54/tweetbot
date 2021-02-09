
const { getRandomCardListings } = require('../ebay');

describe('ebay', () => {
	describe('getRandomCardListings', () => {
		it('should accept n as parameter and return n listings', async () => {
			const howMany1 = 7;
			const howMany2 = 17;
			const listings1 = await getRandomCardListings(howMany1);
			const listings2 = await getRandomCardListings(howMany2);
			expect(listings1).toHaveLength(howMany1);
			expect(listings2).toHaveLength(howMany2);
		}, 1000*60);
	});
});