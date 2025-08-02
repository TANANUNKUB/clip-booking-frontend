const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export interface GeneratePaymentRequest {
  user_id: string
  display_name: string
  selected_date: string
  amount: number
  qr_code_url: string
}

export interface GeneratePaymentResponse {
  payment_id: string
  user_id: string
  display_name: string
  selected_date: string
  amount: number
  status: string
  created_at: string
  qr_code_url: string
}

export interface PaymentStatusResponse {
  payment_id: string
  status: 'pending' | 'success' | 'failed'
  amount: number
  paidAt?: string
}

export interface BookingResponse {
  booking_id: string
  user_id: string
  display_name: string
  selected_date: string
  amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
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
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(`API request failed: ${response.statusText}`) as any
      error.status = response.status
      error.code = errorData.code
      error.message = errorData.message || response.statusText
      throw error
    }

    return response.json()
  }

  async generatePayment(data: GeneratePaymentRequest): Promise<GeneratePaymentResponse> {
    return this.request<GeneratePaymentResponse>('/generate-payment', {
      method: 'POST',
      body: JSON.stringify({
        user_id: data.user_id,
        display_name: data.display_name,
        selected_date: data.selected_date,
        amount: data.amount,
        qr_code_url: data.qr_code_url
      }),
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

  async verifySlip(formData: FormData): Promise<{
    success: boolean
    message: string
    status_code: number
    errors?: string[]
    easyslip_data?: any
  }> {
    const url = `${API_BASE_URL}/verify-slip-with-validation`
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(`API request failed: ${response.statusText}`) as any
      error.status = response.status
      error.code = errorData.code
      error.message = errorData.message || response.statusText
      throw error
    }

    return response.json()
  }

  async getBookings(): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>('/bookings')
  }

  async getUserBookings(userId: string): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>(`/bookings/user/${userId}`)
  }

  async getBookedDates(): Promise<string[]> {
    const bookings = await this.getBookings()
    console.log("bookings", bookings)
    return bookings.map(booking => booking.selected_date)
  }

  async createBooking(bookingData: {
    user_id: string
    display_name: string
    selected_date: string
    amount: number
    status: string
  }): Promise<BookingResponse> {
    return this.request<BookingResponse>('/create-booking', {
      method: 'POST',
      body: JSON.stringify({
        user_id: bookingData.user_id,
        display_name: bookingData.display_name,
        selected_date: bookingData.selected_date.split('T')[0],
        amount: bookingData.amount,
        status: bookingData.status,
      }),
    })
  }

  async deleteBooking(bookingId: string): Promise<{
    success: boolean
    message: string
    booking_id: string
  }> {
    return this.request<{
      success: boolean
      message: string
      booking_id: string
    }>(`/bookings/${bookingId}`, {
      method: 'DELETE',
    })
  }

  async updateBooking(
    bookingId: string,
    updateData: {
      user_id?: string
      display_name?: string
      selected_date?: string
      amount?: number
      status?: string
      payment_id?: string
    }
  ): Promise<{
    success: boolean
    message: string
    booking_id: string
    updated_data: any
  }> {
    const formData = new FormData()
    
    // Add only provided fields to form data
    if (updateData.user_id) formData.append('user_id', updateData.user_id)
    if (updateData.display_name) formData.append('display_name', updateData.display_name)
    if (updateData.selected_date) formData.append('selected_date', updateData.selected_date)
    if (updateData.amount) formData.append('amount', updateData.amount.toString())
    if (updateData.status) formData.append('status', updateData.status)
    if (updateData.payment_id) formData.append('payment_id', updateData.payment_id)

    const url = `${API_BASE_URL}/bookings/${bookingId}`
    
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(`API request failed: ${response.statusText}`) as any
      error.status = response.status
      error.code = errorData.code
      error.message = errorData.message || response.statusText
      throw error
    }

    return response.json()
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