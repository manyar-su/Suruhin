import { HeroSection } from '../components/home/HeroSection';
import { CategorySection } from '../components/home/CategorySection';
import { PopularServices } from '../components/home/PopularServices';
import { RecommendedTalents } from '../components/home/RecommendedTalents';
import { HowItWorks } from '../components/home/HowItWorks';
import { SafetySection } from '../components/home/SafetySection';
import { JoinTalentBanner } from '../components/home/JoinTalentBanner';
import { Testimonials } from '../components/home/Testimonials';
import { CoverageArea } from '../components/home/CoverageArea';
import { FAQSection } from '../components/home/FAQSection';
import { FinalCTA } from '../components/home/FinalCTA';

interface HomeProps {
  navigate: (path: string) => void;
}

export function Home({ navigate }: HomeProps) {
  const handleSearch = (query: string) => {
    navigate(`/layanan?search=${encodeURIComponent(query)}`);
  };

  const handleSelectCategory = (categorySlug: string) => {
    navigate(`/layanan?category=${encodeURIComponent(categorySlug)}`);
  };

  const handleViewService = (slug: string) => {
    navigate(`/layanan/${slug}`);
  };

  const handleViewAllServices = () => {
    navigate('/layanan');
  };

  const handleViewTalent = (slug: string) => {
    navigate(`/talent/${slug}`);
  };

  const handleSelectArea = (locationName: string) => {
    navigate(`/talent?location=${encodeURIComponent(locationName)}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Header */}
      <HeroSection onSearch={handleSearch} onNavigate={navigate} />

      {/* Grid of Categories */}
      <CategorySection onSelectCategory={handleSelectCategory} />

      {/* Popular services harian */}
      <PopularServices
        onViewService={handleViewService}
        onViewAllServices={handleViewAllServices}
      />

      {/* Verified Local Talents */}
      <RecommendedTalents onViewTalent={handleViewTalent} />

      {/* Visual Timeline of process */}
      <HowItWorks />

      {/* Deep Dive Security protections & standard policies */}
      <SafetySection onLearnMore={() => navigate('/keamanan')} />

      {/* Join Talent community builder banner */}
      <JoinTalentBanner onRegisterAsTalent={() => navigate('/jadi-talent')} />

      {/* Reviews and Ratings of UNSIL & Tasik local residents */}
      <Testimonials />

      {/* Network Dot SVG Map region density list */}
      <CoverageArea onSelectArea={handleSelectArea} />

      {/* Interactive FAQ list accordion */}
      <FAQSection />

      {/* Bottom Conversion Area */}
      <FinalCTA
        onFindService={handleViewAllServices}
        onJoinAsTalent={() => navigate('/jadi-talent')}
      />
    </div>
  );
}
