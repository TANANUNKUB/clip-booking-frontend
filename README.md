# Clip Booking - LINE LIFF Video Editing Service

แอปพลิเคชันจองบริการตัดต่อวิดีโอที่ใช้ LINE LIFF สำหรับ authentication และ chadcn/ui สำหรับ UI components

## คุณสมบัติ

- 🔐 LINE LIFF Authentication
- 📅 Calendar สำหรับเลือกวันที่จอง
- 💳 QR Code Payment System
- 🔄 Real-time Payment Status Polling
- 📱 Responsive Design
- 🎨 Modern UI ด้วย chadcn/ui

## การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd clip-booking
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่มค่าต่อไปนี้:

```env
# LINE LIFF Configuration
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 4. ตั้งค่า LINE LIFF

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider และ Channel ใหม่
3. ตั้งค่า LIFF App และรับ LIFF ID
4. เพิ่ม LIFF ID ใน `.env.local`

### 5. รัน Development Server
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # chadcn/ui components
│   ├── booking-calendar.tsx
│   ├── booking-confirmation-modal.tsx
│   ├── booking-flow.tsx
│   ├── line-login.tsx
│   └── payment-qr.tsx
└── lib/                  # Utilities and services
    ├── api.ts            # API service
    ├── line-liff.ts      # LINE LIFF service
    ├── store.ts          # Zustand store
    └── utils.ts          # Utility functions
```

## การใช้งาน

### 1. การเข้าสู่ระบบ
- ผู้ใช้ต้องเข้าสู่ระบบผ่าน LINE LIFF
- ระบบจะดึงข้อมูล User ID และ Display Name จาก LINE

### 2. การเลือกวันที่
- ใช้ Calendar component จาก chadcn/ui
- ไม่สามารถเลือกวันที่ในอดีตได้
- แสดงวันที่ในรูปแบบภาษาไทย

### 3. การชำระเงิน
- ระบบจะสร้าง QR Code สำหรับชำระเงิน
- ตรวจสอบสถานะการชำระเงินแบบ real-time
- แสดงผลลัพธ์เมื่อชำระเงินสำเร็จ

### 4. การยืนยันการจอง
- แสดงรายละเอียดการจองใน modal
- ยืนยันการจองและสร้าง QR Code
- ส่งข้อความยืนยันผ่าน LINE

## API Endpoints

แอปพลิเคชันนี้ต้องการ API endpoints ต่อไปนี้:

### POST /generate-payment
สร้าง QR Code สำหรับชำระเงิน

**Request:**
```json
{
  "userId": "string",
  "displayName": "string",
  "selectedDate": "string",
  "amount": 1500
}
```

**Response:**
```json
{
  "paymentId": "string",
  "qrCodeUrl": "string",
  "amount": 1500
}
```

### GET /payment-status/{paymentId}
ตรวจสอบสถานะการชำระเงิน

**Response:**
```json
{
  "paymentId": "string",
  "status": "pending|success|failed",
  "amount": 1500,
  "paidAt": "string"
}
```

### POST /confirm-booking
ยืนยันการจองหลังจากชำระเงินสำเร็จ

**Request:**
```json
{
  "paymentId": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

## State Management

ใช้ Zustand สำหรับจัดการ state ของแอปพลิเคชัน:

- **LINE Authentication**: User ID, Display Name, Authentication status
- **Booking**: Selected date, confirmation status
- **Payment**: QR Code URL, Payment ID, Payment status

## การปรับแต่ง

### การเปลี่ยนธีม
แก้ไขไฟล์ `src/app/globals.css` เพื่อปรับแต่ง CSS variables

### การเพิ่ม Components
ใช้ shadcn/ui CLI เพื่อเพิ่ม components ใหม่:
```bash
npx shadcn@latest add <component-name>
```

### การปรับแต่ง LINE LIFF
แก้ไขไฟล์ `src/lib/line-liff.ts` เพื่อเพิ่มฟีเจอร์ใหม่

## การ Deploy

### Vercel
1. Push โค้ดไปยัง GitHub
2. เชื่อมต่อกับ Vercel
3. ตั้งค่า Environment Variables ใน Vercel Dashboard
4. Deploy

### การตั้งค่า LINE LIFF สำหรับ Production
1. อัปเดต LIFF Endpoint URL ใน LINE Developers Console
2. เพิ่ม Domain ใน LIFF Settings
3. ตั้งค่า Environment Variables

## การแก้ไขปัญหา

### LINE LIFF ไม่ทำงาน
- ตรวจสอบ LIFF ID ใน `.env.local`
- ตรวจสอบ Domain settings ใน LINE Developers Console
- ตรวจสอบ Console สำหรับ error messages

### API ไม่ตอบสนอง
- ตรวจสอบ API Base URL
- ตรวจสอบ Network tab ใน Developer Tools
- ตรวจสอบ CORS settings

### Payment Polling ไม่ทำงาน
- ตรวจสอบ Payment ID
- ตรวจสอบ API endpoint สำหรับ payment status
- ตรวจสอบ Network connectivity

## License

MIT License
