import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function cancelBooking(
  bookingId: string | null,
  apiService: any,
  resetBooking: () => void,
  resetPayment: () => void,
  setBookingId: (id: string | null) => void,
  setCreatedAt: (date: string | null) => void
) {
  if (!bookingId) return

  try {
    // Delete booking from backend
    await apiService.deleteBooking(bookingId)
    console.log('Booking cancelled successfully')
  } catch (error) {
    console.error('Failed to cancel booking:', error)
  } finally {
    // Reset everything regardless of API success
    resetBooking()
    resetPayment()
    setBookingId(null)
    setCreatedAt(null)
  }
}
