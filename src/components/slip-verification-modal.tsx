'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, FileText } from 'lucide-react'

type VerificationStatus = 'checking' | 'success' | 'failed'

interface SlipVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  status: VerificationStatus
  message: string
  onConfirm?: () => void
  onRetry?: () => void
}

export function SlipVerificationModal({
  isOpen,
  onClose,
  status,
  message,
  onConfirm
}: SlipVerificationModalProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />
      default:
        return <FileText className="h-12 w-12 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'checking':
        return 'กำลังตรวจสอบสลิป'
      case 'success':
        return 'ตรวจสอบสำเร็จ'
      case 'failed':
        return 'ตรวจสอบไม่สำเร็จ'
      default:
        return 'ตรวจสอบสลิป'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {getStatusTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 p-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Message */}
          <div className="text-center">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            {status === 'checking' && (
              <div className="w-full">
                <p className="text-xs text-gray-500 text-center">
                  กรุณารอสักครู่...
                </p>
              </div>
            )}

            {status === 'success' && (
              <Button
                onClick={onConfirm}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                ดำเนินการต่อ
              </Button>
            )}

            {status === 'failed' && (
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  ปิด
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 