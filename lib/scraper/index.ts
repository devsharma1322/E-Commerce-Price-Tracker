import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapedAmazonProduct(url: string) {
    if (!url) {
        return;
    }

    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('span.a-price-fraction')
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('span.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');

        const currency = extractCurrency($('.a-price-symbol'))

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavvailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';
        const imageUrls = Object.keys(JSON.parse(images));

        const description = extractDescription($);

        const numberOfReviews = $('[data-hook=total-review-count]').text().trim().replace(/[^0-9,]/g, '');

        const starRating = $('[data-hook=rating-out-of-text]').text().split(' ')[0];

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
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