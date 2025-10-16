"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { convertUsdPriceStringToINRDisplay } from '../../lib/currency';
import { BookingModal } from '../../components/BookingModal';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';

function formatDate(input: Date): string {
  return input.toISOString().split('T')[0];
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement | null>(null);
  // Dynamic defaults: today and +3 days
  const today = useMemo(() => new Date(), []);
  const plus3 = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    return d;
  }, [today]);

  // Initialize from URL params if present, else dynamic defaults
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  // Load saved params from localStorage
  const saved = typeof window !== 'undefined' ? localStorage.getItem('sw:lastSearch') : null;
  const savedObj = saved ? (JSON.parse(saved) as { location?: string; checkIn?: string; checkOut?: string; adults?: string }) : {};
  const initialLocation = params?.get('location') || savedObj.location || '';
  const initialCheckIn = params?.get('checkIn') || formatDate(today);
  const initialCheckOut = params?.get('checkOut') || formatDate(plus3);
  const initialAdults = params?.get('adults') || savedObj.adults || '2';

  // Search state
  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState('2');
  useEffect(() => { setAdults(initialAdults); }, [initialAdults]);

  // Decoupled query state to avoid refetch on every keystroke
  const [qLocation, setQLocation] = useState(initialLocation || '');
  const [qCheckIn, setQCheckIn] = useState(initialCheckIn);
  const [qCheckOut, setQCheckOut] = useState(initialCheckOut);
  const [qAdults, setQAdults] = useState(initialAdults);
  
  // Booking modal state
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [localQuery, externalQuery] = useQueries({
    queries: [
      {
        queryKey: ['local-properties'],
        queryFn: api.getLocalProperties,
      },
      {
        queryKey: ['external-properties', qLocation, qCheckIn, qCheckOut, qAdults],
        queryFn: () => api.getProperties(qLocation, qCheckIn, qCheckOut, qAdults),
        enabled: !!qLocation && !!qCheckIn && !!qCheckOut,
        placeholderData: (prev: any) => prev,
      },
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const search = new URLSearchParams({
      location,
      checkIn,
      checkOut,
      adults,
    });
    // Push to URL for shareable state
    router.push(`/properties?${search.toString()}`);
    // Save to localStorage for future default
    if (typeof window !== 'undefined') {
      localStorage.setItem('sw:lastSearch', JSON.stringify({ location, checkIn, checkOut, adults }));
    }
    // Update query state to trigger fetch once
    setQLocation(location);
    setQCheckIn(checkIn);
    setQCheckOut(checkOut);
    setQAdults(adults);
    externalQuery.refetch();
  };

  // Try to auto-detect location only once on mount if nothing preset
  useEffect(() => {
    const shouldAutolocate = !initialLocation && !savedObj.location && !(params && params.get('location'));
    if (!shouldAutolocate) return;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocation('New York');
      setQLocation('New York');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept': 'application/json' } }
          );
          const json = await resp.json();
          const city = json?.address?.city || json?.address?.town || json?.address?.village || json?.address?.state || 'New York';
          setLocation(city);
          setQLocation(city);
        } catch {
          setLocation('New York');
          setQLocation('New York');
        }
      },
      () => { setLocation('New York'); setQLocation('New York'); },
      { enableHighAccuracy: false, timeout: 3000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const isLoading = externalQuery.isLoading || localQuery.isLoading;
  const hasError = Boolean(externalQuery.error);
  const errorMessage = hasError ? (externalQuery.error as Error).message : '';

  // Prepare combined results
  const localAll = (localQuery.data?.properties ?? []) as any[];
  const localFiltered = localAll.filter((p) =>
    !qLocation ? true : `${p.location}`.toLowerCase().includes(qLocation.toLowerCase())
  );
  // If admin is logged in, show their local properties first; else show all local first
  const localOrdered = user?.role === 'admin'
    ? localFiltered.filter((p: any) => p.ownerId === user.id).concat(localFiltered.filter((p: any) => p.ownerId !== user.id))
    : localFiltered;
  const external = (externalQuery.data?.properties ?? []) as any[];

  // Map local to external-like shape to reuse card UI
  const localAsHotels = localOrdered.map((p) => ({
    __source: 'local',
    id: p._id,
    name: p.title,
    description: p.description,
    images: p.images?.length ? [{ thumbnail: p.images[0] }] : [],
    hotel_class: 'Local listing',
    rate_per_night: { lowest: `$${p.pricePerNight}` },
    total_rate: { lowest: `$${p.pricePerNight * 3}` },
    amenities: [],
    link: `/properties/${p._id}`,
  }));

  const hotels = [...localAsHotels, ...external];

  // Animate cards when data changes
  // Wrap in dynamic import so gsap only loads client-side to avoid SSR errors
  useEffect(() => {
    if (!listRef.current) return;
    let ctx: any;
    import('gsap').then(({ gsap }) => {
      ctx = (gsap as any).context(() => {
        (gsap as any).fromTo(
          '.hotel-card',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', overwrite: true }
        );
      }, listRef);
    });
    return () => ctx && ctx.revert && ctx.revert();
  }, [hotels.length]);

  return (
    <main className="w-full max-w-none px-6 py-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Search Hotels</h1>

      {hasError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Error: {errorMessage}</div>
      )}
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 rounded-xl border bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g., New York (optional)"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              min={formatDate(today)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              min={checkIn || formatDate(today)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Adults</label>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-blue-700"
        >
          Search Hotels
        </button>
      </form>

      {/* Results */}
      <h2 className="mb-4 text-xl font-semibold">
        {hotels.length} Hotels Found
      </h2>
      <div ref={listRef} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hotels.map((hotel: any, idx: number) => (
          <div key={hotel.property_token || idx} className="hotel-card rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
            {hotel.images && hotel.images[0] && (
              <img
                src={hotel.images[0].thumbnail}
                alt={hotel.name}
                className="mb-3 h-48 w-full rounded-lg object-cover"
              />
            )}
            <div className="mb-2 flex items-start justify-between">
              <h3 className="flex-1 text-lg font-semibold">{hotel.name}</h3>
              {hotel.overall_rating && (
                <div className="ml-2 flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-sm text-white">
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
            
            <div className="mb-2">
              <span className="text-sm text-gray-500">Per night: </span>
              <span className="font-semibold">
                {convertUsdPriceStringToINRDisplay(hotel.rate_per_night?.lowest)}
              </span>
            </div>
            
            {hotel.total_rate?.lowest && (
              <div className="mb-3">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="text-lg font-bold text-blue-600">
                  {convertUsdPriceStringToINRDisplay(hotel.total_rate.lowest)}
                </span>
              </div>
            )}
            
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.slice(0, 4).map((amenity: string, i: number) => (
                    <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      +{hotel.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => handleBookNow(hotel)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Book Now
              </button>
              {hotel.link && (
                <a
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Details
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="rounded border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No hotels found. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          onClose={handleCloseBooking}
        />
      )}
    </main>
  );
}
