# คู่มือการตั้งค่าและเริ่มต้นใช้งาน - Clip Booking Application

## 🚀 การเริ่มต้นใช้งานอย่างรวดเร็ว

### 1. Clone และติดตั้ง
```bash
git clone <repository-url>
cd clip-booking
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. รัน Application
```bash
# รันทั้ง Next.js และ Mock API server
npm run dev:full
```

เปิด http://localhost:3000 ในเบราว์เซอร์

## 📋 รายการไฟล์ที่สร้างขึ้น

### Core Application Files
```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (BookingFlow)
├── components/
│   ├── ui/                  # chadcn/ui components
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   ├── popover.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── line-login.tsx       # LINE authentication
│   ├── booking-calendar.tsx # Date selection
│   ├── booking-confirmation-modal.tsx
│   ├── payment-qr.tsx       # Payment handling
│   └── booking-flow.tsx     # Main flow
└── lib/
    ├── store.ts             # Zustand store
    ├── line-liff.ts         # LINE LIFF service
    ├── api.ts               # API service
    └── utils.ts             # Utilities
```

### Configuration Files
```
├── package.json             # Dependencies and scripts
├── components.json          # chadcn/ui configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
├── .env.local               # Environment variables
├── mock-server.js           # Mock API server
└── README.md                # Project documentation
```

## 🔧 การตั้งค่า LINE LIFF

### 1. สร้าง LINE Channel
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่
4. เลือก "LINE Login" channel type

### 2. ตั้งค่า LIFF App
1. ใน Channel ที่สร้าง ไปที่ "LIFF" tab
2. คลิก "Add LIFF app"
3. ตั้งค่าดังนี้:
   - LIFF app name: "Clip Booking"
   - Size: Full
   - Endpoint URL: `https://your-domain.com`
   - Scope: `profile`, `openid`
   - Bot link feature: Off

### 3. รับ LIFF ID
- คัดลอก LIFF ID จากหน้า LIFF
- เพิ่มใน `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
```

### 4. ตั้งค่า Domain
- เพิ่ม domain ใน "Endpoint URL"
- สำหรับ development: `http://localhost:3000`
- สำหรับ production: `https://your-domain.com`

## 🧪 การทดสอบใน Development

### 1. ทดสอบ LINE LIFF (Mock Mode)
เปิด Developer Tools (F12) และรันโค้ดนี้:

```javascript
// จำลอง LINE LIFF
window.liff = {
  init: async () => Promise.resolve(),
  isLoggedIn: () => true,
  login: () => {},
  logout: () => {},
  getProfile: async () => ({
    userId: 'demo_user_123',
    displayName: 'Demo User',
    pictureUrl: 'https://via.placeholder.com/150'
  }),
  sendMessages: async () => Promise.resolve(),
  isInClient: () => false
};

// จำลองการเข้าสู่ระบบ
localStorage.setItem('clip-booking-storage', JSON.stringify({
  state: {
    lineUser: {
      userId: 'demo_user_123',
      displayName: 'Demo User',
      pictureUrl: 'https://via.placeholder.com/150'
    },
    isAuthenticated: true,
    booking: { selectedDate: null, isConfirmed: false },
    payment: { qrCodeUrl: null, paymentId: null, status: null }
  },
  version: 0
}));

window.location.reload();
```

### 2. ทดสอบ API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Generate payment
curl -X POST http://localhost:3001/generate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "displayName": "Test User",
    "selectedDate": "2024-01-15T00:00:00.000Z",
    "amount": 1500
  }'
```

## 📱 การใช้งาน Application

### ขั้นตอนการจอง
1. **เข้าสู่ระบบ**: ใช้ LINE LIFF หรือ Mock mode
2. **เลือกวันที่**: เลือกวันที่ในอนาคตจาก Calendar
3. **ยืนยันการจอง**: ตรวจสอบรายละเอียดใน Modal
4. **ชำระเงิน**: สแกน QR Code และรอการยืนยัน
5. **จองสำเร็จ**: รับการยืนยันการจอง

### Features ที่มี
- ✅ LINE LIFF Authentication
- ✅ Calendar Date Selection
- ✅ Booking Confirmation Modal
- ✅ QR Code Payment
- ✅ Real-time Payment Status
- ✅ Responsive Design
- ✅ State Persistence
- ✅ Error Handling

## 🚀 การ Deploy

### 1. Vercel Deployment
```bash
# Build application
npm run build

# Deploy to Vercel
vercel --prod
```

### 2. Environment Variables ใน Production
ตั้งค่าใน Vercel Dashboard:
- `NEXT_PUBLIC_LIFF_ID`: LIFF ID จริง
- `NEXT_PUBLIC_API_BASE_URL`: API URL จริง

### 3. LINE LIFF Production Setup
1. อัปเดต LIFF Endpoint URL เป็น production domain
2. เพิ่ม production domain ใน LIFF settings
3. ทดสอบการทำงานใน production

## 🔍 การ Debug

### 1. ตรวจสอบ State
```javascript
// ดู state ปัจจุบัน
console.log(JSON.parse(localStorage.getItem('clip-booking-storage')));

// ล้าง state
localStorage.removeItem('clip-booking-storage');
```

### 2. ตรวจสอบ Network Requests
- เปิด Developer Tools > Network tab
- ดู API calls ไปยัง localhost:3001
- ตรวจสอบ request/response data

### 3. ตรวจสอบ Console Logs
- ดู logs จาก mock server ใน terminal
- ดู logs จาก browser console
- ตรวจสอบ error messages

## 🛠️ การปรับแต่ง

### 1. เปลี่ยนธีม
แก้ไข `src/app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* เพิ่ม CSS variables ตามต้องการ */
}
```

### 2. เพิ่ม Components
```bash
npx shadcn@latest add <component-name>
```

### 3. ปรับแต่ง API
แก้ไข `src/lib/api.ts` เพื่อเปลี่ยน API endpoints

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - เอกสารหลักของโปรเจค
- [DEMO.md](./DEMO.md) - คู่มือการทดสอบ
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - สรุปการทำงาน

## 🆘 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. LINE LIFF ไม่ทำงาน
- ตรวจสอบ LIFF ID ใน `.env.local`
- ตรวจสอบ Domain settings ใน LINE Developers Console
- ตรวจสอบ Console สำหรับ error messages

#### 2. API ไม่ตอบสนอง
- ตรวจสอบว่า mock server กำลังรันอยู่
- ตรวจสอบ API Base URL
- ตรวจสอบ CORS settings

#### 3. Payment Polling ไม่ทำงาน
- ตรวจสอบ Payment ID
- ตรวจสอบ Network connectivity
- ตรวจสอบ API endpoint

#### 4. State ไม่ persist
- ตรวจสอบ localStorage
- ตรวจสอบ Zustand persist configuration
- ตรวจสอบ browser storage settings

## 📞 การติดต่อ

หากมีปัญหาหรือคำถาม สามารถ:
1. ตรวจสอบเอกสารในโปรเจค
2. ดู error messages ใน console
3. ตรวจสอบ network requests
4. ทดสอบด้วย mock mode ก่อน

---

**หมายเหตุ**: Application นี้เป็น prototype สำหรับการทดสอบ การใช้งานจริงต้องตั้งค่า LINE LIFF และ API endpoints จริง 