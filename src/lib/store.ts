import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
}

export interface BookingData {
  selectedDate: Date | null
  isConfirmed: boolean
  bookingId: string | null
  createdAt: string | null
}

export interface PaymentData {
  qrCodeUrl: string | null
  paymentId: string | null
  status: 'pending' | 'success' | 'failed' | null
}

interface AppState {
  // LINE Authentication
  lineUser: LineUser | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Booking
  booking: BookingData
  
  // Payment
  payment: PaymentData
  
  // Booked dates
  bookedDates: string[]
  
  // Actions
  setLineUser: (user: LineUser | null) => void
  setAuthenticated: (status: boolean) => void
  setLoading: (loading: boolean) => void
  setSelectedDate: (date: Date | null) => void
  confirmBooking: () => void
  setBookingId: (bookingId: string | null) => void
  setCreatedAt: (createdAt: string | null) => void
  setPaymentData: (data: Partial<PaymentData>) => void
  resetPayment: () => void
  resetBooking: () => void
  setBookedDates: (dates: string[]) => void
  addBookedDate: (date: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      lineUser: null,
      isAuthenticated: false,
      isLoading: false,
      
      booking: {
        selectedDate: null,
        isConfirmed: false,
        bookingId: null,
        createdAt: null,
      },
      
      payment: {
        qrCodeUrl: null,
        paymentId: null,
        status: null,
      },
      
      bookedDates: [],
      
      // Actions
      setLineUser: (user) => set({ lineUser: user }),
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      setSelectedDate: (date) => 
        set((state) => ({
          booking: { ...state.booking, selectedDate: date }
        })),
      
      confirmBooking: () => 
        set((state) => ({
          booking: { ...state.booking, isConfirmed: true }
        })),
      
      setBookingId: (bookingId) => 
        set((state) => ({
          booking: { ...state.booking, bookingId }
        })),
      
      setCreatedAt: (createdAt) => 
        set((state) => ({
          booking: { ...state.booking, createdAt }
        })),
      
      setPaymentData: (data) => 
        set((state) => ({
          payment: { ...state.payment, ...data }
        })),
      
      resetPayment: () => 
        set({
          payment: {
            qrCodeUrl: null,
            paymentId: null,
            status: null,
          }
        }),
      
      resetBooking: () => 
        set({
          booking: {
            selectedDate: null,
            isConfirmed: false,
            bookingId: null,
            createdAt: null,
          }
        }),
      
      setBookedDates: (dates) => set({ bookedDates: dates }),
      
      addBookedDate: (date) => 
        set((state) => ({
          bookedDates: [...state.bookedDates, date]
        })),
    }),
    {
      name: 'clip-booking-storage',
      partialize: (state) => ({
        lineUser: state.lineUser,
        isAuthenticated: state.isAuthenticated,
        booking: state.booking,
        payment: state.payment,
      }),
    }
  )
) 