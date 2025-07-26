'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { Calendar, Loader2, Users } from 'lucide-react'

export function BookedDatesDisplay() {
  const { bookedDates, setBookedDates } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadBookedDates()
  }, [])

  const loadBookedDates = async () => {
    try {
      setIsLoading(true)
      const dates = await apiService.getBookedDates()
      setBookedDates(dates)
    } catch (error) {
      console.error('Failed to load booked dates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'EEEE, d MMMM yyyy', { locale: th })
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          <span className="ml-2 text-sm sm:text-base">กำลังโหลดข้อมูลการจอง...</span>
        </CardContent>
      </Card>
    )
  }

  if (bookedDates.length === 0) {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            วันที่ที่มีการจอง
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            ยังไม่มีวันที่ที่มีการจอง
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-gray-600">
              ยังไม่มีลูกค้าจองในระบบ
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
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          วันที่ที่มีการจอง
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          วันที่ที่มีลูกค้าจองแล้ว ({bookedDates.length} วัน)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        {bookedDates.map((dateString, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800 text-sm sm:text-base">
                {formatDate(dateString)}
              </span>
            </div>
            <Badge variant="destructive" className="text-xs">
              จองแล้ว
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 