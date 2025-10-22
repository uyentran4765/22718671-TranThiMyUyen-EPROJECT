# 🐇 Case Study: Microservices với RabbitMQ, API Gateway & JWT

Dự án minh họa cách xây dựng hệ thống **Microservices** trong Node.js, sử dụng:
- 🐳 **Docker** để container hóa  
- 🐇 **RabbitMQ** để giao tiếp giữa các service  
- 🔐 **JWT** để xác thực người dùng  
- 🚪 **API Gateway** để định tuyến yêu cầu  

---

## ⚙️ 1. Cài đặt RabbitMQ trên Docker

Sử dụng lệnh này để khởi chạy RabbitMQ:

```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```

> 🖥️ Giao diện quản lý: [http://localhost:15672](http://localhost:15672)  
> 👤 Tài khoản mặc định: `guest` / `guest`

📸 *Ảnh minh họa:*  
![RabbitMQ Setup](public/1.png)

---

## 🌐 2. Cấu hình lại API Gateway

Cập nhật đường dẫn định tuyến để API Gateway điều hướng đúng đến các service (User, Product, Order,...)

📸 *Ảnh minh họa:*  
![Chỉnh đường dẫn Gateway](public/2_chinh_duong_dan.png)

---

## 🔑 3. Thêm thông tin đăng nhập & ký JWT

Cập nhật phần logic đăng nhập để tạo **token JWT** giúp xác thực người dùng.

📸 *Ảnh minh họa:*  
![Thêm JWT Sign](public/3.png)

---

## 🧩 4. Bổ sung các đoạn code phục vụ cho Case Study

Thêm các chức năng hỗ trợ liên quan đến microservices, giao tiếp RabbitMQ, v.v.

📸 *Ảnh minh họa:*  
![Thêm Code Case Study](public/4_them_cac_code_phuc_vu_cho_case_study.png)

---

## 🧪 5. Kiểm thử API với Postman

### 🧍‍♂️ Đăng ký tài khoản
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`

📸  
![Test Register API](public/5_register_post_man.png)

---

### 🔐 Đăng nhập tài khoản
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`

📸  
![Test Login API](public/6_login_post_man.png)

---

### 🛒 Thêm sản phẩm
- **Method:** `POST`
- **Endpoint:** `/api/products`

📸  
![Test Add Product](public/7_add_product.png)

---

### 📦 Xem danh sách sản phẩm
- **Method:** `GET`
- **Endpoint:** `/api/products`

📸  
![Get All Products](public/8_get_more_product.png)

---

### 🧾 Tạo đơn hàng
- **Method:** `POST`
- **Endpoint:** `/api/orders`

📸  
![Create Order](public/9_create_order.png)

---

## 🚀 6. Kết luận

Hệ thống đã được thiết lập thành công:
- RabbitMQ hoạt động để giao tiếp giữa các service  
- JWT đảm bảo xác thực người dùng  
- API Gateway định tuyến chính xác  
- Tất cả API hoạt động ổn định qua Postman ✅

---

🧑‍💻 **Tác giả:** TRẦN THỊ MỸ UYÊN
📅 **Cập nhật lần cuối:** 2025-10-09
