import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import { getProductById, getSimilarProducts } from "@/lib/actions"
import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import { ArrowRight, MessageCircle, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
    params: { id: string }
}

const ProductDetails = async ({ params: { id } }: Props) => {
    const product: Product = await getProductById(id);

    if (!product) redirect('/');

    const similarProducts = await getSimilarProducts(id);

    return (
        <div className="product-container">
            <div className="flex gap-28 xl:flex-row flex-col">
                <div className="product-image">
                    <Image src={product.image} alt={product.title} width={580} height={400} quality={100} className="mx-auto" />
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
                        <div className="flex flex-col gap-3">
                            <p className="text[28px] text-secondary font-semibold">{product.title}</p>
                            <Link href={product.url} target="_blank" className="flex items-center text-base text-black opacity-60">Visit Product <ArrowRight className="w-[18px] h-[18px] ml-1.5" /></Link>
                        </div>
                    </div>
                    <div className="product-info">
                        <div className="flex flex-col gap-2">
                            <p className="text-[34px] text-secondary font-bold">{product.currency} {formatNumber(product.currentPrice)}</p>
                            <p className="text-[21px] text-black opacity-50 line-through">{product.currency} {formatNumber(product.originalPrice)}</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <div className="product-stars">
                                    <Star className="w-[16px] h-[16px]" />
                                    <p className="text-sm text-primary-orange font-semibold">{product.stars || 'N/A'}</p>
                                </div>
                                <div className="product-reviews">
                                    <MessageCircle className="w-[16px] h-[16px]" />
                                    <p className="text-sm text-secondary font-semibold">{product.reviewsCount} Reviews</p>
                                </div>
                            </div>
                            <p className="text-sm text-black opacity-50"><span className="text-primary-green font-semibold">{Math.floor((Number(product.stars) / 5) * 100)}%</span> of buyers have recommened this.</p>
                        </div>
                    </div>
                    <div className="my-7 flex flex-col gap-5">
                        <div className="flex gap-5 flex-wrap">
                            <PriceInfoCard title='Current Price' value={`${product.currency} ${formatNumber(product.currentPrice)}`} />
                            <PriceInfoCard title='Average Price' value={`${product.currency} ${formatNumber(product.averagePrice)}`} />
                            <PriceInfoCard title='Highest Price' value={`${product.currency} ${formatNumber(product.highestPrice)}`} />
                            <PriceInfoCard title='Lowest Price' value={`${product.currency} ${formatNumber(product.lowestPrice)}`} />
                        </div>
                    </div>
                    <Modal productId={id} />
                </div>
            </div>
            <div className="flex flex-col gap-16">
                <div className="flex flex-col gap-5">
                    <h3 className="text-2xl text-secondary font-bold">Product Description</h3>
                    <div className="flex flex-col gap-4">
                        {product?.description.split('\n').slice(0, 25)}
                    </div>
                </div>
                <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
                    <ShoppingBag className="w-[22px] h-[22px]" />
                    <Link href={product.url} target="_blank" className="text-base text-white">Buy Now</Link>
                </button>
            </div>
            {similarProducts && similarProducts?.length > 0 ? (
                <div className="py-14 flex flex-col gap-2 w-full">
                    <p className="section-text">Similar Products</p>
                    <div className="flex flex-wrap gap-10 mt-7 w-[90v] sm:w-full">
                        {similarProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default ProductDetails;