# Dự án nghiên cứu khoa học (Project W)

Đây là ứng dụng đăng nhập và xử lý thông tin người dùng trên database [PostgreSQL](https://www.postgresql.org/about/) và xác thực bằng [JWT](https://jwt.io/introduction). Ngoài ra, ứng dụng lưu trữ file trên [AWS](https://aws.amazon.com/about-aws/) và sử dụng [Vue](https://vuejs.org/guide/introduction) là giao diện để đăng nhập.

## Tính năng

### Đăng nhập

- [x] Đăng nhập (dành cho sinh viên Đại học)

> /api/v1/login

| Miền     | Kiểu dữ liệu | Bắt buộc       |
| -------- | ------------ | -------------- |
| email    | string       | :green_circle: |
| password | string       | :green_circle: |

- [x] Yêu cầu signature thông qua console

> /api/v1/console

- [x] Yêu cầu signature thông qua Email

> /api/v1/change-password

| Miền  | Kiểu dữ liệu | Bắt buộc       |
| ----- | ------------ | -------------- |
| email | string       | :green_circle: |

- [x] Gửi mật khẩu mới

> /api/v1/change-password/:signature

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

| Miền           | Kiểu dữ liệu         | Bắt buộc       |
| -------------- | -------------------- | -------------- |
| enterpriseName | string               | :green_circle: |
| email          | string               | :green_circle: |
| position       | EmployeePosition[^1] | :green_circle: |
| name           | string               | :green_circle: |

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

- [x] Giới hạn thời gian tái gửi mail xác thực mật khẩu

### Thông báo

- [x] Tạo thông báo
> [/graphql assignNotification](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L107)

- [x] Cập nhật thông báo
> [/graphql updateNotification](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L115)

- [x] Gửi thông báo cho người dùng
> [/graphql assignReciever(Many)](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L109-L110)

- [x] Đánh dấu đã xem thông báo
> [/graphql readNotification(Many)](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L112-L113)

### Sự kiện

- [x] Tạo sự kiện
> [/graphql assignEvent](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L105)

- [x] Cập nhật trạng thái sự kiện
> [/graphql updateEvent](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L114)

- [x] Tạo tag
> [/graphql assignEventTag](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L106)

- [x] Thêm tag cho sự kiện
> [/graphql attachEventTag](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L111)

- [x] Cho người dùng tham gia sự kiện
> [/graphql assignParticipator](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L108)

- [x] Cập nhật thông tin người tham gia sự kiện
> [/graphql updateParticipator](https://github.com/524H0003/Project_W/blob/master/src/schema.gql#L116)

### Trang admin (quản lý database)

- [ ] Cập nhật, thêm, xóa và hiển thị thực thể

---

[^1]: [Kiểu enum EmployeePosition](https://524h0003.github.io/Project_W/miscellaneous/enumerations.html#EmployeePosition)

[^2]: [Kiểu enum EventStatus](https://524h0003.github.io/Project_W/miscellaneous/enumerations.html#EventStatus)

[^3]: [Kiểu enum EventType](https://524h0003.github.io/Project_W/miscellaneous/enumerations.html#EventType)
