import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapedAmazonProduct(url: string) {
    if (!url) {
        return;
    }

    // Rotate User-Agent strings to reduce bot detection
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    ];

    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    const headers = {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
    };

    try {
        const response = await axios.get(url, {
            headers,
            timeout: 15000,
        });

        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();

        if (!title) {
            console.warn(`[Scraper] No title found for ${url} — possible bot block or DOM change`);
            return;
        }

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a-price.aok-align-center span.a-price-whole'),
            $('span.a-price.a-text-price.a-size-medium span.a-offscreen'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('span.a-price.a-text-price span.a-offscreen'),
            $('.a-price.a-text-price[data-a-strike] span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');

        const currency = extractCurrency($('.a-price-symbol'));

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            $('#main-image-container img').attr('data-a-dynamic-image') || '{}';

        let imageUrls: string[] = [];
        try {
            imageUrls = Object.keys(JSON.parse(images));
        } catch {
            imageUrls = [];
        }

        const description = extractDescription($);

        const numberOfReviews = $('#acrCustomerReviewText').text().trim().replace(/[^0-9,]/g, '') ||
            $('[data-hook=total-review-count]').text().trim().replace(/[^0-9,]/g, '');

        const starRating = $('#acrPopover .a-icon-alt').text().split(' ')[0] ||
            $('[data-hook=rating-out-of-text]').text().split(' ')[0];

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0] || '',
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            reviewsCount: numberOfReviews || 'N/A',
            stars: starRating || 'N/A',
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }

        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}