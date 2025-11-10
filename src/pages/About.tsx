import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Heart, Users, Award, MapPin, Phone, Mail } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { useTenant } from '../core/hooks/useTenant';

export default function About() {
  const { content } = useTenant();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>About {content.name} - Expert Occupational Therapy</title>
        <meta
          name="description"
          content="Learn about Wallsend Occupational Therapy - NDIS registered provider of expert OT services in Newcastle & Lake Macquarie. Evidence-based, client-centered care."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              About {content.name}
            </h1>
            <p className="text-xl md:text-2xl text-teal-600 mb-12 font-light">{content.tagline}</p>
          </div>
        </section>

        {/* Bio Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {content.bio}
              </p>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-12 text-center">
              Our Approach
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Client-Centered Care</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your goals drive our interventions. We listen to your needs, understand your
                  challenges, and create personalized therapy plans that empower you to achieve
                  meaningful outcomes in daily life.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Evidence-Based Practice</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our interventions are grounded in current research and best practice guidelines.
                  We combine clinical expertise with proven methodologies to deliver effective,
                  quality-assured therapy services.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Collaborative Teamwork</h3>
                <p className="text-gray-700 leading-relaxed">
                  We work closely with families, carers, support workers, and other healthcare
                  professionals to ensure coordinated, holistic care that addresses all aspects of
                  your wellbeing and independence.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Community Focused</h3>
                <p className="text-gray-700 leading-relaxed">
                  Based in Wallsend, we&apos;re proud to serve the Newcastle, Lake Macquarie, and
                  Hunter Region communities. We understand local needs and deliver accessible,
                  responsive therapy services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">Service Areas</h2>
            <p className="text-lg text-gray-700 mb-6">
              We provide occupational therapy services across:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-3 bg-teal-100 text-teal-700 rounded-full font-light">
                Newcastle
              </span>
              <span className="px-6 py-3 bg-teal-100 text-teal-700 rounded-full font-light">
                Lake Macquarie
              </span>
              <span className="px-6 py-3 bg-teal-100 text-teal-700 rounded-full font-light">
                Maitland
              </span>
              <span className="px-6 py-3 bg-teal-100 text-teal-700 rounded-full font-light">
                Hunter Region
              </span>
            </div>
          </div>
        </section>

        {/* NDIS Registration */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light mb-4">NDIS Registered Provider</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                We are proud to be registered NDIS providers, delivering quality-assured
                occupational therapy services to participants across all plan management types.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Whether you&apos;re seeking an NDIS assessment, home modifications, or ongoing
                therapy support, we&apos;re here to help you achieve your goals.
              </p>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-light hover:scale-105 transition-transform shadow-lg"
              >
                Book Assessment
              </button>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-gray-600">
                  <a
                    href="tel:0249615555"
                    className="flex items-center gap-2 hover:text-teal-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>(02) 4961 5555</span>
                  </a>
                  <a
                    href="mailto:hello@wallsendot.com.au"
                    className="flex items-center gap-2 hover:text-teal-600 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>hello@wallsendot.com.au</span>
                  </a>
                </div>
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
        platformFeePercentage={15}
      />
    </>
  );
}
