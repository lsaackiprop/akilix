import Navbar from "@/src/components/navigation/Navbar";
import Hero from "@/src/components/hero/Hero";
import TrustedBySchools from "@/src/components/sections/TrustedBySchools";
import BrowseByLearningLevels from "@/src/components/hero/BrowseByLearningLevels";
import PopularLearningAreas from "@/src/components/cards/PopularLearningAreas";
import TrendingResources from "@/src/components/sections/TrendingResources";
import LatestUploads from "@/src/components/sections/LatestUploads";
import TeacherCorner from "@/src/components/sections/TeacherCorner";
import PastPapersSection from "@/src/components/sections/PastPapersSection";
import Testimonials from "@/src/components/sections/Testimonials";
import FaqSection from "@/src/components/sections/FaqSection";
import PricingSection from "@/src/components/sections/PricingSection";
import CtaBanner from "@/src/components/common/CtaBanner";
import Footer from "@/src/components/footer/Footer";
import dynamic from "next/dynamic";

const SupabaseConnectionDebug = dynamic(
  () => import("@/src/components/debug/SupabaseConnectionDebug"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustedBySchools />
        <BrowseByLearningLevels />
        <PopularLearningAreas />
        <TrendingResources />
        <LatestUploads />
        <TeacherCorner />
        <PastPapersSection />
        <Testimonials />
        <FaqSection />
        <PricingSection />
        <CtaBanner />
      </main>
      <Footer />
      <SupabaseConnectionDebug />
    </div>
  );
}
