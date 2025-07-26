const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock data storage
const payments = new Map()
const bookings = new Map()

// Add some sample bookings for testing
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const dayAfterTomorrow = new Date(today)
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

const sampleBookings = [
  {
    bookingId: 'booking_sample_1',
    paymentId: 'payment_sample_1',
    userId: 'user_1',
    displayName: 'John Doe',
    selectedDate: tomorrow.toISOString(),
    amount: 1500,
    status: 'confirmed',
    confirmedAt: new Date().toISOString()
  },
  {
    bookingId: 'booking_sample_2',
    paymentId: 'payment_sample_2',
    userId: 'user_2',
    displayName: 'Jane Smith',
    selectedDate: dayAfterTomorrow.toISOString(),
    amount: 1500,
    status: 'confirmed',
    confirmedAt: new Date().toISOString()
  }
]

// Initialize sample bookings
sampleBookings.forEach(booking => {
  bookings.set(booking.bookingId, booking)
})

// Generate mock QR code URL
function generateMockQRCode(paymentId) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment_${paymentId}`
}

// POST /generate-payment
app.post('/generate-payment', (req, res) => {
  try {
    const { userId, displayName, selectedDate, amount } = req.body
    
    if (!userId || !displayName || !selectedDate || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const qrCodeUrl = generateMockQRCode(paymentId)

    // Store payment data
    payments.set(paymentId, {
      paymentId,
      userId,
      displayName,
      selectedDate,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      qrCodeUrl
    })

    console.log(`Generated payment: ${paymentId} for user: ${displayName}`)

    res.json({
      paymentId,
      qrCodeUrl,
      amount
    })
  } catch (error) {
    console.error('Error generating payment:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /payment-status/{paymentId}
app.get('/payment-status/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params
    const payment = payments.get(paymentId)

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Simulate payment status changes (for demo purposes)
    // In real implementation, this would check actual payment gateway
    const timeSinceCreation = Date.now() - new Date(payment.createdAt).getTime()
    const minutesSinceCreation = timeSinceCreation / (1000 * 60)

    // Simulate payment success after 2 minutes
    if (minutesSinceCreation > 2 && payment.status === 'pending') {
      payment.status = 'success'
      payment.paidAt = new Date().toISOString()
      console.log(`Payment ${paymentId} marked as successful`)
    }

    res.json({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt
    })
  } catch (error) {
    console.error('Error getting payment status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /confirm-booking
app.post('/confirm-booking', (req, res) => {
  try {
    const { paymentId } = req.body
    
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' })
    }

    const payment = payments.get(paymentId)
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    // Create booking record
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    bookings.set(bookingId, {
      bookingId,
      paymentId,
      userId: payment.userId,
      displayName: payment.displayName,
      selectedDate: payment.selectedDate,
      amount: payment.amount,
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    })

    console.log(`Booking confirmed: ${bookingId} for payment: ${paymentId}`)

    res.json({ success: true, bookingId })
  } catch (error) {
    console.error('Error confirming booking:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /bookings (for debugging)
app.get('/bookings', (req, res) => {
  const bookingsArray = Array.from(bookings.values())
  res.json(bookingsArray)
})

// GET /payments (for debugging)
app.get('/payments', (req, res) => {
  res.json(Array.from(payments.values()))
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('  POST /generate-payment')
  console.log('  GET  /payment-status/:paymentId')
  console.log('  POST /confirm-booking')
  console.log('  GET  /health')
  console.log('  GET  /bookings (debug)')
  console.log('  GET  /payments (debug)')
}) 