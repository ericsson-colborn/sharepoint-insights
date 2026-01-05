import { lazy, Suspense } from 'react';
import { msalInstance, loginRequest } from '../lib/msal';
import { AppNavigation } from '../components/layout/AppNavigation';
import { AppFooter } from '../components/layout/AppFooter';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { ValuePropsSection } from '../components/landing/ValuePropsSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { VideoBackground } from '../components/landing/VideoBackground';
import bkgMoveVideo from '../../assets/bkg_move.mp4';

// Lazy load below-fold sections for better initial page load performance
const PricingSection = lazy(() => import('../components/landing/PricingSection').then(m => ({ default: m.PricingSection })));
const CTASection = lazy(() => import('../components/landing/CTASection').then(m => ({ default: m.CTASection })));

export function LandingPage() {
  const handleLogin = () => {
    msalInstance.loginRedirect(loginRequest);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppNavigation isAuthenticated={false} isLandingPage={true} />

      <HeroSection
        onLogin={handleLogin}
      />

      <FeaturesSection />

      <VideoBackground videoSrc={bkgMoveVideo} overlayOpacity={0.9} enableParallax={true}>
        <ValuePropsSection />
        <ComparisonSection />
      </VideoBackground>

      <Suspense fallback={<div className="py-20 bg-gray-50" />}>
        <PricingSection onLogin={handleLogin} />
      </Suspense>

      <Suspense fallback={<div className="py-40 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800" />}>
        <CTASection onLogin={handleLogin} />
      </Suspense>

      <AppFooter />
    </div>
  );
}
