import { extractPrice, extractCurrency, getHighestPrice, getLowestPrice, getAveragePrice, getEmailNotifType, formatNumber } from '../lib/utils';
import * as cheerio from 'cheerio';

// Helper to create a cheerio element from HTML
function $el(html: string) {
    const $ = cheerio.load(html);
    return $.root().children();
}

describe('extractPrice', () => {
    it('extracts price from simple text', () => {
        const el = $el('<span>1,299</span>');
        expect(extractPrice(el)).toBe('1299');
    });

    it('extracts price with rupee symbol', () => {
        const el = $el('<span>₹2,499.00</span>');
        expect(extractPrice(el)).toBe('2499.00');
    });

    it('extracts price without decimals', () => {
        const el = $el('<span>999</span>');
        expect(extractPrice(el)).toBe('999');
    });

    it('returns empty string for empty element', () => {
        const el = $el('<span></span>');
        expect(extractPrice(el)).toBe('');
    });

    it('uses first matching element from multiple args', () => {
        const empty = $el('<span></span>');
        const withPrice = $el('<span>₹599</span>');
        expect(extractPrice(empty, withPrice)).toBe('599');
    });

    it('handles Indian format with lakh notation', () => {
        const el = $el('<span>1,29,999</span>');
        expect(extractPrice(el)).toBe('129999');
    });
});

describe('extractCurrency', () => {
    it('extracts rupee symbol', () => {
        const el = $el('<span>₹</span>');
        expect(extractCurrency(el)).toBe('₹');
    });

    it('extracts dollar symbol', () => {
        const el = $el('<span>$99</span>');
        expect(extractCurrency(el)).toBe('$');
    });

    it('returns empty for no text', () => {
        const el = $el('<span></span>');
        expect(extractCurrency(el)).toBe('');
    });
});

describe('getHighestPrice', () => {
    it('returns highest from price list', () => {
        const prices = [{ price: 100 }, { price: 250 }, { price: 180 }];
        expect(getHighestPrice(prices)).toBe(250);
    });

    it('works with single item', () => {
        expect(getHighestPrice([{ price: 500 }])).toBe(500);
    });

    it('returns 0 for empty array', () => {
        expect(getHighestPrice([])).toBe(0);
    });
});

describe('getLowestPrice', () => {
    it('returns lowest from price list', () => {
        const prices = [{ price: 100 }, { price: 250 }, { price: 50 }];
        expect(getLowestPrice(prices)).toBe(50);
    });

    it('works with single item', () => {
        expect(getLowestPrice([{ price: 300 }])).toBe(300);
    });

    it('returns 0 for empty array', () => {
        expect(getLowestPrice([])).toBe(0);
    });
});

describe('getAveragePrice', () => {
    it('calculates correct average', () => {
        const prices = [{ price: 100 }, { price: 200 }, { price: 300 }];
        expect(getAveragePrice(prices)).toBe(200);
    });

    it('handles single price', () => {
        expect(getAveragePrice([{ price: 150 }])).toBe(150);
    });

    it('returns 0 for empty array', () => {
        expect(getAveragePrice([])).toBe(0);
    });
});

describe('getEmailNotifType', () => {
    const baseProduct = {
        url: 'https://amazon.in/test',
        currency: '₹',
        image: '',
        title: 'Test',
        currentPrice: 500,
        originalPrice: 1000,
        priceHistory: [{ price: 600 }, { price: 550 }],
        highestPrice: 1000,
        lowestPrice: 550,
        averagePrice: 575,
        discountRate: 50,
        description: '',
        reviewsCount: '10',
        stars: '4.5',
        isOutOfStock: false,
        users: [],
    };

    it('returns LOWEST_PRICE when price drops below history low', () => {
        const scraped = { ...baseProduct, currentPrice: 400 };
        const current = { ...baseProduct };
        expect(getEmailNotifType(scraped, current)).toBe('LOWEST_PRICE');
    });

    it('returns CHANGE_OF_STOCK when product comes back in stock', () => {
        const scraped = { ...baseProduct, currentPrice: 600, isOutOfStock: false };
        const current = { ...baseProduct, isOutOfStock: true };
        expect(getEmailNotifType(scraped, current)).toBe('CHANGE_OF_STOCK');
    });

    it('returns THRESHOLD_MET when discount is 40%+', () => {
        const scraped = { ...baseProduct, currentPrice: 600, discountRate: 45 };
        const current = { ...baseProduct };
        expect(getEmailNotifType(scraped, current)).toBe('THRESHOLD_MET');
    });

    it('returns null when no notification condition met', () => {
        const scraped = { ...baseProduct, currentPrice: 560, discountRate: 10 };
        const current = { ...baseProduct };
        expect(getEmailNotifType(scraped, current)).toBeNull();
    });
});

describe('formatNumber', () => {
    it('formats number with commas', () => {
        expect(formatNumber(1000)).toBe('1,000');
    });

    it('handles zero', () => {
        expect(formatNumber(0)).toBe('0');
    });

    it('handles undefined', () => {
        expect(formatNumber(undefined)).toBe('0');
    });
});
