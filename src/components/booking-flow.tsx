'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { LineLogin } from './line-login'
import { BookingCalendar } from './booking-calendar'
import { BookingConfirmationModal } from './booking-confirmation-modal'
import { PaymentQR } from './payment-qr'
import { BookedDatesDisplay } from './booked-dates-display'
import { ArrowRight, CheckCircle, Calendar, CreditCard, User } from 'lucide-react'

type BookingStep = 'login' | 'calendar' | 'payment' | 'success'

export function BookingFlow() {
  const { isAuthenticated, booking, payment } = useAppStore()
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const getCurrentStep = (): BookingStep => {
    if (!isAuthenticated) return 'login'
    if (!booking.selectedDate) return 'calendar'
    if (payment.status === 'success') return 'success'
    return 'payment'
  }

  const currentStep = getCurrentStep()

  const handleContinueBooking = () => {
    setShowConfirmationModal(true)
  }

  const handleConfirmBooking = () => {
    setShowConfirmationModal(false)
    // Payment step will be shown automatically
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
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            จองบริการตัดต่อวิดีโอ
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            เลือกวันที่และชำระเงินเพื่อจองบริการของเรา
          </p>
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
              <BookedDatesDisplay />
              {booking.selectedDate && (
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Confirmation Modal */}
        <BookingConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </div>
  )
} 