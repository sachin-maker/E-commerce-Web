
import HeroSection from "@/app/components/home/HeroSection";
import CategoriesSection from "@/app/components/home/CategoriesSection";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import PromotionalBanners from "@/app/components/home/PromotionalBanners";
import BenefitsSection from "@/app/components/home/BenefitsSection";
import Footer from "@/app/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <main className="homepage">
        <HeroSection />

        <CategoriesSection />

        <FeaturedProducts />

        <PromotionalBanners />

        <BenefitsSection />
      </main>

      <Footer />
    </>
  );
}