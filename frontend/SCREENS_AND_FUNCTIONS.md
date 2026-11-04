# Màn hình và chức năng Frontend

Tài liệu này mô tả các màn hình hiện có trong `frontend/src`, cách truy cập và các chức năng chính.

## Route và quyền truy cập

| Route | Màn hình | Quyền | Chức năng |
|---|---|---|---|
| `/` | Feed | Công khai | Xem video dạng cuộn dọc hoặc chuyển sang chế độ lưới; có thể tìm video theo nhãn qua `?tag=...`. |
| `/login` | Đăng nhập | Công khai | Đăng nhập bằng email và mật khẩu. |
| `/register` | Đăng ký | Công khai | Tạo tài khoản người dùng mới. |
| `/upload` | Tải video | Cần đăng nhập | Tải video MP4, thêm caption và theo dõi kết quả phân tích. |
| `/profile` | Hồ sơ | Cần đăng nhập | Xem và quản lý video của mình; moderator có thêm thống kê kiểm duyệt. |
| `/edit-video?video_id=...` | Chỉnh sửa video | Cần đăng nhập, video thuộc tài khoản | Chỉnh caption, quyền hiển thị và quyền bình luận; được mở từ danh sách video trong hồ sơ. |
| `/bookmarks` | Video đã lưu | Cần đăng nhập | Xem, phát và bỏ lưu video. |
| `/moderation` | Kiểm duyệt | Chỉ moderator | Xử lý hàng đợi video, báo cáo và khiếu nại. |
| `/admin` | Quản trị | Chỉ admin | Xem thống kê hệ thống, quản lý tài khoản và nhãn. |
| Route khác | Chuyển hướng | Công khai | Chuyển về `/`. |

Các route nội dung dùng `MainLayout` với thanh điều hướng và thanh tiêu đề. Đăng nhập và đăng ký dùng giao diện xác thực riêng.

## Chi tiết màn hình

### Feed — `FeedPage`

- Mặc định hiển thị video dọc; có nút chuyển giữa **Video dọc** và **Lưới**.
- Feed dọc hỗ trợ phát, thích, theo dõi, lưu, bình luận và báo cáo video theo trạng thái đăng nhập.
- Chế độ lưới hiển thị video, người đăng, lượt xem và nhãn phù hợp; tải thêm video theo trang.
- Khi mở route với `?tag=...`, hiển thị danh sách video theo nhãn và liên kết quay về feed.

### Đăng nhập và đăng ký — `LoginPage`, `RegisterPage`

- Hai màn hình dùng chung `AuthCard` và `AuthContext`.
- Đăng nhập bằng email và mật khẩu; đăng ký bằng tên hiển thị, email và mật khẩu.
- Phiên đăng nhập và thông tin người dùng được lấy từ backend; route được bảo vệ bằng `RequireAuth` hoặc `RequireRole`.

### Tải video — `UploadPage`

- Chọn hoặc kéo thả video MP4, nhập caption và gửi lên backend.
- Hiển thị tiến trình, lỗi tải lên và kết quả phân tích AI sau khi tạo video.
- Kết quả AI được hiển thị trong `AiResultPanel`, gồm trạng thái job, nhãn, độ tin cậy, thông tin model và bản chép lời nếu có.
- Nếu model chưa sẵn sàng, giao diện hiển thị lý do và đánh dấu kết quả mô phỏng.

### Hồ sơ — `ProfilePage`

- Hiển thị tên, email, vai trò và số video theo trạng thái.
- Danh sách video có tên/caption, thời điểm tạo, dung lượng và trạng thái.
- Có thể chọn video để xem kết quả AI, mở chỉnh sửa video hoặc xóa video.
- Hồ sơ moderator có thêm số quyết định đã xử lý, video bị từ chối, báo cáo đang chờ và khiếu nại đã xử lý.

### Chỉnh sửa video — `EditVideoPage`

- Được mở từ nút **Chỉnh sửa** của từng video trong hồ sơ, kèm `video_id`.
- Cập nhật caption, chế độ hiển thị công khai/riêng tư và quyền bình luận.
- Lưu thay đổi rồi quay về hồ sơ.

### Video đã lưu — `BookmarksPage`

- Hiển thị video đã lưu với caption hoặc tên file, người đăng, ngày tạo và lượt xem.
- Phát video trực tiếp hoặc bỏ video khỏi danh sách đã lưu.

### Kiểm duyệt — `ModerationPage`

- Chỉ moderator được vào màn hình và gọi các chức năng kiểm duyệt.
- Có ba mục: hàng đợi video, báo cáo và khiếu nại.
- Moderator có thể duyệt/từ chối video, xác nhận/bác bỏ báo cáo và chấp nhận/giữ quyết định khiếu nại.
- Sau mỗi quyết định, các danh sách được tải lại.

### Quản trị — `AdminPage`

- Chỉ admin được vào màn hình.
- **Thống kê:** số người dùng, video, video chờ duyệt, báo cáo đang chờ; phân bố trạng thái video/job/báo cáo/khiếu nại và khối lượng kiểm duyệt.
- **Quản trị tài khoản:** tìm tài khoản, đổi vai trò và khóa/mở khóa tài khoản.
- **Quản trị nhãn:** thêm nhãn và bật/tắt nhãn.
- Admin không có quyền truy cập màn hình hoặc API xử lý hàng đợi kiểm duyệt.

## Các phần dùng chung

- `src/app/App.jsx`: khai báo route và bảo vệ quyền.
- `src/app/layout/MainLayout.jsx`, `SideNav.jsx`, `TopBar.jsx`: bố cục và điều hướng.
- `src/features/auth/`: đăng nhập, đăng ký và quản lý phiên.
- `src/features/videos/`: feed, upload, tương tác xã hội và kết quả AI.
- `src/features/moderation/`: hàng đợi, báo cáo, khiếu nại và thống kê moderator.
- `src/features/admin/`: thống kê, tài khoản và nhãn quản trị.

## Tài khoản kiểm thử

Thông tin đăng nhập kiểm thử cục bộ nằm trong `TEST_CREDENTIALS.md` ở thư mục gốc. File này được bỏ qua bởi Git vì chứa mật khẩu dạng văn bản; không đưa nội dung tài khoản vào tài liệu được chia sẻ.

**Cập nhật:** 04/11/2026
