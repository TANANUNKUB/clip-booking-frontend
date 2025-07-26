'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { apiService, paymentPoller } from '@/lib/api'
import { QrCode, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react'

export function PaymentQR() {
  const { 
    payment, 
    booking, 
    lineUser, 
    setPaymentData, 
    setLoading, 
    isLoading,
    addBookedDate
  } = useAppStore()
  
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (payment.paymentId && payment.status === 'pending') {
      startPaymentPolling()
    }

    return () => {
      paymentPoller.stopPolling()
    }
  }, [payment.paymentId])

  const generatePayment = async () => {
    if (!lineUser || !booking.selectedDate) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiService.generatePayment({
        userId: lineUser.userId,
        displayName: lineUser.displayName,
        selectedDate: booking.selectedDate.toISOString(),
        amount: 1500,
      })

      setPaymentData({
        paymentId: response.paymentId,
        qrCodeUrl: response.qrCodeUrl,
        status: 'pending',
      })

      startPaymentPolling()
    } catch (error) {
      console.error('Failed to generate payment:', error)
      setError('ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const startPaymentPolling = () => {
    if (!payment.paymentId) return

    setIsPolling(true)
    paymentPoller.startPolling(
      payment.paymentId,
      (status) => {
        setPaymentData({ status: status.status })
        if (status.status === 'success') {
          handlePaymentSuccess()
        }
      },
      () => {
        handlePaymentSuccess()
      },
      (error) => {
        console.error('Payment polling error:', error)
        setError('เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน')
      }
    )
  }

  const handlePaymentSuccess = async () => {
    try {
      if (payment.paymentId) {
        await apiService.confirmBooking(payment.paymentId)
      }
      
      // Add the booked date to the store
      if (booking.selectedDate) {
        const dateString = format(booking.selectedDate, 'yyyy-MM-dd')
        addBookedDate(dateString)
      }
      
      setPaymentData({ status: 'success' })
    } catch (error) {
      console.error('Failed to confirm booking:', error)
    } finally {
      setIsPolling(false)
    }
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  const getStatusIcon = () => {
    switch (payment.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (payment.status) {
      case 'success':
        return 'ชำระเงินสำเร็จ'
      case 'failed':
        return 'ชำระเงินล้มเหลว'
      case 'pending':
        return 'รอชำระเงิน'
      default:
        return 'รอการชำระเงิน'
    }
  }

  const getStatusColor = () => {
    switch (payment.status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (payment.status === 'success') {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-green-600 text-base sm:text-lg">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            การจองสำเร็จ!
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            ขอบคุณที่ใช้บริการของเรา
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">การจองได้รับการยืนยันแล้ว</h3>
            <p className="text-xs sm:text-sm text-green-700">
              วันที่: {booking.selectedDate && formatSelectedDate(booking.selectedDate)}
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-800">
              เราจะติดต่อคุณผ่าน LINE เพื่อยืนยันรายละเอียดเพิ่มเติม
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-xs sm:max-w-md mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
          ชำระเงิน
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          สแกน QR Code เพื่อชำระเงินค่าบริการ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs sm:text-sm text-red-800">{error}</p>
          </div>
        )}

        {payment.qrCodeUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <img 
                src={payment.qrCodeUrl} 
                alt="QR Code for payment"
                className="w-40 h-40 sm:w-48 sm:h-48 border rounded-lg"
              />
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-xs sm:text-sm font-medium">{getStatusText()}</span>
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              <p>ค่าบริการ: ฿1,500</p>
              <p>วันที่จอง: {booking.selectedDate && formatSelectedDate(booking.selectedDate)}</p>
            </div>

            {isPolling && (
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                กำลังตรวจสอบสถานะการชำระเงิน...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-gray-600">ยังไม่มี QR Code</p>
            </div>
            
            <Button 
              onClick={generatePayment} 
              disabled={isLoading}
              className="w-full h-12 sm:h-10 text-base"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              สร้าง QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 