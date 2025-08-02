'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { User, LogOut, Loader2, Settings } from 'lucide-react'

interface DebugUser {
  userId: string
  displayName: string
  pictureUrl: string
}

const MOCK_USERS: DebugUser[] = [
  {
    userId: 'debug_user_1',
    displayName: 'ทดสอบผู้ใช้ 1',
    pictureUrl: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=U1'
  },
  {
    userId: 'debug_user_2',
    displayName: 'ทดสอบผู้ใช้ 2',
    pictureUrl: 'https://via.placeholder.com/100x100/059669/FFFFFF?text=U2'
  },
  {
    userId: 'debug_user_3',
    displayName: 'ทดสอบผู้ใช้ 3',
    pictureUrl: 'https://via.placeholder.com/100x100/DC2626/FFFFFF?text=U3'
  }
]

export function DebugLogin() {
  const { 
    lineUser, 
    isAuthenticated, 
    isLoading, 
    setLineUser, 
    setAuthenticated, 
    setLoading 
  } = useAppStore()
  
  const [selectedUser, setSelectedUser] = useState<DebugUser | null>(null)
  const [customName, setCustomName] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleLogin = async (user: DebugUser) => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLineUser({
        userId: user.userId,
        displayName: user.displayName,
        pictureUrl: user.pictureUrl
      })
      setAuthenticated(true)
    } catch (error) {
      console.error('Debug login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomLogin = async () => {
    if (!customName.trim()) return
    
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const customUser: DebugUser = {
        userId: `debug_custom_${Date.now()}`,
        displayName: customName.trim(),
        pictureUrl: `https://via.placeholder.com/100x100/7C3AED/FFFFFF?text=${customName.charAt(0).toUpperCase()}`
      }
      
      setLineUser({
        userId: customUser.userId,
        displayName: customUser.displayName,
        pictureUrl: customUser.pictureUrl
      })
      setAuthenticated(true)
      setCustomName('')
      setShowCustomForm(false)
    } catch (error) {
      console.error('Custom login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLineUser(null)
      setAuthenticated(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated && lineUser) {
    return (
      <Card className="w-full max-w-xs sm:max-w-md mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            เข้าสู่ระบบแล้ว (Debug Mode)
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
              <Badge variant="outline" className="text-xs ml-1 bg-yellow-50 text-yellow-700">
                Debug Mode
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
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Debug Login
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          เลือกผู้ใช้ทดสอบเพื่อเข้าสู่ระบบโดยไม่ต้องใช้ LINE LIFF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Mock Users */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">ผู้ใช้ทดสอบ:</Label>
          {MOCK_USERS.map((user) => (
            <Button
              key={user.userId}
              onClick={() => handleLogin(user)}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-start h-auto p-3"
            >
              <img 
                src={user.pictureUrl} 
                alt={user.displayName}
                className="w-8 h-8 rounded-full mr-3"
              />
              <span className="text-sm">{user.displayName}</span>
            </Button>
          ))}
        </div>

        {/* Custom User */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">ผู้ใช้กำหนดเอง:</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="h-6 px-2 text-xs"
            >
              {showCustomForm ? 'ซ่อน' : 'แสดง'}
            </Button>
          </div>
          
          {showCustomForm && (
            <div className="space-y-2">
              <Input
                placeholder="ใส่ชื่อผู้ใช้"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9"
              />
              <Button
                onClick={handleCustomLogin}
                disabled={isLoading || !customName.trim()}
                variant="outline"
                className="w-full h-9 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                เข้าสู่ระบบ
              </Button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 text-center">
            โหมด Debug - สำหรับทดสอบโดยไม่ต้องใช้ LINE LIFF
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 