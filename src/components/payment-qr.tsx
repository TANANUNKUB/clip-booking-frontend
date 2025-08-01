'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { apiService, paymentPoller } from '@/lib/api'
import { cancelBooking } from '@/lib/utils'
import { QrCode, CheckCircle, XCircle, Clock, Loader2, RefreshCw, Upload, FileText, ArrowLeft } from 'lucide-react'
import generatePayload from 'promptpay-qr'
import { QRCodeCanvas } from "qrcode.react"
import { SlipVerificationModal } from './slip-verification-modal'

export function PaymentQR() {
  const { 
    payment, 
    booking, 
    lineUser, 
    setPaymentData, 
    setLoading, 
    isLoading,
    addBookedDate,
    resetPayment,
    resetBooking,
    setBookingId,
    setCreatedAt
  } = useAppStore()
  
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [showSlipUpload, setShowSlipUpload] = useState(false)
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'failed'>('checking')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Generate QR code automatically when component mounts
    if (!qrCodeUrl) {
      generatePayment()
    }
    
    // Set payment deadline based on booking.created_at + 10 minutes
    if (booking.createdAt) {
      const createdDate = new Date(booking.createdAt)
      const deadline = new Date(createdDate.getTime() + 10 * 60 * 1000) // +10 minutes
      setPaymentDeadline(deadline)
    } else {
      // Fallback to current time + 10 minutes if no created_at
      const deadline = new Date()
      deadline.setMinutes(deadline.getMinutes() + 10)
      setPaymentDeadline(deadline)
    }
  }, [booking.createdAt])

  // Timer effect to update countdown
  useEffect(() => {
    if (!paymentDeadline) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = paymentDeadline.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeRemaining('หมดเวลาแล้ว')
        setIsExpired(true)
        // Auto cancel booking when timeout
        handleAutoCancel()
        return
      }
      
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    // Update immediately
    updateCountdown()

    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [paymentDeadline])

  const handleAutoCancel = async () => {
    await cancelBooking(
      booking.bookingId,
      apiService,
      resetBooking,
      resetPayment,
      setBookingId,
      setCreatedAt
    )
    console.log('Auto cancelled booking due to timeout')
  }

  const generatePayment = async () => {
    if (!lineUser || !booking.selectedDate) return

    try {
      setLoading(true)
      setError(null)

      // Generate QR code using promptpay-qr
      const qrCode = generatePayload('1319900762822', { amount: 200 })
      setQrCodeUrl(qrCode)

      // Set payment data locally without API call
      setPaymentData({
        paymentId: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        qrCodeUrl: qrCode,
        status: 'pending',
      })

    } catch (error) {
      console.error('Failed to generate payment:', error)
      setError('ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      if (payment.paymentId) {
        await apiService.confirmBooking(payment.paymentId)
      }
      
      // Update booking with payment information
      if (booking.bookingId && payment.paymentId) {
        await apiService.updateBooking(booking.bookingId, {
          status: 'confirmed',
          payment_id: payment.paymentId
        })
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }
      
      setSlipFile(file)
      setError(null)
    }
  }

  const handleSlipUpload = async () => {
    if (!slipFile) {
      setError('กรุณาเลือกไฟล์สลิปก่อน')
      return
    }

    if (!lineUser || !booking.selectedDate) {
      setError('ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง')
      return
    }

    // Show verification modal with checking status
    setShowVerificationModal(true)
    setVerificationStatus('checking')
    setVerificationMessage('กำลังตรวจสอบสลิปการโอนเงิน...')

    try {
      // Prepare form data for API
      const formData = new FormData()
      formData.append('payment_id', payment.paymentId || '')
      formData.append('user_id', lineUser.userId)
      formData.append('display_name', lineUser.displayName)
      formData.append('selected_date', format(booking.selectedDate, 'yyyy-MM-dd'))
      formData.append('amount', '200')
      formData.append('slip_image', slipFile)

      // Call real API to verify slip
      const result = await apiService.verifySlip(formData)
      
      if (result.success) {
        // Update booking with payment information
        if (booking.bookingId && payment.paymentId) {
          try {
            await apiService.updateBooking(booking.bookingId, {
              status: 'confirmed',
              payment_id: payment.paymentId
            })
          } catch (error) {
            console.error('Failed to update booking:', error)
          }
        }
        
        // Add the booked date to the store
        if (booking.selectedDate) {
          const dateString = format(booking.selectedDate, 'yyyy-MM-dd')
          addBookedDate(dateString)
        }

        // Set payment status to success to go to final page
        setPaymentData({ status: 'success' })
      } else {
        setVerificationStatus('failed')
        if (result.errors && result.errors.length > 0) {
          setVerificationMessage(`การตรวจสอบล้มเหลว: ${result.errors.join(', ')}`)
        } else {
          setVerificationMessage(result.message || 'สลิปไม่ถูกต้อง กรุณาตรวจสอบและอัปโหลดใหม่')
        }
      }

    } catch (error: any) {
      console.error('Failed to verify slip:', error)
      setVerificationStatus('failed')
      
      if (error.status === 400) {
        setVerificationMessage('ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      } else if (error.status >= 500) {
        setVerificationMessage('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง')
      } else {
        setVerificationMessage('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง')
      }
    }
  }

  const handleVerificationConfirm = () => {
    setShowVerificationModal(false)
    setPaymentData({ status: 'success' })
  }

  const handleVerificationClose = () => {
    setShowVerificationModal(false)
    setSlipFile(null)
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  const formatDeadline = (date: Date) => {
    return format(date, 'HH:mm น.', { locale: th })
  }

  const getTimeRemaining = () => {
    return timeRemaining
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
      <>
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

        <SlipVerificationModal
          isOpen={showVerificationModal}
          onClose={handleVerificationClose}
          status={verificationStatus}
          message={verificationMessage}
          onConfirm={handleVerificationConfirm}
        />
      </>
    )
  }

  return (
    <>
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
            ชำระเงิน
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            สแกน QR Code หรืออัปโหลดสลิปเพื่อชำระเงิน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Payment Method Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!showSlipUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSlipUpload(false)}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button
              variant={showSlipUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSlipUpload(true)}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              อัปโหลดสลิป
            </Button>
          </div>

          {!showSlipUpload ? (
            // QR Code Section
            qrCodeUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <QRCodeCanvas 
                    value={qrCodeUrl}
                    size={160}
                    className="w-40 h-40 sm:w-48 sm:h-48 border rounded-lg"
                    level="M"
                    includeMargin={true}
                  />
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="text-xs sm:text-sm font-medium">{getStatusText()}</span>
                  </div>
                </div>

                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  <p>ค่าบริการ: ฿200</p>
                  <p>ชื่อบัญชี: น.ส.พรปวีณ์ สุวรรรศรี</p>
                  <p>วันที่จอง: {booking.selectedDate && formatSelectedDate(booking.selectedDate)}</p>
                  {paymentDeadline && (
                    <div className={`mt-2 p-2 border rounded-lg ${
                      isExpired 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`font-medium ${
                        isExpired ? 'text-red-800' : 'text-orange-800'
                      }`}>
                        ⏰ {isExpired ? 'หมดเวลาแล้ว' : `หมดเวลาใน: ${getTimeRemaining()}`}
                      </p>
                      {!isExpired && (
                        <>
                          <p className="text-orange-700 text-xs">กรุณาโอนก่อน {formatDeadline(paymentDeadline)}</p>
                          <p className="text-orange-700 text-xs font-medium mt-1">⚠️ หากหมดเวลา การจองจะถูกยกเลิกอัตโนมัติ</p>
                        </>
                      )}
                      {isExpired && (
                        <p className="text-red-700 text-xs">การจองถูกยกเลิกอัตโนมัติแล้ว</p>
                      )}
                    </div>
                  )}
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
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3 animate-spin" />
                  <p className="text-xs sm:text-sm text-gray-600">กำลังสร้าง QR Code...</p>
                </div>
              </div>
            )
          ) : (
            // Slip Upload Section
            <div className="space-y-4">
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                <p>ค่าบริการ: ฿200</p>
                <p>ชื่อบัญชี: น.ส. พรปวีณ์ สุวรรรศรี</p>
                <p>วันที่จอง: {booking.selectedDate && formatSelectedDate(booking.selectedDate)}</p>
                {paymentDeadline && (
                  <div className={`mt-2 p-2 border rounded-lg ${
                    isExpired 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <p className={`font-medium ${
                      isExpired ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      ⏰ {isExpired ? 'หมดเวลาแล้ว' : `หมดเวลาใน: ${getTimeRemaining()}`}
                    </p>
                    {!isExpired && (
                      <>
                        <p className="text-orange-700 text-xs">กรุณาโอนก่อน {formatDeadline(paymentDeadline)}</p>
                        <p className="text-orange-700 text-xs font-medium mt-1">⚠️ หากหมดเวลา การจองจะถูกยกเลิกอัตโนมัติ</p>
                      </>
                    )}
                    {isExpired && (
                      <p className="text-red-700 text-xs">การจองถูกยกเลิกอัตโนมัติแล้ว</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="slip-upload" className="text-sm font-medium">
                  อัปโหลดสลิปการโอนเงิน
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    id="slip-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slip-upload" className="cursor-pointer">
                    {slipFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-green-600 mx-auto" />
                        <p className="text-sm text-green-600 font-medium">{slipFile.name}</p>
                        <p className="text-xs text-gray-500">คลิกเพื่อเปลี่ยนไฟล์</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์สลิป</p>
                        <p className="text-xs text-gray-500">รองรับไฟล์รูปภาพ ขนาดไม่เกิน 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleSlipUpload} 
                disabled={!slipFile || isUploading}
                className="w-full h-12 sm:h-10 text-base"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                ยืนยันการชำระเงิน
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slip Verification Modal */}
      <SlipVerificationModal
        isOpen={showVerificationModal}
        onClose={handleVerificationClose}
        status={verificationStatus}
        message={verificationMessage}
        onConfirm={handleVerificationConfirm}
      />
    </>
  )
} 