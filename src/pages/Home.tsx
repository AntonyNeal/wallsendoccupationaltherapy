import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const heroImages = [
  'https://pbs.twimg.com/media/G3hgK2hX0AAB8RL.jpg:large',
  'https://pbs.twimg.com/media/G3Gh-hdbUAAQTDo.jpg:large',
  'https://pbs.twimg.com/media/G3qlG5VWwAAkv0w.jpg:large',
  'https://pbs.twimg.com/media/G4OoP7-WoAA4YbX.jpg:large',
  'https://pbs.twimg.com/media/G22stVEaYAAuqaG.jpg:large',
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Claire Hamilton - Melbourne Companion</title>
        <meta
          name="description"
          content="Claire Hamilton - A sophisticated companion in Melbourne"
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Full-Screen Hero Section with Photo Carousel */}
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Carousel Container */}
          <div className="absolute inset-0 w-full h-full">
            {heroImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt="Claire Hamilton"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content Overlay */}
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-7xl md:text-8xl font-bold mb-4 drop-shadow-lg">Claire Hamilton</h1>
            <p className="text-xl md:text-3xl italic drop-shadow-lg mb-12">
              A sophisticated companion, a free-spirited sweetheart
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors drop-shadow-lg">
                Book Now
              </button>
              <Link
                to="/gallery"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white backdrop-blur-sm"
              >
                View Gallery
              </Link>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 z-20 flex gap-2 justify-center w-full">
            {heroImages.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-gradient-to-b from-white via-rose-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-5xl font-light text-gray-900 text-center mb-2 tracking-tight">
                About Claire
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 mx-auto mb-12" />
              <p className="text-lg text-gray-700 leading-relaxed text-center font-light">
                Claire Hamilton is a sophisticated and elegant companion, crafted for discerning individuals
                who appreciate the finer things in life. With an innate understanding of genuine connection,
                she brings warmth, intelligence, and an irresistible free spirit to every encounter.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed text-center font-light mt-8 italic">
                Every moment is an invitation to experience luxury through presence, conversation, and
                the art of being truly seen.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-light text-gray-900 mb-2 tracking-tight">Services</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="group relative bg-white border border-rose-100 p-10 rounded-sm hover:shadow-2xl transition-all duration-500 hover:border-rose-300">
                  <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-rose-400 to-transparent" />
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Dinner Dates</h3>
                  <p className="text-gray-700 leading-relaxed font-light">
                    Exquisite dining at Melbourne&apos;s most coveted establishments. Share meaningful
                    conversation over exceptional cuisine, creating memories of refined elegance and
                    genuine connection.
                  </p>
                  <div className="mt-6 flex items-center text-rose-400 text-sm font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inquire about availability</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>

                <div className="group relative bg-white border border-rose-100 p-10 rounded-sm hover:shadow-2xl transition-all duration-500 hover:border-rose-300">
                  <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-rose-400 to-transparent" />
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Social Events</h3>
                  <p className="text-gray-700 leading-relaxed font-light">
                    Radiant presence at galas, exclusive soirées, and intimate gatherings. Be the center
                    of attention with a companion who brings elegance, wit, and undivided attention to
                    every social occasion.
                  </p>
                  <div className="mt-6 flex items-center text-rose-400 text-sm font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inquire about availability</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>

                <div className="group relative bg-white border border-rose-100 p-10 rounded-sm hover:shadow-2xl transition-all duration-500 hover:border-rose-300">
                  <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-rose-400 to-transparent" />
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Travel Companion</h3>
                  <p className="text-gray-700 leading-relaxed font-light">
                    Explore the world with a sophisticated traveler. From serene escapes to adventurous
                    journeys, every destination becomes more meaningful shared with someone who truly
                    understands the value of presence.
                  </p>
                  <div className="mt-6 flex items-center text-rose-400 text-sm font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inquire about availability</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>

                <div className="group relative bg-white border border-rose-100 p-10 rounded-sm hover:shadow-2xl transition-all duration-500 hover:border-rose-300">
                  <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-rose-400 to-transparent" />
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Private Moments</h3>
                  <p className="text-gray-700 leading-relaxed font-light">
                    Intimate, discreet experiences tailored entirely to your desires. In a sanctuary of
                    trust and luxury, discover connection that transcends the ordinary and celebrates
                    sensuality with sophistication.
                  </p>
                  <div className="mt-6 flex items-center text-rose-400 text-sm font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inquire about availability</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-gradient-to-b from-rose-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-light text-gray-900 mb-2 tracking-tight">Let&apos;s Connect</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 mx-auto" />
              </div>
              <p className="text-center text-gray-700 text-lg font-light leading-relaxed mb-12 tracking-wide">
                Every meaningful connection begins with a genuine conversation. Reach out to discuss
                your expectations, desires, and the kind of experience you seek. Discretion, elegance,
                and authentic presence are my promise to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="group px-10 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-sm font-light tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Send Inquiry
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="group px-10 py-4 border-2 border-rose-300 text-rose-400 rounded-sm font-light tracking-wide hover:bg-rose-50 hover:border-rose-400 transition-all duration-300">
                  Schedule Call
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="mt-16 pt-12 border-t border-rose-200">
                <p className="text-center text-gray-600 text-sm font-light tracking-wide">
                  Response within 24 hours • Absolute discretion guaranteed • Available for engagements across Australia
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
