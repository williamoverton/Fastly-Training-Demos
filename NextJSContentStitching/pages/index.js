import Head from 'next/head'
import Image from 'next/image'
import NavBar from '../components/navbar'
import Products from '../components/products'
import Footer from '../components/footer'
import ABTesting from '../lib/abTesting'
import Banner from '../components/banner'
import { getProducts } from '../lib/products'
import { getBannerContent } from '../lib/banner'
import {} from "../lib/devFastlyStub";

export default function Home({products, headerAb, bannerContent}) {
  return (
    <div>
      <Head>
        <title>Pet Shop</title>
        <meta name="description" content="A Fastly C@E App" />
        <link rel="icon" href="https://www.fastly.com/favicon.ico" />
      </Head>

      <NavBar headerAb={headerAb} />

      <Banner content={bannerContent}/>

      <Products products={products}/>

      <Footer />
    </div>
  )
}

export async function getServerSideProps({req, res}) {

  // Return props
  return {
    props: {
      // Get products from API
      products: await getProducts([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),

      // Return A/B testing header design
      headerAb: ABTesting(req, res),

      bannerContent: await getBannerContent()
    },
  }
}

