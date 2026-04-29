// This page assembles all the sections together
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import FeatureSection from '../components/FeatureSection'
import BubbleSection from '../components/BubbleSection'
import Footer from '../components/Footer'

function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <BubbleSection />
      <Footer />
    </div>
  )
}

export default HomePage