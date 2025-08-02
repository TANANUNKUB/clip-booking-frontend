'use client'

import { useState, useEffect } from 'react'
import { LineLogin } from '@/components/line-login'
import { DebugLogin } from '@/components/debug-login'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { BookingFlow } from '@/components/booking-flow'
import { Settings, User, TestTube, ArrowLeft, LogOut, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TestTabsWorkingPage() {
  const { isAuthenticated, lineUser, setLineUser, setAuthenticated } = useAppStore()
  const [activeTab, setActiveTab] = useState('debug')
  const [isAccessible, setIsAccessible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ตรวจสอบการเข้าถึงหน้าเทส
    const checkAccess = () => {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=true')
      const hasDebugEnv = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
      
      setIsAccessible(isDevelopment || hasDebugParam || hasDebugEnv)
      setIsLoading(false)
    }

    checkAccess()
  }, [])

  const handleLogout = () => {
    setLineUser(null)
    setAuthenticated(false)
    setActiveTab('debug')
  }

  // แสดงหน้า Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // แสดงหน้า Access Denied
  if (!isAccessible) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">ไม่สามารถเข้าถึงได้</CardTitle>
            <CardDescription>
              หน้าเทสนี้ไม่สามารถเข้าถึงได้ใน production
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              หากต้องการเข้าถึงหน้าเทส ให้เพิ่ม <code className="bg-gray-100 px-1 rounded">?debug=true</code> 
              ต่อท้าย URL หรือตั้งค่า <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_ENABLE_DEBUG=true</code>
            </p>
            <Link href="/">
              <Button className="w-full">
                กลับหน้าหลัก
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            หน้าเทสระบบจอง
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            ทดสอบระบบจองด้วย Tabs UI
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              <TestTube className="h-3 w-3 mr-1" />
              Test Mode
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              v1.0.0
            </Badge>
            {!process.env.NODE_ENV === 'development' && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                Debug Enabled
              </Badge>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-6">
            {/* Tabs Login */}
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Settings className="h-5 w-5" />
                  เลือกวิธีการเข้าสู่ระบบ
                </CardTitle>
                <CardDescription>
                  ใช้ Tabs เพื่อสลับระหว่างโหมดต่างๆ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="debug" className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Debug Mode
                    </TabsTrigger>
                    <TabsTrigger value="line" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      LINE Login
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="debug" className="mt-4">
                    <div className="text-center mb-4">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mb-2">
                        Debug Mode
                      </Badge>
                      <p className="text-xs text-gray-600">
                        เลือกผู้ใช้ทดสอบโดยไม่ต้องใช้ LINE LIFF
                      </p>
                    </div>
                    <DebugLogin />
                  </TabsContent>
                  
                  <TabsContent value="line" className="mt-4">
                    <div className="text-center mb-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 mb-2">
                        LINE Login
                      </Badge>
                      <p className="text-xs text-gray-600">
                        ใช้ LINE LIFF จริง (ต้องเข้าผ่าน LINE App)
                      </p>
                    </div>
                    <LineLogin />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info with Logout */}
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">สถานะการเข้าสู่ระบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700 mb-2">
                    เข้าสู่ระบบแล้ว
                  </Badge>
                  <p className="text-sm text-gray-600">
                    สามารถทดสอบระบบจองได้แล้ว
                  </p>
                </div>
                
                {lineUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {lineUser.pictureUrl && (
                      <img 
                        src={lineUser.pictureUrl} 
                        alt={lineUser.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lineUser.displayName}</p>
                      <p className="text-xs text-gray-500">ID: {lineUser.userId}</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </CardContent>
            </Card>

            {/* Booking Flow */}
            <BookingFlow />
          </div>
        )}

        {/* Instructions */}
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-lg">วิธีการเทส</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">1. Debug Mode (แนะนำ)</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• เลือกผู้ใช้ทดสอบที่มีอยู่แล้ว</li>
                <li>• หรือสร้างผู้ใช้ใหม่โดยใส่ชื่อ</li>
                <li>• ไม่ต้องใช้ LINE LIFF</li>
                <li>• เหมาะสำหรับเทสฟีเจอร์ต่างๆ</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">2. LINE Login</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• ใช้ LINE LIFF จริง</li>
                <li>• ต้องเข้าผ่าน LINE App</li>
                <li>• เหมาะสำหรับเทสการทำงานจริง</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">3. การเทสระบบจอง</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• เลือกวันที่ที่ต้องการจอง</li>
                <li>• ทดสอบการชำระเงินผ่าน QR Code</li>
                <li>• ทดสอบการอัปโหลดสลิป</li>
                <li>• ทดสอบการยกเลิกการจอง</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">4. การเข้าถึงหน้าเทสใน Production</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• เพิ่ม <code className="bg-gray-100 px-1 rounded">?debug=true</code> ต่อท้าย URL</li>
                <li>• หรือตั้งค่า <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_ENABLE_DEBUG=true</code></li>
                <li>• ตัวอย่าง: <code className="bg-gray-100 px-1 rounded">https://your-domain.com/test-tabs-working?debug=true</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 