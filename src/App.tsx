import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Prices from './pages/Prices';
import FlyMeToYou from './pages/FlyMeToYou';
import AdminDashboard from './pages/AdminDashboard';
import BookingModal from './components/BookingModal';
import MobileCTABar from './components/MobileCTABar';
import { initializeSession, registerSession, trackConversion } from './utils/utm.service';

function App() {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle booking modal open
  const handleBookingOpen = () => {
    setIsBookingOpen(true);
    window.dispatchEvent(new CustomEvent('modalOpened'));
  };

  // Handle booking modal close
  const handleBookingClose = () => {
    setIsBookingOpen(false);
    window.dispatchEvent(new CustomEvent('modalClosed'));
  };

  useEffect(() => {
    // Initialize UTM tracking and session on app load
    const initTracking = async () => {
      try {
        // Initialize local session data (sync)
        const session = initializeSession();
        console.debug('Session initialized:', session.userId);

        // Register session with backend (async, non-blocking)
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        await registerSession(apiBaseUrl);

        // Track page view
        await trackConversion('page_view', { page: 'home' }, apiBaseUrl);
      } catch (error) {
        console.debug('Error initializing tracking:', error);
        // Don't fail the app if tracking fails
      }
    };

    initTracking();
  }, []);

  return (
    <>
      <Helmet>
        <title>Claire Hamilton</title>
        <meta name="description" content="Claire Hamilton - Melbourne Companion" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-rose-100">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 xl:py-6">
            <nav className="max-w-7xl mx-auto">
              {/* Mobile Layout */}
              <div className="lg:hidden flex justify-between items-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // If on admin page, go home on any click
                    if (location.pathname === '/admin') {
                      window.location.href = '/';
                      return;
                    }

                    // Otherwise, use triple-click to access admin
                    clickCountRef.current += 1;
                    const newCount = clickCountRef.current;

                    if (newCount === 3) {
                      clickCountRef.current = 0;
                      if (resetTimerRef.current) {
                        clearTimeout(resetTimerRef.current);
                        resetTimerRef.current = null;
                      }
                      window.location.href = '/admin';
                    } else {
                      // Clear existing timer
                      if (resetTimerRef.current) {
                        clearTimeout(resetTimerRef.current);
                      }

                      // Set new timer to reset counter after 500ms
                      resetTimerRef.current = setTimeout(() => {
                        clickCountRef.current = 0;
                        resetTimerRef.current = null;
                      }, 500);
                    }
                  }}
                  className="text-xl sm:text-2xl font-light text-gray-900 tracking-tight hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer select-none"
                  title={
                    location.pathname === '/admin'
                      ? 'Click to return home'
                      : 'Triple-click for surprise!'
                  }
                >
                  Claire Hamilton
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      handleBookingOpen();
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 text-sm cursor-pointer"
                    aria-label="Book an appointment now"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(!isMobileMenuOpen);
                    }}
                    className="p-2 text-gray-900 hover:text-rose-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-lg"
                    aria-label="Toggle mobile menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex justify-between items-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // If on admin page, go home on any click
                    if (location.pathname === '/admin') {
                      window.location.href = '/';
                      return;
                    }

                    // Otherwise, use triple-click to access admin
                    clickCountRef.current += 1;
                    const newCount = clickCountRef.current;

                    if (newCount === 3) {
                      clickCountRef.current = 0;
                      if (resetTimerRef.current) {
                        clearTimeout(resetTimerRef.current);
                        resetTimerRef.current = null;
                      }
                      window.location.href = '/admin';
                    } else {
                      // Clear existing timer
                      if (resetTimerRef.current) {
                        clearTimeout(resetTimerRef.current);
                      }

                      // Set new timer to reset counter after 500ms
                      resetTimerRef.current = setTimeout(() => {
                        clickCountRef.current = 0;
                        resetTimerRef.current = null;
                      }, 500);
                    }
                  }}
                  className="text-3xl xl:text-4xl font-light text-gray-900 tracking-tight hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer select-none"
                  title={
                    location.pathname === '/admin'
                      ? 'Click to return home'
                      : 'Triple-click for surprise!'
                  }
                >
                  Claire Hamilton
                </div>

                {/* Desktop Navigation */}
                <div className="flex space-x-6 xl:space-x-8 items-center">
                  <Link
                    to="/about"
                    className={`font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/about'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="About page"
                  >
                    About
                  </Link>
                  <Link
                    to="/gallery"
                    className={`font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/gallery'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Gallery page"
                  >
                    Gallery
                  </Link>
                  <Link
                    to="/prices"
                    className={`font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/prices'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Prices page"
                  >
                    Prices
                  </Link>
                  <Link
                    to="/services"
                    className={`font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/services'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Services page"
                  >
                    Services
                  </Link>
                  <Link
                    to="/fly-me-to-you"
                    className={`font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/fly-me-to-you'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Fly Me To You page"
                  >
                    Fly Me To You
                  </Link>
                  <button
                    onClick={() => {
                      handleBookingOpen();
                    }}
                    className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 whitespace-nowrap text-xs sm:text-sm lg:text-base cursor-pointer"
                    aria-label="Book an appointment now"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50">
                <div className="px-4 py-6 space-y-4">
                  <Link
                    to="/about"
                    className={`block font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/about'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="About page"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/gallery"
                    className={`block font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/gallery'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Gallery page"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Gallery
                  </Link>
                  <Link
                    to="/prices"
                    className={`block font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/prices'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Prices page"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Prices
                  </Link>
                  <Link
                    to="/services"
                    className={`block font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/services'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Services page"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    to="/fly-me-to-you"
                    className={`block font-medium transition-colors duration-300 focus:outline-none focus:text-rose-600 ${
                      location.pathname === '/fly-me-to-you'
                        ? 'text-rose-600'
                        : 'text-gray-900 hover:text-rose-600'
                    }`}
                    aria-label="Fly Me To You page"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Fly Me To You
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/services" element={<Services />} />
          <Route path="/fly-me-to-you" element={<FlyMeToYou />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* Footer - Hidden on home page and admin page */}
        {location.pathname !== '/' && location.pathname !== '/admin' && (
          <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mb-8 sm:mb-12 lg:mb-16">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 sm:mb-6">
                      Claire Hamilton
                    </h3>
                    <p className="text-gray-300 mb-4 sm:text-base lg:text-lg">
                      Real curves. Real connection. Ultimate GFE.
                    </p>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Independent escort based in Canberra, Australia
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 sm:mb-6">
                      Contact
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-gray-300 sm:text-base lg:text-lg">
                      <p>SMS Only: 0403 977 680</p>
                      <p>Email: contact.clairehamilton@proton.me</p>
                      <p>WhatsApp: +61 403 977 680</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 sm:mb-6">
                      Follow Me
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <a
                        href="#"
                        className="block text-gray-300 hover:text-pink-400 transition-colors sm:text-base lg:text-lg"
                      >
                        Twitter
                      </a>
                      <a
                        href="#"
                        className="block text-gray-300 hover:text-pink-400 transition-colors sm:text-base lg:text-lg"
                      >
                        OnlyFans (Free)
                      </a>
                      <a
                        href="#"
                        className="block text-gray-300 hover:text-pink-400 transition-colors sm:text-base lg:text-lg"
                      >
                        Bluesky
                      </a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-8 sm:pt-12 lg:pt-16 text-center">
                  <p className="text-gray-400 text-xs sm:text-sm lg:text-base">
                    © 2025 Claire Hamilton. All rights reserved. | Privacy & Discretion Guaranteed
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={handleBookingClose} />
      {location.pathname !== '/admin' && (
        <MobileCTABar ctaText="Book Now" ctaAction={handleBookingOpen} />
      )}
    </>
  );
}

export default App;
