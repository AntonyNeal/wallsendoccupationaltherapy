import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useTenant } from '../core/hooks/useTenant';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const { content } = useTenant();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>{content.name}</title>
        <meta name="description" content={``} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50">
        <div className="text-center px-8 max-w-3xl mx-auto">
          {/* Minimalistic Hero */}
          <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 tracking-tight">
            {content.name}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-500 font-light mb-16">{content.tagline}</p>

          {/* Single CTA */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-12 py-5 bg-teal-600 text-white rounded-full font-light text-lg hover:bg-teal-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Book Assessment
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        provider={{
          id: 'wallsend',
          name: content.name,
        }}
        hourlyRate={content.pricing?.hourly || 190}
        platformFeePercentage={0}
      />
    </>
  );
}
