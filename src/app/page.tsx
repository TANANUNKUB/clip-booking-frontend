import { BookingFlow } from '@/components/booking-flow'
import { Button } from '@/components/ui/button'
import { TestTube } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  // ซ่อนปุ่ม Debug ใน production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return (
    <div className="relative">
      {/* Debug Mode Button - แสดงเฉพาะใน development */}
      {isDevelopment && (
        <div className="absolute top-4 right-4 z-10">
          <Link href="/test-tabs-working">
            <Button variant="outline" size="sm" className="bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100">
              <TestTube className="h-4 w-4 mr-2" />
              Debug Mode
            </Button>
          </Link>
        </div>
      )}
      
      <BookingFlow />
    </div>
  )
}
