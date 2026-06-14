import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapedAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

const DELAY_BETWEEN_SCRAPES_MS = 2000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeWithRetry(url: string, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await scrapedAmazonProduct(url);
            return result;
        } catch (error: any) {
            console.warn(`[Cron] Attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
            if (attempt === retries) throw error;
            await sleep(RETRY_DELAY_MS * attempt);
        }
    }
}

export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        await connectToDB();

        const products = await Product.find({});

        if (!products || products.length === 0) {
            return NextResponse.json({ message: "No products to update" });
        }

        console.log(`[Cron] Starting price update for ${products.length} products`);

        const results = [];

        // Rate-limited sequential scraping to avoid bot detection
        for (const currentProduct of products) {
            const productStart = Date.now();
            try {
                const scrapedProduct = await scrapeWithRetry(currentProduct.url);

                if (!scrapedProduct) {
                    console.warn(`[Cron] Skipping ${currentProduct.url} — scrape returned empty`);
                    results.push({ url: currentProduct.url, status: 'skipped' });
                    await sleep(DELAY_BETWEEN_SCRAPES_MS);
                    continue;
                }

                const updatedPriceHistory: any = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                ];

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory)
                };

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product,
                    { new: true }
                );

                const emailNotifactionType = getEmailNotifType(scrapedProduct, currentProduct);

                if (emailNotifactionType && updatedProduct?.users?.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url
                    };

                    const emailContent = await generateEmailBody(productInfo, emailNotifactionType);
                    const userEmails = updatedProduct.users.map((user: any) => user.email);
                    await sendEmail(emailContent, userEmails);

                    console.log(`[Cron] Email sent (${emailNotifactionType}) for "${updatedProduct.title}" to ${userEmails.length} users`);
                }

                const elapsed = Date.now() - productStart;
                console.log(`[Cron] ✓ Updated "${scrapedProduct.title?.substring(0, 40)}" — ₹${scrapedProduct.currentPrice} (${elapsed}ms)`);
                results.push({ url: currentProduct.url, status: 'success', price: scrapedProduct.currentPrice, duration: elapsed });

            } catch (innerError: any) {
                const elapsed = Date.now() - productStart;
                console.error(`[Cron] ✗ Failed ${currentProduct.url} after ${MAX_RETRIES} retries: ${innerError.message} (${elapsed}ms)`);
                results.push({ url: currentProduct.url, status: 'failed', error: innerError.message, duration: elapsed });
            }

            // Rate limiting: wait between scrapes
            await sleep(DELAY_BETWEEN_SCRAPES_MS);
        }

        const successful = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const totalDuration = Date.now() - startTime;

        console.log(`[Cron] Completed: ${successful} success, ${failed} failed, ${skipped} skipped — Total: ${totalDuration}ms`);

        return NextResponse.json({
            message: "Ok",
            data: { total: products.length, successful, failed, skipped, durationMs: totalDuration },
        });
    } catch (error: any) {
        const totalDuration = Date.now() - startTime;
        console.error(`[Cron] Fatal error after ${totalDuration}ms: ${error.message}`);
        return NextResponse.json(
            { error: `Error in cron: ${error.message}` },
            { status: 500 }
        );
    }
}