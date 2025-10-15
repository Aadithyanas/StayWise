"use client";

import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { convertUsdPriceStringToINRDisplay, parsePriceStringToNumber, usdToInr, formatINR } from '../lib/currency';

interface BookingModalProps {
  hotel: any;
  onClose: () => void;
}

export function BookingModal({ hotel, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const isAuthenticated = !!user;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsSubmitting(true);

    try {
      // Compute total price from UI
      const totalPrice = calculateTotalPrice();

      // Create external booking in backend
      await api.createExternalBooking({
        provider: 'google',
        externalId: hotel.property_token || hotel.id || hotel.name,
        name: hotel.name,
        imageUrl: hotel.images?.[0]?.thumbnail,
        startDate: formData.checkIn,
        endDate: formData.checkOut,
        totalPrice,
      });

      await qc.invalidateQueries({ queryKey: ['my-external-bookings'] });
      await qc.invalidateQueries({ queryKey: ['my-bookings'] });

      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        router.push('/bookings');
      }, 1200);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateTotalNights();
    if (nights === 0 || !hotel.rate_per_night?.lowest) return 0;
    
    // Extract price from rate_per_night.lowest (assuming format like "$150" or "150")
    const priceStr = hotel.rate_per_night.lowest.toString();
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return price * nights;
  };

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">Booking Confirmed!</h3>
          <p className="text-gray-600">
            Your booking for <strong>{hotel.name}</strong> has been confirmed. 
            You will receive a confirmation email shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">Book Your Stay</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!isAuthenticated && (
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
              Please login to complete your booking.
              <button
                onClick={() => router.push('/login')}
                className="ml-3 inline-flex items-center rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
              >
                Login
              </button>
            </div>
          )}
          {/* Hotel Info */}
          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <div className="flex items-start gap-4">
              {hotel.images && hotel.images[0] && (
                <img
                  src={hotel.images[0].thumbnail}
                  alt={hotel.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                {hotel.hotel_class && (
                  <p className="text-sm text-gray-600">{hotel.hotel_class}</p>
                )}
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Per night: <span className="font-semibold text-blue-600">{convertUsdPriceStringToINRDisplay(hotel.rate_per_night?.lowest)}</span>
                  </span>
                  {hotel.overall_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">{hotel.overall_rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Check-in Date *</label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Check-out Date *</label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  required
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Adults *</label>
                <select
                  name="adults"
                  value={formData.adults}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Children</label>
                <select
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special requests or notes..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Price Summary */}
            {formData.checkIn && formData.checkOut && (
              <div className="rounded-lg border bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span>{calculateTotalNights()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate per night:</span>
                    <span>{convertUsdPriceStringToINRDisplay(hotel.rate_per_night?.lowest)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {formatINR(usdToInr(calculateTotalPrice()))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.checkIn || !formData.checkOut}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Login to Book
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
