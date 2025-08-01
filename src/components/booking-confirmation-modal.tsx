'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { CalendarIcon, User, CreditCard, AlertCircle } from 'lucide-react'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  errorMessage?: string | null
}

export function BookingConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  errorMessage 
}: BookingConfirmationModalProps) {
  const { booking, lineUser } = useAppStore()

  if (!booking.selectedDate || !lineUser) {
    return null
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
        {errorMessage ? (
          // Error State
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-800">เกิดข้อผิดพลาด</h3>
              <p className="text-red-700">{errorMessage}</p>
            </div>
            
            <Button 
              onClick={() => {
                window.location.reload()
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              ลองใหม่
            </Button>
          </div>
        ) : (
          // Normal Booking Confirmation State
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ยืนยันการจอง
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                กรุณาตรวจสอบรายละเอียดการจองก่อนดำเนินการต่อ
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">ผู้จอง</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{lineUser.displayName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">วันที่จอง</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatSelectedDate(booking.selectedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">ค่ามัดจำ</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">฿200</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>หมายเหตุ:</strong> หลังจากยืนยันการจอง คุณจะได้รับ QR Code สำหรับชำระเงิน
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 h-12 sm:h-10 text-base"
                >
                  ยกเลิก
                </Button>
                <Button 
                  onClick={onConfirm} 
                  className="flex-1 h-12 sm:h-10 text-base"
                >
                  ยืนยันการจอง
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 