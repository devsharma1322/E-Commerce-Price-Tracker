import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapedAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
    try {
        await connectToDB();

        const products = await Product.find({});

        if (!products || products.length === 0) {
            return NextResponse.json({ message: "No products to update" });
        }

        const updatedProducts = await Promise.allSettled(
            products.map(async (currentProduct) => {
                try {
                    const scrapedProduct = await scrapedAmazonProduct(currentProduct.url);

                    if (!scrapedProduct) {
                        console.warn(`[Cron] Skipping ${currentProduct.url} — scrape returned empty`);
                        return null;
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
                    }
                    return updatedProduct;
                } catch (innerError: any) {
                    console.error(`[Cron] Error processing ${currentProduct.url}: ${innerError.message}`);
                    return null;
                }
            })
        );

        const successful = updatedProducts.filter(r => r.status === 'fulfilled' && r.value !== null).length;
        const failed = updatedProducts.length - successful;

        return NextResponse.json({
            message: "Ok",
            data: { total: products.length, successful, failed },
        });
    } catch (error: any) {
        console.error(`[Cron] Fatal error: ${error.message}`);
        return NextResponse.json(
            { error: `Error in cron: ${error.message}` },
            { status: 500 }
        );
    }
}