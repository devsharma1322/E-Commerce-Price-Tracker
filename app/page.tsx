import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getTrendingProducts } from '@/lib/actions';
import ProductCard from '@/components/ProductCard';


const Home = async () => {

  const trendingProducts = await getTrendingProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text flex items-center">Smart Shopping Starts Here: <ArrowRight className='h-[18px] w-[18px]' /></p>
            <h1 className="head-text">
              Unleash the power of
              <div className="flex items-center gap-2 sm:mt-3">
                <span className='text-primary'> Trackazon</span>
                <Image src='/assets/icons/piggyBank.svg' alt='piggy bank' width={70} height={70} className='hidden sm:inline-block' />
              </div>
            </h1>
            <p className="mt-6">Stay ahead of the savings game with Trackazon, your personal Amazon shopping assistant!</p>
            <SearchBar />
          </div>
          <HeroCarousel />
        </div>
      </section>
      <section className='trending-section'>
        <h2 className="section-text">Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {trendingProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}

export default Home