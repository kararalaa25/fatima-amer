import { HeroBio } from '@/components/HeroBio';
import { GallerySection } from '@/components/GallerySection';
import { ContactSection } from '@/components/ContactSection';
import { SiteHeader } from '@/components/SiteHeader';

const Index = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <main>
      <HeroBio />
      <GallerySection />
      <ContactSection />
    </main>
  </div>
);

export default Index;
