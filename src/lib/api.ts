import { PaymentData } from './store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export interface GeneratePaymentRequest {
  userId: string
  displayName: string
  selectedDate: string
  amount: number
}

export interface GeneratePaymentResponse {
  paymentId: string
  qrCodeUrl: string
  amount: number
}

export interface PaymentStatusResponse {
  paymentId: string
  status: 'pending' | 'success' | 'failed'
  amount: number
  paidAt?: string
}

export interface BookingResponse {
  bookingId: string
  userId: string
  displayName: string
  selectedDate: string
  amount: number
  status: 'confirmed' | 'cancelled'
  confirmedAt: string
}

export class ApiService {
  private static instance: ApiService

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async generatePayment(data: GeneratePaymentRequest): Promise<GeneratePaymentResponse> {
    return this.request<GeneratePaymentResponse>('/generate-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/payment-status/${paymentId}`)
  }

  async confirmBooking(paymentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/confirm-booking', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    })
  }

  async getBookings(): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>('/bookings')
  }

  async getBookedDates(): Promise<string[]> {
    const bookings = await this.getBookings()
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .map(booking => booking.selectedDate.split('T')[0]) // Get only date part
  }
}

export const apiService = ApiService.getInstance()

// Payment polling utility
export class PaymentPoller {
  private intervalId: NodeJS.Timeout | null = null
  private isPolling = false

  startPolling(
    paymentId: string,
    onStatusUpdate: (status: PaymentStatusResponse) => void,
    onSuccess: () => void,
    onError: (error: Error) => void,
    intervalMs: number = 5000
  ) {
    if (this.isPolling) return

    this.isPolling = true
    this.intervalId = setInterval(async () => {
      try {
        const status = await apiService.getPaymentStatus(paymentId)
        onStatusUpdate(status)

        if (status.status === 'success') {
          this.stopPolling()
          onSuccess()
        } else if (status.status === 'failed') {
          this.stopPolling()
          onError(new Error('Payment failed'))
        }
      } catch (error) {
        console.error('Payment polling error:', error)
        onError(error as Error)
      }
    }, intervalMs)
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isPolling = false
  }

  isActive(): boolean {
    return this.isPolling
  }
}

export const paymentPoller = new PaymentPoller() 