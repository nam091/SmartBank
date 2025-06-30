# Hướng dẫn cài đặt MongoDB Community Edition cho Windows

## Bước 1: Tải xuống MongoDB Community Server

1. Truy cập trang web chính thức của MongoDB: https://www.mongodb.com/try/download/community
2. Chọn phiên bản (Version): Latest version (hiện tại là 7.0.x)
3. Chọn nền tảng (Platform): Windows
4. Package: MSI
5. Nhấn Download

## Bước 2: Cài đặt MongoDB

1. Chạy file MSI đã tải xuống
2. Chấp nhận điều khoản giấy phép và nhấn Next
3. Chọn "Complete" installation
4. **Quan trọng**: Đảm bảo chọn tùy chọn "Install MongoDB as a Service" và "Run service as Network Service user"
5. Tiếp tục quá trình cài đặt
6. MongoDB sẽ được cài đặt vào thư mục mặc định: `C:\Program Files\MongoDB\Server\<version>`

## Bước 3: Xác nhận MongoDB đã được cài đặt

1. Mở Command Prompt hoặc PowerShell dưới quyền Administrator
2. Kiểm tra phiên bản MongoDB bằng lệnh:
   ```
   mongod --version
   ```
3. Nếu lệnh hoạt động, MongoDB đã được cài đặt đúng cách

## Bước 4: Thêm MongoDB vào PATH (nếu cần thiết)

Nếu bạn không thấy kết quả phiên bản MongoDB ở bước 3, cần thêm MongoDB vào biến môi trường PATH:

1. Mở "System Properties" (Nhấn phím Windows + Pause Break hoặc vào Control Panel > System)
2. Nhấp vào "Advanced system settings"
3. Nhấp vào nút "Environment Variables"
4. Trong phần "System variables", tìm biến "Path" và nhấp "Edit"
5. Nhấp "New" và thêm đường dẫn đến thư mục bin của MongoDB:
   ```
   C:\Program Files\MongoDB\Server\<version>\bin
   ```
   (thay `<version>` bằng phiên bản bạn đã cài đặt, ví dụ: 7.0)
6. Nhấp "OK" để lưu thay đổi
7. Đóng và mở lại Command Prompt hoặc PowerShell, sau đó kiểm tra lại bằng lệnh `mongod --version`

## Bước 5: Tạo thư mục data

MongoDB cần một thư mục để lưu trữ dữ liệu. Bạn có thể tạo nó thủ công:

1. Tạo thư mục `C:\data\db` bằng lệnh:
   ```
   md C:\data\db
   ```

## Bước 6: Chạy MongoDB

Sau khi cài đặt, MongoDB sẽ tự động chạy như một dịch vụ trong Windows. Bạn có thể:

1. Kiểm tra trạng thái dịch vụ:
   ```
   services.msc
   ```
   Tìm "MongoDB" trong danh sách và đảm bảo nó đang chạy

2. Hoặc khởi động MongoDB thủ công:
   ```
   mongod --dbpath C:\data\db
   ```

## Lựa chọn thay thế: Sử dụng MongoDB Atlas (cloud)

Nếu bạn không muốn cài đặt MongoDB cục bộ, bạn có thể sử dụng MongoDB Atlas - dịch vụ MongoDB trên cloud:

1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo một cluster miễn phí
3. Cấu hình Network Access để cho phép kết nối từ mọi nơi (hoặc IP của bạn)
4. Tạo người dùng database
5. Lấy connection string và dùng nó thay vì `mongodb://localhost:27017`

## Lưu ý cho SmartBank A

Sau khi cài đặt MongoDB, bạn có thể chạy lại các lệnh:

```
npm run mongodb:start
npm run db:init 
npm run api:server
``` 