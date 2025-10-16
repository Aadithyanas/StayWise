"use client";

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BookingModal } from '../components/BookingModal';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  
  // Default search parameters for featured hotels
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => api.getProperties('New York', '2025-01-15', '2025-01-20', '2'),
  });

  const handleBookNow = (hotel: any) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setSelectedHotel(null);
  };

  const hotels = data?.properties?.slice(0, 6) || []; // Show only first 6 hotels

  // GSAP entrance animations
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.hero-sub', { y: 20, autoAlpha: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.from('.hero-cta > *', { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.08, delay: 0.25, ease: 'power3.out' });
      gsap.from('.hero-image', { scale: 1.1, autoAlpha: 0, duration: 1.2, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] md:min-h-[90vh] overflow-hidden">
        {/* Background media */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop"
            alt="Resort by the sea"
            className="hero-image h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-16 text-center text-white md:pt-32">
          <h1 className="hero-title mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
            Welcome to StayWise
          </h1>
          <p className="hero-sub mb-8 max-w-2xl text-lg text-blue-100 md:text-xl">
            Discover amazing hotels and book your perfect stay without any hassle
          </p>
          <div ref={ctaRef} className="hero-cta flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="#featured-hotels"
              className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-700 shadow hover:bg-blue-50 transition-colors"
            >
              Explore Hotels
            </a>
            <a
              href="/properties"
              className="rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-blue-700 transition-colors"
            >
              Search Properties
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why Choose StayWise?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Easy Booking</h3>
              <p className="text-gray-600">Book your stay in just a few clicks without any registration required</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Best Prices</h3>
              <p className="text-gray-600">We guarantee the best rates for your hotel bookings</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Trusted Service</h3>
              <p className="text-gray-600">Reliable booking platform trusted by thousands of travelers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section id="featured-hotels" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Featured Hotels
          </h2>
          
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading amazing hotels...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load hotels. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel: any, idx: number) => (
                  <div key={hotel.property_token || idx} className="rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                    {hotel.images && hotel.images[0] && (
                      <img
                        src={hotel.images[0].thumbnail}
                        alt={hotel.name}
                        className="h-48 w-full rounded-t-lg object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{hotel.name}</h3>
                        {hotel.overall_rating && (
                          <div className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-sm text-white">
                            <span>★</span>
                            <span>{hotel.overall_rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {hotel.description && (
                        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                      )}
                      
                      {hotel.hotel_class && (
                        <p className="mb-2 text-sm text-gray-500">{hotel.hotel_class}</p>
                      )}
                      
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Per night: </span>
                        <span className="text-lg font-bold text-blue-600">
                          {hotel.rate_per_night?.lowest || 'N/A'}
                        </span>
                      </div>
                      
                      {hotel.total_rate?.lowest && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Total: </span>
                          <span className="text-xl font-bold text-green-600">
                            {hotel.total_rate.lowest}
                          </span>
                        </div>
                      )}
                      
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {hotel.amenities.slice(0, 3).map((amenity: string, i: number) => (
                              <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                {amenity}
                              </span>
                            ))}
                            {hotel.amenities.length > 3 && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                +{hotel.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookNow(hotel)}
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </button>
                        {hotel.link && (
                          <a
                            href={hotel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hotels.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-600">No hotels available at the moment. Please check back later.</p>
                </div>
              )}

              <div className="mt-12 text-center">
                <a
                  href="/properties"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  View All Hotels
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          onClose={handleCloseBooking}
        />
      )}
      </div>
  );
}


