import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SocialProof from '../components/SocialsProof';
import About from '../components/About';
import Roadmap from '../components/RoadMap';
import Comparison from '../components/Comparison';
import Features from '../components/Features';
import SubjectOverview from '../components/SubjectOverview';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Landing() {
  const [isDark, setIsDark] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 scroll-smooth ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Navbar isDark={isDark} toggleDark={toggleDark} />
      
      <main className="flex-grow pt-20">
        {/* 1. Home (Hero Section) */}
        <Hero />
        
        {/* 2. Trusted by Serious Aspirants (Trust Strip) */}
        <div className="relative -mt-10 mb-10 z-20">
             <SocialProof />
        </div>
        
        {/* 3. About Study Sparks */}
        <About />
        
        {/* 4. 45-Day Rank Roadmap */}
        <Roadmap />
        
        {/* 5. Why Study Sparks */}
        <Comparison />
        
        {/* 6. Mock Tests (using Features for now as it contains tests/tracking) */}
        <div id="mock-tests">
          <Features />
        </div>
        
        {/* 7. Subjects */}
        <SubjectOverview />
        
        {/* 8. Student Feedback (Testimonials - using SocialProof as placeholder or stats) */}
        {/* Note: If a separate Testimonials file is missing, we showcase stats in SocialProof */}
        
        {/* 9. Get in Touch (Includes Final CTA) */}
        <Contact />
        
      </main>

      <Footer />
    </div>
  );
}
