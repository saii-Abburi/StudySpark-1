import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Home from '../components/Home';
import Footer from '../components/Footer';

export default function Landing() {
  const [isDark, setIsDark] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Add dark class on mount to ensure default is dark mode
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  if (loading) return null;
  
  // Strict redirect: never show landing page to logged in users
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 scroll-smooth ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Navbar isDark={isDark} toggleDark={toggleDark} />
      <div className="flex-grow">
        <Home />
      </div>
      <Footer />
    </div>
  );
}
