import { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"

interface Props {
    product: Product
}

const ProductCard = ({ product }: Props) => {
    return (
        <Link href={`/products/${product._id}`} className="product-card">
            <div className="product-card_img-container">
                {product.image ? (
                    <Image src={product.image} alt={product.title} width={200} height={200} quality={100} className="product-card_img" />
                ) : (
                    <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>
            <div className="flex flex-col gap-3">
                <h3 className="product-title">{product.title}</h3>
                <div className="flex justify-between">
                    <p className="text-black text-lg font-semibold"><span>{product?.currency}</span><span>{product?.currentPrice}</span></p>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard