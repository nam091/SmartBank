# MongoDB Configuration for SmartBank A

## Cấu trúc dữ liệu MongoDB

### 1. User Model
```typescript
{
  userId: string;       // ID người dùng
  name: string;         // Tên người dùng
  email: string;        // Email người dùng (@smartbanka.com)
  accounts: [           // Danh sách tài khoản ngân hàng
    {
      accountId: string; // ID tài khoản
      balance: number;   // Số dư tài khoản
      currency: string;  // Loại tiền tệ (VND)
      type: string;      // Loại tài khoản (Savings, Current)
    }
  ]
}
```

### 2. Transaction Model
```typescript
{
  transactionId: string;         // ID giao dịch
  senderId: string;              // ID người gửi
  senderAccount: string;         // ID tài khoản gửi
  recipientId: string;           // ID người nhận
  recipientAccount: string;      // ID tài khoản nhận
  amount: number;                // Số tiền giao dịch
  currency: string;              // Loại tiền tệ (VND)
  status: string;                // Trạng thái giao dịch (completed, pending, failed)
  type: string;                  // Loại giao dịch (transfer, deposit, withdrawal)
  timestamp: Date;               // Thời gian giao dịch
  description: string;           // Mô tả giao dịch
  referenceId?: string;          // ID tham chiếu
  notes?: string;                // Ghi chú
}
```

## Kết nối MongoDB

Thông tin kết nối MongoDB được cấu hình trong file `src/db/config/db.ts` với các tham số:
- Host: `localhost` (mặc định)
- Port: `27017` (mặc định)
- Database: `smartbank-a` (mặc định)
- Các tùy chọn kết nối MongoDB:
  - `retryWrites`: true
  - `w`: 'majority'

Các tham số này có thể được cấu hình thông qua biến môi trường trong file `.env`.

## Quản lý MongoDB

### Scripts trong package.json

```bash
# Khởi động MongoDB server (lưu dữ liệu trong thư mục mongodb-data)
npm run mongodb:start

# Kiểm tra trạng thái MongoDB
npm run mongodb:status

# Dừng MongoDB server
npm run mongodb:stop

# Khởi tạo dữ liệu mẫu
npm run db:init
```

### Thư mục dữ liệu

- Data: `mongodb-data/` (tạo tự động trong thư mục gốc)
- Logs: `mongodb-logs/mongodb.log` (tạo tự động trong thư mục gốc)

## Các service chính

- **userService**: Quản lý người dùng và tài khoản
  - Tạo người dùng mới
  - Tìm kiếm người dùng
  - Cập nhật số dư tài khoản

- **transactionService**: Quản lý giao dịch
  - Tạo giao dịch mới
  - Tìm kiếm giao dịch
  - Chuyển tiền giữa các tài khoản

## Lưu ý khi làm việc với MongoDB

1. Cần cài đặt MongoDB trên máy tính trước khi chạy ứng dụng
2. Đảm bảo MongoDB đã được khởi động trước khi chạy ứng dụng
3. Sử dụng `npm run db:init` để khởi tạo dữ liệu mẫu sau khi MongoDB đã chạy
4. Script `runMongoDB.js` đã được cập nhật để tương thích với ES modules
5. Đã loại bỏ các tùy chọn không còn được hỗ trợ trong MongoDB Driver v4.0.0+
   - Không còn sử dụng `useNewUrlParser` và `useUnifiedTopology`
6. Đã sửa các schema để tránh index trùng lặp
7. Database được đặt tên theo quy ước: `smartbank-a`
8. Email người dùng theo định dạng: `username@smartbanka.com`

## Timestamp

Cấu hình hoàn thành: `${new Date().toLocaleString()}` 