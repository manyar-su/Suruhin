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
      <HeroSection onSearch={handleSearch} onNavigate={navigate} />
      <CategorySection onSelectCategory={handleSelectCategory} onViewAll={handleViewAllServices} />
      <PopularServices
        onViewService={handleViewService}
        onViewAllServices={handleViewAllServices}
      />
      <JoinTalentBanner onRegisterAsTalent={() => navigate('/jadi-talent')} />
      <HowItWorks />
      <RecommendedTalents onViewTalent={handleViewTalent} />
      <SafetySection onLearnMore={() => navigate('/keamanan')} />
      <Testimonials />
      <CoverageArea onSelectArea={handleSelectArea} />
      <FAQSection />
      <FinalCTA
        onFindService={handleViewAllServices}
        onJoinAsTalent={() => navigate('/jadi-talent')}
      />
    </div>
  );
}
