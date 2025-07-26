'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BookingCalendar() {
  const { booking, setSelectedDate, bookedDates, setBookedDates, isLoading, setLoading } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setIsOpen(false)
    }
  }

  // Load booked dates on component mount
  useEffect(() => {
    loadBookedDates()
  }, [])

  const loadBookedDates = async () => {
    try {
      setIsLoadingBookedDates(true)
      const dates = await apiService.getBookedDates()
      setBookedDates(dates)
    } catch (error) {
      console.error('Failed to load booked dates:', error)
    } finally {
      setIsLoadingBookedDates(false)
    }
  }

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Disable booked dates
    const dateString = format(date, 'yyyy-MM-dd')
    const isBooked = bookedDates.includes(dateString)
    
    return date < today || isBooked
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  return (
    <Card className="w-full max-w-xs sm:max-w-md mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          เลือกวันที่จอง
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          เลือกวันที่ที่คุณต้องการใช้บริการตัดต่อวิดีโอ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 sm:h-10 justify-start text-left font-normal text-base",
                !booking.selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {booking.selectedDate ? (
                formatSelectedDate(booking.selectedDate)
              ) : (
                "เลือกวันที่"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={booking.selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              initialFocus
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>

        {booking.selectedDate && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 text-sm sm:text-base">
                วันที่เลือก: {formatSelectedDate(booking.selectedDate)}
              </p>
              <Badge variant="secondary" className="text-xs">
                พร้อมจอง
              </Badge>
            </div>
          </div>
        )}

        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
          <p>• วันที่ในอดีตจะไม่สามารถเลือกได้</p>
          <p>• วันที่ที่มีการจองแล้วจะไม่สามารถเลือกได้</p>
          <p>• บริการจะเริ่มเวลา 9:00 น. ของวันที่เลือก</p>
          <p>• กรุณาเตรียมไฟล์วิดีโอไว้ล่วงหน้า</p>
        </div>

        {isLoadingBookedDates && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            กำลังโหลดข้อมูลการจอง...
          </div>
        )}
      </CardContent>
    </Card>
  )
} 