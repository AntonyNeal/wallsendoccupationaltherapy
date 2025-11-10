import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useTenant } from '../core/hooks/useTenant';
import type { Service } from '../core/types/tenant.types';
import BookingModal from '../components/BookingModal';

export default function Services() {
  const { content, loading } = useTenant();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [_selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Services - {content.name}</title>
        <meta name="description" content={`Professional occupational therapy services from `} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        {/* Hero Section */}
        <div className="bg-teal-600 text-white py-16 px-4 sm:px-6 lg:px-8 mb-12">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Our Services</h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto opacity-90">{content.tagline}</p>
            <p className="text-md mt-4 opacity-80">
              NDIS Registered Provider | Evidence-Based Practice | Client-Centered Care
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.services?.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{service.icon || ''}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                    </div>
                    {service.featured && (
                      <span className="inline-block bg-coral-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        FEATURED SERVICE
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                  {service.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="block text-gray-500 font-semibold mb-1">Duration:</span>
                    <span className="text-gray-900">{service.duration}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-semibold mb-1">Price:</span>
                    <span className="text-teal-600 font-bold text-lg">{service.priceDisplay}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookService(service)}
                  className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all duration-300"
                >
                  {service.price === 0 ? 'Request Quote' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Solutions CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-gradient-to-r from-teal-600 to-ocean-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Need a Custom Assessment?</h2>
            <p className="text-lg sm:text-xl mb-6 opacity-90">
              We can tailor our services to meet your specific occupational therapy needs.
            </p>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-8 py-4 bg-white text-teal-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Contact Us Today
            </button>
          </div>
        </div>

        {/* Service Categories Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Service Delivery Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-white p-6 rounded-lg shadow">
                <div className="text-4xl mb-3"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Clinic-Based</h3>
                <p className="text-gray-600 text-sm">
                  Professional assessments in our modern facility
                </p>
              </div>
              <div className="text-center bg-white p-6 rounded-lg shadow">
                <div className="text-4xl mb-3"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Home Visits</h3>
                <p className="text-gray-600 text-sm">Assessments in your natural environment</p>
              </div>
              <div className="text-center bg-white p-6 rounded-lg shadow">
                <div className="text-4xl mb-3"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Workplace</h3>
                <p className="text-gray-600 text-sm">Ergonomic assessments at your worksite</p>
              </div>
            </div>
          </div>
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
