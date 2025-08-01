'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { cancelBooking } from '@/lib/utils'
import { LineLogin } from './line-login'
import { BookingCalendar } from './booking-calendar'
import { BookingConfirmationModal } from './booking-confirmation-modal'
import { PaymentQR } from './payment-qr'
import { ArrowRight, CheckCircle, Calendar, CreditCard, User, ArrowLeft, XCircle } from 'lucide-react'

type BookingStep = 'login' | 'calendar' | 'payment' | 'success'

export function BookingFlow() {
  const { isAuthenticated, booking, payment, lineUser, resetPayment, confirmBooking, resetBooking, bookedDates, setBookingId, setCreatedAt, setBookedDates } = useAppStore()
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const dateFormat = (date: Date) => {
    return format(date, 'yyyy-MM-dd')
  }

  const getCurrentStep = (): BookingStep => {
    if (!isAuthenticated) return 'login'
    if (!booking.selectedDate) return 'calendar'
    if (!booking.isConfirmed) return 'calendar'
    if (payment.status === 'success') return 'success'
    return 'payment'
  }

  const currentStep = getCurrentStep()
  const handleContinueBooking = () => {
    setShowConfirmationModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!booking.selectedDate || !lineUser) return

    try {
      // Create booking using API
      const bookingData = {
        user_id: lineUser.userId,
        display_name: lineUser.displayName,
        selected_date: dateFormat(booking.selectedDate),
        amount: 200,
        status: 'pending'
      }

      const response = await apiService.createBooking(bookingData)
      
      // Confirm booking in store and save booking ID and created_at
      confirmBooking()
      setBookingId(response.booking_id)
      setCreatedAt(response.created_at)
      setShowConfirmationModal(false)
      setErrorMessage(null)
    } catch (error: any) {
      console.error(error)
      // Check if it's a duplicate booking error
      if (error?.status === 409 || error?.message?.includes('duplicate key value')) {
        setErrorMessage('วันที่นี้มีคนจองไปแล้ว กรุณาเลือกวันที่อื่น')
      } else {
        setErrorMessage('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง')
      }
    }
  }

    const handleCancelBooking = () => {
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (currentStep === 'payment') {
      await cancelBooking(
        booking.bookingId,
        apiService,
        resetBooking,
        resetPayment,
        setBookingId,
        setCreatedAt
      )
    }
    setShowCancelModal(false)
  }

  const canCancel = currentStep === 'payment'

  const handleNewBooking = () => {
    // Reset all booking and payment data
    resetBooking()
    resetPayment()
    setBookingId(null)
    setCreatedAt(null)
  }

  const getStepIcon = (step: BookingStep) => {
    switch (step) {
      case 'login':
        return <User className="h-5 w-5" />
      case 'calendar':
        return <Calendar className="h-5 w-5" />
      case 'payment':
        return <CreditCard className="h-5 w-5" />
      case 'success':
        return <CheckCircle className="h-5 w-5" />
    }
  }

  const getStepTitle = (step: BookingStep) => {
    switch (step) {
      case 'login':
        return 'เข้าสู่ระบบ'
      case 'calendar':
        return 'เลือกวันที่'
      case 'payment':
        return 'ชำระเงิน'
      case 'success':
        return 'จองสำเร็จ'
    }
  }

  const getStepDescription = (step: BookingStep) => {
    switch (step) {
      case 'login':
        return 'เข้าสู่ระบบด้วย LINE เพื่อเริ่มการจอง'
      case 'calendar':
        return 'เลือกวันที่ที่ต้องการใช้บริการ'
      case 'payment':
        return 'ชำระเงินผ่าน QR Code'
      case 'success':
        return 'การจองของคุณสำเร็จแล้ว'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Cancel Button */}
        <div className="relative mb-4 sm:mb-8">
          {/* Cancel Button */}
          {canCancel && (
            <div className="absolute left-0 top-0">
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                className="h-10 text-sm text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                ยกเลิกการจอง
              </Button>
            </div>
          )}
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              จองบริการตัดต่อวิดีโอ
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              เลือกวันที่และชำระเงินเพื่อจองบริการของเรา
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {(['login', 'calendar', 'payment', 'success'] as BookingStep[]).map((step, index) => {
              const isActive = step === currentStep
              const isCompleted = 
                (step === 'login' && isAuthenticated) ||
                (step === 'calendar' && booking.selectedDate) ||
                (step === 'payment' && payment.status === 'success') ||
                (step === 'success' && payment.status === 'success')

              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-4">
            <div className="text-center px-2">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {getStepTitle(currentStep)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {getStepDescription(currentStep)}
              </p>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {currentStep === 'login' && <LineLogin />}
          
          {currentStep === 'calendar' && (
            <div className="space-y-4 sm:space-y-6">
              <BookingCalendar />
              {booking.selectedDate && !booking.isConfirmed && (
                <div className="flex justify-center px-2">
                  <Button 
                    onClick={handleContinueBooking}
                    className="w-full sm:w-auto px-6 sm:px-8 h-12 sm:h-10 text-base"
                  >
                    ดำเนินการต่อ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'payment' && <PaymentQR />}
          
          {currentStep === 'success' && (
            <Card className="w-full max-w-xs sm:max-w-md mx-auto">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="flex items-center justify-center gap-2 text-green-600 text-lg sm:text-xl">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  การจองสำเร็จ!
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  ขอบคุณที่ใช้บริการของเรา
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-green-800 mb-2 text-base sm:text-lg">
                    การจองได้รับการยืนยันแล้ว
                  </h3>
                  <p className="text-xs sm:text-sm text-green-700">
                    เราจะติดต่อคุณผ่าน LINE เพื่อยืนยันรายละเอียดเพิ่มเติม
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">ขั้นตอนต่อไป:</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• รับข้อความยืนยันผ่าน LINE</li>
                    <li>• เตรียมไฟล์วิดีโอสำหรับการตัดต่อ</li>
                    <li>• รอการติดต่อจากทีมงาน</li>
                  </ul>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={handleNewBooking}
                    variant="outline"
                    className="w-full sm:w-auto px-6 sm:px-8 h-12 sm:h-10 text-base"
                  >
                    จองต่อ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Confirmation Modal */}
        <BookingConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmBooking}
          errorMessage={errorMessage}
        />

        {/* Cancel Confirmation Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-red-600">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ยกเลิกการจอง
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs sm:text-sm text-red-800">
                  <strong>หมายเหตุ:</strong> การยกเลิกการจองจะลบข้อมูลการจองทั้งหมดและคุณจะต้องจองใหม่
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelModal(false)} 
                  className="flex-1 h-12 sm:h-10 text-base"
                >
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleConfirmCancel} 
                  className="flex-1 h-12 sm:h-10 text-base bg-red-600 hover:bg-red-700"
                >
                  ยืนยันการยกเลิก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 