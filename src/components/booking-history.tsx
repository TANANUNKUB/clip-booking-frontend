'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { apiService } from '@/lib/api'
import { Calendar, Clock, User, Loader2, RefreshCw, XCircle, CheckCircle, AlertCircle } from 'lucide-react'

interface BookingHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingHistory({ isOpen, onClose }: BookingHistoryProps) {
  const { lineUser } = useAppStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    if (!lineUser?.userId) return

    try {
      setIsLoading(true)
      setError(null)
      const userBookings = await apiService.getUserBookings(lineUser.userId)
      setBookings(userBookings)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError('ไม่สามารถโหลดประวัติการจองได้')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && lineUser?.userId) {
      fetchBookings()
    }
  }, [isOpen, lineUser?.userId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">ยืนยันแล้ว</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">รอยืนยัน</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">ยกเลิก</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE, d MMMM yyyy', { locale: th })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'd MMM yyyy HH:mm', { locale: th })
    } catch {
      return dateString
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">ประวัติการจอง</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchBookings}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>กำลังโหลดประวัติการจอง...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchBookings} variant="outline">
                ลองใหม่
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีประวัติการจอง</h3>
              <p className="text-gray-600">คุณยังไม่มีการจองใดๆ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.booking_id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <CardTitle className="text-base">
                          การจอง #{booking.booking_id.slice(-8)}
                        </CardTitle>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      {booking.display_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">วันที่จอง</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.selected_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">วันที่สร้าง</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(booking.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-sm font-medium">จำนวนเงิน</p>
                        <p className="text-lg font-bold text-blue-600">
                          ฿{booking.amount.toLocaleString()}
                        </p>
                      </div>
                      {booking.payment_id && (
                        <Badge variant="outline" className="text-xs">
                          Payment: {booking.payment_id.slice(-8)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 