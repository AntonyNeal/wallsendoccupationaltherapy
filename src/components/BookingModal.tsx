import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { BookingModalProps } from '../types/booking.types';

interface BookingModalState {
  currentStep: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  duration: number;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string | null;
  isProcessing: boolean;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [state, setState] = useState<BookingModalState>({
    currentStep: 1,
    selectedDate: null,
    selectedTime: null,
    duration: 1,
    clientInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    paymentMethod: null,
    isProcessing: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 id="modal-title" className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Book Assessment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-50 rounded-full"
            aria-label="Close booking modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    state.currentStep === step
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                      : state.currentStep > step
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {state.currentStep > step ? '✓' : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 sm:w-16 h-0.5 transition-all duration-300 ${
                      state.currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {state.currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Date</h3>
                <p className="text-gray-600 mb-6">Choose your preferred assessment date and time</p>
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 rounded-xl p-8 text-center">
                  <div className="text-teal-600 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Calendar Coming Soon</p>
                  <p className="text-sm text-gray-500">Online booking will be available shortly</p>
                </div>
              </div>
            )}

            {state.currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Service</h3>
                <p className="text-gray-600 mb-6">Choose the type of assessment you need</p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-8 text-center">
                  <div className="text-blue-600 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Service Selection</p>
                  <p className="text-sm text-gray-500">Comprehensive assessment options</p>
                </div>
              </div>
            )}

            {state.currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Details</h3>
                <p className="text-gray-600 mb-6">Provide your contact information</p>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-8 text-center">
                  <div className="text-purple-600 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Contact Form</p>
                  <p className="text-sm text-gray-500">Secure information collection</p>
                </div>
              </div>
            )}

            {state.currentStep === 4 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmation</h3>
                <p className="text-gray-600 mb-6">Review and confirm your booking</p>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 rounded-xl p-8 text-center">
                  <div className="text-green-600 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Almost There</p>
                  <p className="text-sm text-gray-500">Confirm your appointment details</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  currentStep: Math.max(1, prev.currentStep - 1),
                }))
              }
              disabled={state.currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (state.currentStep === 4) {
                  setState((prev) => ({ ...prev, isProcessing: true }));
                  setTimeout(() => {
                    onClose();
                  }, 1000);
                } else {
                  setState((prev) => ({
                    ...prev,
                    currentStep: Math.min(4, prev.currentStep + 1),
                  }));
                }
              }}
              disabled={state.isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-teal-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              {state.currentStep === 4
                ? state.isProcessing
                  ? 'Processing...'
                  : 'Complete Booking'
                : 'Next'}
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Need help? Call us at{' '}
              <a href="tel:0249615555" className="text-teal-600 hover:text-teal-700 font-medium">
                (02) 4961 5555
              </a>
            </p>
            <p className="text-xs text-gray-400">Monday - Friday, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
