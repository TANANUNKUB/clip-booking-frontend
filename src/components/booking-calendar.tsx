'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { CalendarIcon, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BookingCalendar() {
  const { booking, setSelectedDate, bookedDates, setBookedDates } = useAppStore()
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Disable booked dates
    const dateString = format(date, 'yyyy-MM-dd')
    const isBooked = bookedDates.includes(dateString)
    
    return date < today || isBooked
  }

  // Load booked dates on component mount
  useEffect(() => {
    loadBookedDates()
  }, [])

  const loadBookedDates = async () => {
    try {
      setIsLoadingBookedDates(true)
      console.log("start load booked dates")
      const dates = await apiService.getBookedDates()
      console.log("booked dates", dates)
      setBookedDates(dates)
    } catch (error) {
      console.error('Failed to load booked dates:', error)
    } finally {
      setIsLoadingBookedDates(false)
    }
  }

  const formatSelectedDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  // Calendar List View Component
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = format(currentMonth, 'MMMM yyyy', { locale: th })

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
        {/* Loading State */}
        {isLoadingBookedDates && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดข้อมูลการจอง...
          </div>
        )}

        {/* Calendar List View */}
        <div className="border rounded-lg p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days List */}
          <div className="grid grid-cols-7 gap-1">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            
            {days.map((date, index) => (
              <div key={index} className="p-1">
                {date ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full h-12 text-sm font-normal",
                      // วันที่เลือก - พื้นหลังสีน้ำเงิน ตัวหนังสือสีขาว
                      booking.selectedDate && format(booking.selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && "bg-blue-600 text-white hover:bg-blue-700",
                      // วันที่ในอดีต - สีเทา
                      isDateDisabled(date) && !bookedDates.includes(format(date, 'yyyy-MM-dd')) && "text-gray-400 cursor-not-allowed",
                      // วันที่จองแล้ว - สีแดง
                      bookedDates.includes(format(date, 'yyyy-MM-dd')) && "text-red-600 cursor-not-allowed",
                      // วันที่จองได้ - สีเขียว
                      !isDateDisabled(date) && !bookedDates.includes(format(date, 'yyyy-MM-dd')) && "text-green-600 hover:bg-green-50"
                    )}
                    onClick={() => handleDateClick(date)}
                    disabled={isDateDisabled(date) || bookedDates.includes(format(date, 'yyyy-MM-dd'))}
                  >
                    {date.getDate()}
                  </Button>
                ) : (
                  <div className="w-full h-12" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Display */}
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

        {/* Legend */}
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">คำอธิบาย:</h3>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded"></div>
              <span>วันที่ที่เลือก</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded"></div>
              <span>วันที่จองได้</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded"></div>
              <span>วันที่จองแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
              <span>วันที่ในอดีต</span>
            </div>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
          <p>• วันที่ในอดีตจะไม่สามารถเลือกได้</p>
          <p>• วันที่ที่มีการจองแล้วจะไม่สามารถเลือกได้</p>
          <p>• บริการจะเริ่มเวลา 9:00 น. ของวันที่เลือก</p>
          <p>• กรุณาเตรียมไฟล์วิดีโอไว้ล่วงหน้า</p>
        </div>
      </CardContent>
    </Card>
  )
} 
