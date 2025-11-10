import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTenant } from './core/hooks/useTenant';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Prices from './pages/Prices';
import BookingModal from './components/BookingModal';
import MobileCTABar from './components/MobileCTABar';
import { initializeSession, registerSession, trackConversion } from './utils/utm.service';

function App() {
  const { content, loading } = useTenant();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBookingOpen = () => {
    setIsBookingOpen(true);
    window.dispatchEvent(new CustomEvent('modalOpened'));
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    window.dispatchEvent(new CustomEvent('modalClosed'));
  };

  useEffect(() => {
    const initTracking = async () => {
      try {
        initializeSession();
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        await registerSession(apiBaseUrl);
        await trackConversion('page_view', { page: 'home' }, apiBaseUrl);
      } catch (error) {
        console.debug('Error initializing tracking:', error);
      }
    };
    initTracking();
  }, []);

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/', label: 'Home', icon: '' },
    { path: '/services', label: 'Services', icon: '' },
    { path: '/about', label: 'About', icon: 'ℹ' },
    { path: '/prices', label: 'Prices', icon: '' },
  ];

  return (
    <>
      <Helmet>
        <title>{content.name}</title>
        <meta name="description" content={content.shortBio || content.bio} />
      </Helmet>

      <style>
        {`
          /* Holographic windshield effect */
          .holographic-menu {
            background: linear-gradient(
              135deg,
              rgba(13, 148, 136, 0.95) 0%,
              rgba(3, 105, 161, 0.95) 50%,
              rgba(13, 148, 136, 0.95) 100%
            );
            backdrop-filter: blur(20px);
            animation: holographicShimmer 3s ease-in-out infinite;
          }

          @keyframes holographicShimmer {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          .holographic-icon {
            text-shadow: 
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(13, 148, 136, 0.6),
              0 0 30px rgba(3, 105, 161, 0.4);
            animation: iconFloat 3s ease-in-out infinite;
          }

          @keyframes iconFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .menu-slide-in {
            animation: slideDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }

          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .hamburger-line {
            transition: all 0.3s ease;
          }

          .hamburger-open .line1 {
            transform: rotate(45deg) translateY(8px);
          }

          .hamburger-open .line2 {
            opacity: 0;
          }

          .hamburger-open .line3 {
            transform: rotate(-45deg) translateY(-8px);
          }
        `}
      </style>

      <div className="min-h-screen bg-white relative">
        {/* Minimalist Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl sm:text-2xl font-light text-gray-900 hover:text-teal-600 transition-colors duration-300"
            >
              {content.name}
            </Link>

            {/* Hamburger Icon */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${isMenuOpen ? 'hamburger-open' : ''} p-2 focus:outline-none`}
              aria-label="Menu"
            >
              <div className="w-6 space-y-1.5">
                <div className="hamburger-line line1 h-0.5 bg-gray-900"></div>
                <div className="hamburger-line line2 h-0.5 bg-gray-900"></div>
                <div className="hamburger-line line3 h-0.5 bg-gray-900"></div>
              </div>
            </button>
          </div>
        </header>

        {/* Holographic Windshield Menu Dropdown */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Holographic Menu Panel */}
            <div className="fixed top-0 left-0 right-0 z-50 holographic-menu menu-slide-in shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/80 hover:text-white p-2 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items with Holographic Icons */}
                <nav className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group"
                    >
                      <div className="holographic-icon text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <span className="text-white text-lg font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* CTA Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleBookingOpen();
                    }}
                    className="px-8 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    Book Assessment
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-8 text-center text-white/80 text-sm space-y-2">
                  <p>{content.contact.phoneDisplay}</p>
                  <p>{content.contact.email}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/prices" element={<Prices />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} {content.name}. All rights reserved.
            </p>
            <p className="mt-2">{content.contact.location}</p>
          </div>
        </footer>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleBookingClose}
        provider={{
          id: 'wallsend',
          name: content.name,
        }}
        hourlyRate={content.pricing?.hourly || 190}
        platformFeePercentage={0}
      />

      <MobileCTABar onBookNow={handleBookingOpen} />
    </>
  );
}

export default App;
