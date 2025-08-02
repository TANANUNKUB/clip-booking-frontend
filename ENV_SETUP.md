# การตั้งค่า Environment Variables

## ไฟล์ที่เกี่ยวข้อง

- `.env.local` - ไฟล์ environment variables หลัก (ไม่ commit ขึ้น git)
- `.env.example` - ไฟล์ตัวอย่าง environment variables

## การสร้างไฟล์ .env.local

1. คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
```bash
cp .env.example .env.local
```

2. แก้ไขค่าใน `.env.local` ให้ตรงกับโปรเจคของคุณ

## Environment Variables ที่จำเป็น

### สำหรับ Frontend (Next.js)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# LINE LIFF Configuration
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# Debug Mode (สำหรับเปิดใช้งานหน้าเทสใน production)
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### สำหรับ Backend (Mock Server)

```env
# Server Configuration
PORT=3001

# Payment Configuration
PAYMENT_TIMEOUT_MINUTES=10
PAYMENT_POLLING_INTERVAL_MS=5000

# QR Code Configuration
QR_CODE_SIZE=200x200
QR_CODE_API_URL=https://api.qrserver.com/v1/create-qr-code/

# Booking Configuration
BOOKING_AMOUNT=1500
BOOKING_STATUS_PENDING=pending
BOOKING_STATUS_CONFIRMED=confirmed
BOOKING_STATUS_CANCELLED=cancelled

# Payment Status
PAYMENT_STATUS_PENDING=pending
PAYMENT_STATUS_SUCCESS=success
PAYMENT_STATUS_FAILED=failed
```

## การตั้งค่าใน Production

### Vercel
1. ไปที่ Vercel Dashboard
2. เลือกโปรเจค
3. ไปที่ Settings > Environment Variables
4. เพิ่ม environment variables ที่จำเป็น

### Netlify
1. ไปที่ Netlify Dashboard
2. เลือกไซต์
3. ไปที่ Site settings > Environment variables
4. เพิ่ม environment variables ที่จำเป็น

### Server อื่นๆ
ตั้งค่า environment variables ตามที่ hosting service กำหนด

## Environment Variables ที่สำคัญ

### NEXT_PUBLIC_API_BASE_URL
- **Development:** `http://localhost:3001`
- **Production:** `https://your-api-domain.com`

### NEXT_PUBLIC_LIFF_ID
- **Development:** `your_liff_id_here`
- **Production:** LIFF ID จริงจาก LINE Developers Console

### NEXT_PUBLIC_ENABLE_DEBUG
- **Development:** `true` (หรือไม่ต้องตั้ง)
- **Production:** `false` (ซ่อนหน้าเทส) หรือ `true` (เปิดหน้าเทส)

## การทดสอบ Environment Variables

### ตรวจสอบใน Development
```bash
# เริ่ม development server
npm run dev

# ตรวจสอบ console log
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('LIFF ID:', process.env.NEXT_PUBLIC_LIFF_ID)
console.log('Debug Mode:', process.env.NEXT_PUBLIC_ENABLE_DEBUG)
```

### ตรวจสอบใน Production
```bash
# Build และ start
npm run build
npm start

# หรือตรวจสอบใน browser console
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
```

## ข้อควรระวัง

1. **ไฟล์ .env.local ไม่ควร commit ขึ้น git**
   - มีข้อมูลสำคัญ
   - อยู่ใน .gitignore แล้ว

2. **ใช้ NEXT_PUBLIC_ prefix สำหรับ client-side**
   - ตัวแปรที่ใช้ใน browser ต้องมี NEXT_PUBLIC_
   - ตัวแปรที่ใช้ใน server ไม่ต้องมี prefix

3. **ตรวจสอบค่าใน production**
   - ตรวจสอบว่า API URL ถูกต้อง
   - ตรวจสอบว่า LIFF ID ถูกต้อง

## ตัวอย่างการใช้งาน

### Development
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Production
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_LIFF_ID=1234567890-abcdef
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Production with Debug Mode
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_LIFF_ID=1234567890-abcdef
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## การแก้ไขปัญหา

### ปัญหา: Environment variables ไม่ทำงาน
1. ตรวจสอบว่าไฟล์ชื่อถูกต้อง (`.env.local`)
2. ตรวจสอบว่า restart development server
3. ตรวจสอบว่าใช้ prefix `NEXT_PUBLIC_` สำหรับ client-side

### ปัญหา: หน้าเทสไม่แสดงใน production
1. ตรวจสอบ `NEXT_PUBLIC_ENABLE_DEBUG=true`
2. หรือเพิ่ม `?debug=true` ต่อท้าย URL

### ปัญหา: LINE LIFF ไม่ทำงาน
1. ตรวจสอบ `NEXT_PUBLIC_LIFF_ID`
2. ตรวจสอบ LIFF URL ใน LINE Developers Console
3. ตรวจสอบ Endpoint URL ใน LIFF settings 