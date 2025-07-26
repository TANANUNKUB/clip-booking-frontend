'use client'

import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { CalendarIcon, Clock, User, CreditCard } from 'lucide-react'

interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BookingConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: BookingConfirmationModalProps) {
  const { booking, lineUser } = useAppStore()

  if (!booking.selectedDate || !lineUser) {
    return null
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: th })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
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
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">เวลาเริ่มงาน</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {formatTime(booking.selectedDate)} น.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ค่าบริการ</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">฿1,500</p>
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
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 sm:h-10 text-base">
              ยกเลิก
            </Button>
            <Button onClick={onConfirm} className="flex-1 h-12 sm:h-10 text-base">
              ยืนยันการจอง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 