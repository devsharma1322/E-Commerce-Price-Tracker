import { scrapedAmazonProduct } from '../lib/scraper';

// Integration test — hits real Amazon. May flake if Amazon blocks the request.
// Run with: npm test -- --testPathPattern=integration
describe('Scraper Integration Test', () => {
    const PRODUCT_URL = 'https://www.amazon.in/Indriya-10gm-Lakshmi-Ganesha-Gold-Coin/dp/B0GJLRV5HM';

    // Increase timeout — real HTTP requests take time
    jest.setTimeout(30000);

    it('scrapes a real Amazon India product and returns valid data', async () => {
        const product = await scrapedAmazonProduct(PRODUCT_URL);

        // If Amazon blocked us, skip gracefully
        if (!product) {
            console.warn('[Integration] Scrape returned empty — Amazon may have blocked. Skipping assertions.');
            return;
        }

        // Title should exist and be non-empty
        expect(product.title).toBeDefined();
        expect(product.title.length).toBeGreaterThan(0);
        expect(product.title.toLowerCase()).toContain('gold');

        // Price should be a positive number
        expect(product.currentPrice).toBeGreaterThan(0);
        expect(typeof product.currentPrice).toBe('number');

        // Original price should be a number (may equal current price if no discount)
        expect(product.originalPrice).toBeGreaterThan(0);

        // Currency should be ₹ for amazon.in
        expect(product.currency).toBe('₹');

        // Image should be a valid URL
        expect(product.image).toMatch(/^https:\/\/m\.media-amazon\.com/);

        // URL should match what we passed in
        expect(product.url).toBe(PRODUCT_URL);

        // Discount rate should be a number (can be 0)
        expect(typeof product.discountRate).toBe('number');
        expect(product.discountRate).toBeGreaterThanOrEqual(0);

        // isOutOfStock should be a boolean
        expect(typeof product.isOutOfStock).toBe('boolean');

        // Price should be reasonable for a 10gm gold coin (₹50,000 - ₹1,50,000 range)
        expect(product.currentPrice).toBeGreaterThan(40000);
        expect(product.currentPrice).toBeLessThan(200000);

        console.log(`[Integration] ✓ Scraped: "${product.title.substring(0, 50)}"`);
        console.log(`[Integration]   Price: ${product.currency}${product.currentPrice}`);
        console.log(`[Integration]   Original: ${product.currency}${product.originalPrice}`);
        console.log(`[Integration]   Discount: ${product.discountRate}%`);
        console.log(`[Integration]   In Stock: ${!product.isOutOfStock}`);
    });

    it('returns undefined for invalid URL', async () => {
        const result = await scrapedAmazonProduct('');
        expect(result).toBeUndefined();
    });

    it('throws error for non-existent product', async () => {
        await expect(
            scrapedAmazonProduct('https://www.amazon.in/dp/B000INVALID123')
        ).rejects.toThrow();
    });
});
