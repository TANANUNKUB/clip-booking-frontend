'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { lineLiffService } from '@/lib/line-liff'
import { User, LogOut, Loader2 } from 'lucide-react'

export function LineLogin() {
  const { 
    lineUser, 
    isAuthenticated, 
    isLoading, 
    setLineUser, 
    setAuthenticated, 
    setLoading 
  } = useAppStore()
  
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    initializeLiff()
  }, [])

  const initializeLiff = async () => {
    try {
      setIsInitializing(true)
      const success = await lineLiffService.initialize()
      
      if (success) {
        if (lineLiffService.isLoggedIn()) {
          const user = await lineLiffService.getUserProfile()
          if (user) {
            setLineUser(user)
            setAuthenticated(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize LIFF:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true)
      const success = await lineLiffService.login()
      
      if (success) {
        const user = await lineLiffService.getUserProfile()
        if (user) {
          setLineUser(user)
          setAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await lineLiffService.logout()
      setLineUser(null)
      setAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          <span className="ml-2 text-sm sm:text-base">กำลังโหลด...</span>
        </CardContent>
      </Card>
    )
  }

  if (isAuthenticated && lineUser) {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            เข้าสู่ระบบแล้ว
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            ยินดีต้อนรับคุณ {lineUser.displayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            {lineUser.pictureUrl && (
              <img 
                src={lineUser.pictureUrl} 
                alt={lineUser.displayName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-sm sm:text-base">{lineUser.displayName}</p>
              <Badge variant="secondary" className="text-xs">
                ID: {lineUser.userId}
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout} 
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 sm:h-10 text-base"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-xs sm:max-w-md mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">เข้าสู่ระบบด้วย LINE</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          กรุณาเข้าสู่ระบบเพื่อจองบริการตัดต่อวิดีโอ
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="w-full h-12 sm:h-10 text-base bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <User className="h-4 w-4 mr-2" />
          )}
          เข้าสู่ระบบด้วย LINE
        </Button>
      </CardContent>
    </Card>
  )
} 