import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { DollarSign, Clock, FileText, Phone, Mail } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { useTenant } from '../core/hooks/useTenant';

export default function Prices() {
  const { content } = useTenant();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const services = content.services || [];

  return (
    <>
      <Helmet>
        <title>Pricing - {content.name} | Transparent OT Service Fees</title>
        <meta
          name="description"
          content="Clear, transparent pricing for occupational therapy services in Newcastle."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">Service Pricing</h1>
            <p className="text-xl md:text-2xl text-teal-600 mb-8 font-light">
              Transparent, Fair, Professional
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe in transparent pricing with no hidden fees.
            </p>
          </div>
        </section>
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-2xl font-light text-gray-900 mb-4">{service.name}</h3>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <DollarSign className="w-6 h-6 text-teal-600" />
                      <span className="text-4xl font-light text-teal-600">{service.price}</span>
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{service.duration}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                  {service.featured && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Popular Choice</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
              <h2 className="text-3xl md:text-4xl font-light mb-4">Questions About Pricing?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
                Contact us for a quote or to discuss your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-light hover:scale-105 transition-transform shadow-lg"
                >
                  Book Assessment
                </button>
              </div>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-white/90">
                <a
                  href="tel:0249615555"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>(02) 4961 5555</span>
                </a>
                <a
                  href="mailto:hello@wallsendot.com.au"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@wallsendot.com.au</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        provider={{
          id: 'wallsend',
          name: content.name,
          specialty: content.tagline,
          isVerified: true,
        }}
        hourlyRate={250}
        platformFeePercentage={0}
      />
    </>
  );
}
