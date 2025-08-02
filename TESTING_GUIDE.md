# คู่มือการเทสระบบจอง

## วิธีการเทสแอปที่ Deploy แล้ว

หลังจาก deploy v1 ไปแล้ว คุณสามารถเทสระบบได้หลายวิธีโดยไม่ต้อง redirect ไปที่ LINE LIFF:

### หน้าเทสหลัก

**URL:** `https://your-domain.com/test-tabs-working`

**ข้อดี:**
- ใช้ Tabs UI สวยงาม
- สามารถสลับระหว่าง Debug Mode และ LINE Login ได้
- มีปุ่ม Logout ชัดเจน
- มีคำแนะนำครบถ้วน
- ซ่อนใน production โดยอัตโนมัติ

## การเข้าถึงหน้าเทสใน Production

### วิธีที่ 1: URL Parameter
เพิ่ม `?debug=true` ต่อท้าย URL:
```
https://your-domain.com/test-tabs-working?debug=true
```

### วิธีที่ 2: Environment Variable
ตั้งค่าใน `.env.local` หรือ environment variables:
```env
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### วิธีที่ 3: Development Mode
ใน development mode จะเข้าถึงได้โดยตรง:
```
http://localhost:3000/test-tabs-working
```

## ฟีเจอร์ที่สามารถเทสได้

### 1. ระบบเข้าสู่ระบบ
- ✅ Debug Login (ไม่ต้องใช้ LINE LIFF)
- ✅ LINE Login (ใช้ LINE LIFF จริง)
- ✅ การออกจากระบบ

### 2. ระบบจอง
- ✅ เลือกวันที่
- ✅ ตรวจสอบวันที่ที่ถูกจองแล้ว
- ✅ ยืนยันการจอง
- ✅ ยกเลิกการจอง

### 3. ระบบชำระเงิน
- ✅ สร้าง QR Code สำหรับชำระเงิน
- ✅ ตรวจสอบสถานะการชำระเงิน
- ✅ อัปโหลดสลิปการโอนเงิน
- ✅ ยืนยันการชำระเงิน

### 4. ระบบจัดการข้อมูล
- ✅ บันทึกข้อมูลการจอง
- ✅ อัปเดตสถานะการจอง
- ✅ ลบการจอง

## วิธีการเทสแบบละเอียด

### ขั้นตอนที่ 1: เข้าสู่ระบบ
1. ไปที่ `/test-tabs-working`
2. เลือกแท็บ "Debug Mode"
3. เลือกผู้ใช้ทดสอบ หรือสร้างผู้ใช้ใหม่
4. ตรวจสอบว่าสถานะเป็น "เข้าสู่ระบบแล้ว"

### ขั้นตอนที่ 2: ทดสอบการจอง
1. เลือกวันที่ที่ต้องการจอง
2. คลิก "ดำเนินการต่อ"
3. ยืนยันการจอง
4. ตรวจสอบว่าสร้างการจองสำเร็จ

### ขั้นตอนที่ 3: ทดสอบการชำระเงิน
1. ตรวจสอบ QR Code แสดงขึ้นมา
2. ทดสอบการอัปโหลดสลิป
3. ตรวจสอบสถานะการชำระเงิน
4. ยืนยันการชำระเงิน

### ขั้นตอนที่ 4: ทดสอบการยกเลิก
1. คลิกปุ่ม "ยกเลิกการจอง"
2. ยืนยันการยกเลิก
3. ตรวจสอบว่าการจองถูกลบแล้ว

## การเทสในสภาพแวดล้อมต่างๆ

### Desktop Browser
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Responsive design
- ✅ Keyboard navigation

### Mobile Browser
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Touch interactions
- ✅ Mobile-optimized UI

### LINE App (สำหรับ LINE Login)
- ✅ LIFF integration
- ✅ LINE profile data
- ✅ LINE messaging

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเข้าถึงหน้าเทสได้**
   - ตรวจสอบว่าเพิ่ม `?debug=true` ต่อท้าย URL
   - หรือตั้งค่า `NEXT_PUBLIC_ENABLE_DEBUG=true`

2. **ไม่สามารถเข้าสู่ระบบได้**
   - ตรวจสอบว่าเลือก Debug Mode
   - ลองรีเฟรชหน้าเว็บ

3. **QR Code ไม่แสดง**
   - ตรวจสอบการเชื่อมต่อ API
   - ลองสร้างการจองใหม่

4. **ไม่สามารถอัปโหลดสลิปได้**
   - ตรวจสอบรูปแบบไฟล์ (JPG, PNG)
   - ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)

5. **การจองไม่สำเร็จ**
   - ตรวจสอบวันที่ที่เลือก
   - ตรวจสอบว่าวันนั้นไม่ถูกจองไปแล้ว

### การ Debug

1. **เปิด Developer Tools**
   - กด F12 หรือคลิกขวา > Inspect
   - ดู Console สำหรับ error messages

2. **ตรวจสอบ Network**
   - ดู Network tab ใน Developer Tools
   - ตรวจสอบ API calls

3. **ตรวจสอบ Local Storage**
   - ดู Application tab > Local Storage
   - ตรวจสอบข้อมูลที่บันทึก

## การ Deploy และเทส

### Production Environment
```bash
# Build สำหรับ production
npm run build

# Deploy ไปยัง hosting service
# เช่น Vercel, Netlify, หรือ server ของคุณ
```

### Environment Variables
ตรวจสอบว่าตั้งค่า environment variables ถูกต้อง:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
# สำหรับเปิดใช้งานหน้าเทสใน production
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## การซ่อนใน Production

### ปุ่ม Debug ในหน้าหลัก
- ปุ่ม Debug จะแสดงเฉพาะใน development mode
- ใน production จะซ่อนโดยอัตโนมัติ

### หน้าเทส
- หน้าเทสจะซ่อนใน production โดยอัตโนมัติ
- สามารถเข้าถึงได้ผ่าน URL parameter หรือ environment variable

## สรุป

การใช้หน้าเทส `/test-tabs-working` เป็นวิธีที่ดีที่สุดในการเทสระบบจองเพราะ:

1. **ครบถ้วน** - มีทั้ง Debug Mode และ LINE Login
2. **ปลอดภัย** - ซ่อนใน production โดยอัตโนมัติ
3. **ใช้งานง่าย** - ใช้ Tabs UI ที่สวยงาม
4. **ยืดหยุ่น** - สามารถเข้าถึงใน production ได้เมื่อต้องการ

สำหรับการใช้งานจริง ให้ใช้ LINE Login mode ในหน้า `/test-tabs-working` 