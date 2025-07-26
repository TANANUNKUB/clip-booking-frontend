# Demo Guide - Clip Booking Application

## การทดสอบ Application

### 1. เริ่มต้น Application

```bash
# Terminal 1: รัน Next.js application
npm run dev

# Terminal 2: รัน Mock API server
npm run mock-server
```

หรือรันทั้งสองพร้อมกัน:
```bash
npm run dev:full
```

### 2. การทดสอบ LINE LIFF (Development Mode)

เนื่องจากเรายังไม่ได้ตั้งค่า LINE LIFF จริง เราสามารถทดสอบได้โดย:

1. เปิด Developer Tools (F12)
2. ไปที่ Console
3. รันโค้ดต่อไปนี้เพื่อจำลอง LINE authentication:

```javascript
// จำลอง LINE LIFF initialization
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
    booking: {
      selectedDate: null,
      isConfirmed: false
    },
    payment: {
      qrCodeUrl: null,
      paymentId: null,
      status: null
    }
  },
  version: 0
}));

// รีเฟรชหน้า
window.location.reload();
```

### 3. ขั้นตอนการทดสอบ

#### ขั้นตอนที่ 1: การเข้าสู่ระบบ
1. เปิด http://localhost:3000
2. ใช้โค้ด JavaScript ข้างต้นเพื่อจำลอง LINE login
3. ควรเห็นหน้าแสดงข้อมูลผู้ใช้

#### ขั้นตอนที่ 2: การเลือกวันที่
1. เลือกวันที่ในอนาคตจาก Calendar
2. ควรเห็นการแสดงวันที่ที่เลือก
3. กดปุ่ม "ดำเนินการต่อ"

#### ขั้นตอนที่ 3: การยืนยันการจอง
1. ตรวจสอบรายละเอียดใน Modal
2. กดปุ่ม "ยืนยันการจอง"

#### ขั้นตอนที่ 4: การชำระเงิน
1. ควรเห็น QR Code ที่สร้างขึ้น
2. ระบบจะเริ่ม polling สถานะการชำระเงิน
3. หลังจาก 2 นาที QR Code จะเปลี่ยนเป็นสถานะ "สำเร็จ"

#### ขั้นตอนที่ 5: การยืนยันการจองสำเร็จ
1. ควรเห็นหน้าแสดงการจองสำเร็จ
2. ตรวจสอบข้อมูลการจอง

### 4. การทดสอบ API Endpoints

#### ทดสอบ Health Check
```bash
curl http://localhost:3001/health
```

#### ทดสอบ Generate Payment
```bash
curl -X POST http://localhost:3001/generate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "displayName": "Test User",
    "selectedDate": "2024-01-15T00:00:00.000Z",
    "amount": 1500
  }'
```

#### ทดสอบ Payment Status
```bash
# ใช้ paymentId จาก response ข้างต้น
curl http://localhost:3001/payment-status/payment_1234567890
```

#### ทดสอบ Confirm Booking
```bash
curl -X POST http://localhost:3001/confirm-booking \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment_1234567890"
  }'
```

### 5. การ Debug

#### ตรวจสอบ State ใน Browser
```javascript
// ดู state ปัจจุบัน
console.log(JSON.parse(localStorage.getItem('clip-booking-storage')));

// ล้าง state
localStorage.removeItem('clip-booking-storage');
```

#### ตรวจสอบ Network Requests
1. เปิด Developer Tools
2. ไปที่ Network tab
3. ดู API calls ไปยัง localhost:3001

#### ตรวจสอบ Console Logs
1. ดู logs จาก mock server ใน terminal
2. ดู logs จาก browser console

### 6. การทดสอบ Error Cases

#### ทดสอบ API Error
1. หยุด mock server
2. ลองสร้าง QR Code
3. ควรเห็น error message

#### ทดสอบ Payment Timeout
1. สร้าง QR Code
2. รอเกิน 5 นาที
3. ควรเห็น timeout error

### 7. การทดสอบ Responsive Design

1. เปิด Developer Tools
2. เปลี่ยนขนาดหน้าจอ
3. ตรวจสอบว่า UI ปรับตัวได้ถูกต้อง

### 8. การทดสอบ State Persistence

1. เข้าสู่ระบบและเลือกวันที่
2. รีเฟรชหน้า
3. ตรวจสอบว่า state ยังคงอยู่

## หมายเหตุ

- Mock server จะจำลองการชำระเงินสำเร็จหลังจาก 2 นาที
- QR Code จะใช้ placeholder URL จาก qrserver.com
- ข้อมูลจะถูกเก็บใน memory ของ mock server (หายเมื่อ restart)
- สำหรับ production ต้องตั้งค่า LINE LIFF จริงและ API endpoints จริง 