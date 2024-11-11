# Dự án nghiên cứu khoa học (Project W)

Đây là ứng dụng đăng nhập và xử lý thông tin người dùng trên database [PostgreSQL](https://www.postgresql.org/about/) và xác thực bằng [JWT](https://jwt.io/introduction). Ngoài ra, ứng dụng lưu trữ file trên [AWS](https://aws.amazon.com/about-aws/) và sử dụng [Vue](https://vuejs.org/guide/introduction) là giao diện để đăng nhập.

## Tính năng

### Đăng nhập

- [x] Đăng nhập dành cho sinh viên Đại học

> /api/v1/login, /api/v1/student/login

| Miền     | Kiểu dữ liệu | Bắt buộc       |
| -------- | ------------ | -------------- |
| email    | string       | :green_circle: |
| password | string       | :green_circle: |

- [x] Yêu cầu signature thông qua console

> /api/v1/console

- [x] Yêu cầu signature thông qua Email

> /api/v1/change

| Miền  | Kiểu dữ liệu | Bắt buộc       |
| ----- | ------------ | -------------- |
| email | string       | :green_circle: |

- [x] Gửi mật khẩu mới

> /api/v1/change/:signature

| Miền     | Kiểu dữ liệu | Bắt buộc       |
| -------- | ------------ | -------------- |
| password | string       | :green_circle: |

- [x] Đăng ký doanh nghiệp

> /api/v1/enterprise/assign

| Miền        | Kiểu dữ liệu | Bắt buộc       |
| ----------- | ------------ | -------------- |
| email       | string       | :green_circle: |
| industry    | string       | :green_circle: |
| name        | string       | :green_circle: |
| description | string       | :green_circle: |
| signature   | string       | :green_circle: |
| avatar      | File         | :red_circle:   |

- [x] Yêu cầu signature dành cho nhân viên doanh nghiệp

> /api/v1/employee/hook

| Miền           | Kiểu dữ liệu | Bắt buộc       |
| -------------- | ------------ | -------------- |
| enterpriseName | string       | :green_circle: |

- [x] Đăng ký nhân viên của doanh nghiệp

> /api/v1/employee/signup

| Miền      | Kiểu dữ liệu         | Bắt buộc       |
| --------- | -------------------- | -------------- |
| email     | string               | :green_circle: |
| password  | string               | :green_circle: |
| name      | string               | :green_circle: |
| position  | EmployeePosition[^1] | :green_circle: |
| signature | string               | :green_circle: |
| avatar    | File                 | :red_circle:   |

- [x] Đăng ký tài khoản khoa của Đại học

> /api/v1/faculty/assign

| Miền       | Kiểu dữ liệu | Bắt buộc       |
| ---------- | ------------ | -------------- |
| email      | string       | :green_circle: |
| department | string       | :green_circle: |
| name       | string       | :green_circle: |
| password   | string       | :green_circle: |
| signature  | string       | :green_circle: |
| avatar     | File         | :red_circle:   |

- [ ] Giới hạn thời gian tái gửi mail xác thực mật khẩu

### Thông báo

- [ ] Tạo thông báo
- [ ] Đánh dấu đã xem thông báo

### Sự kiện

- [ ] Tạo sự kiện
- [ ] Cập nhật trạng thái sự kiện
- [ ] Thêm tag cho sự kiện
- [ ] Cho người dùng tham gia sự kiện
- [ ] Cập nhật thông tin người tham gia sự kiện

### Trang admin (quản lý database)

- [ ] Cập nhật, thêm, xóa và hiển thị thực thể
- [ ] Hiển thị biểu đồ theo dữ liệu yêu cầu

---

[^1]: [Kiểu enum EmployeePosition](https://524h0003.github.io/Project_W/miscellaneous/enumerations.html#EmployeePosition)
