# Cập nhật privacy Aster Strike — 30/10/2026

Yêu cầu chủ dự án: cập nhật policy theo các thay đổi của Galaxy Shooter, gồm co-op. Đây là lần chỉnh nội dung được chủ dự án yêu cầu sau đợt chỉ dịch ngày 29/10; không đổi URL app đang dùng.

- URL gốc: https://game.lamian.dev/aster-privacy-policy.html
- Ngày hiệu lực mới: `2026-10-30`.
- Cập nhật đồng thời: English, Tiếng Việt, 简体中文, Français, ไทย, 日本語, 한국어.
- Giữ nội dung các game khác, terms, thông tin liên hệ và ngưỡng tuổi 16 của Aster.
- Bản trước: [archive/aster-privacy-policy-2026-10-16.html](archive/aster-privacy-policy-2026-10-16.html). SHA trước và sau nằm trong `docs/ui-review/legacy-policy-manifest.json`; verifier bảo vệ cả bản mới và archive.

## Nội dung bổ sung

1. Mở Friends tạo Firebase Auth account, dùng Play Games khi có hoặc anonymous; anonymous không tự liên kết và có thể mất truy cập sau cài lại.
2. Dữ liệu hồ sơ, tên/avatar có sẵn, mã bạn bè, UID, mã xóa riêng, snapshot tàu/skin/vũ khí, timestamps, bạn bè/lời mời/chặn/báo cáo, thưởng và bộ đếm chống lạm dụng.
3. Ai xem được tên/avatar/ID; bạn đã chấp nhận nhận snapshot hỗ trợ AI bất đồng bộ. Không mô tả thành co-op thời gian thực. Mã xóa không nằm trong hồ sơ chia sẻ.
4. Firestore/Cloud Functions/Auth là nơi xử lý dữ liệu dịch vụ. Bỏ phát biểu sai “chỉ gửi dữ liệu tổng hợp/ẩn danh”.
5. Xác minh mua hàng: purchase token, product/order/install/account identifiers, thời gian/trạng thái/hoàn tiền; Google Play xử lý thanh toán, không nhận chi tiết thẻ.
6. AdMob: IP/vị trí gần đúng suy ra từ IP, IDs, tương tác và diagnostics. Analytics/Crashlytics phụ thuộc Share usage data; tắt không tắt xử lý cần thiết cho ads/IAP/Friends.
7. Xóa trong app ngay khi thành công; [trang yêu cầu xóa](https://aster.lamian.dev/delete-account) hoạt động HTTP 200 và chuyển tới Cloud Function. Qua web chờ 30 ngày, kể cả mã xóa đúng; hủy được trong Friends. Chỉ GET để xác minh, không tạo yêu cầu xóa thật.
8. Bản ghi yêu cầu gồm optional email/note, dùng giới hạn IP; xóa 90 ngày sau xử lý. Không công bố thời hạn tự xóa tài khoản xã hội chưa được triển khai.
9. Nêu rõ phần xóa và giữ: không xóa save/local progress/IAP; reward IDs và block lists có thể còn UID cũ; cache bên bạn bè có thể tồn tại tới khi refresh. Không gọi các UID còn lại là đã ẩn danh hoàn toàn.

## Nguồn đối chiếu

Mã hiện tại trong workspace game `/Users/dungnt/Works/dz/godot_games/galaxy-shooter`:

- `docs/COOP_FRIENDS_SPEC.md`: phần kết quả và console cập nhật 30/10 cho biết server đã deploy; đầu tài liệu/README còn dòng trạng thái cũ, không dùng làm kết luận duy nhất.
- `docs/ACCOUNT_DELETION_SPEC.md`: quyết định 30 ngày, 90 ngày và bảng Data safety đã lưu; trạng thái gửi duyệt riêng với website.
- `scripts/core/social/http_social_backend.gd`: anonymous/custom token, cache và refresh token.
- `server/functions/src/social/{handler,rules,deletion}.ts`: trường dữ liệu, lookup visibility, friends snapshot, xóa, retention, danh sách ngoại lệ.
- `server/functions/src/types.ts`: trường purchase verification.
- `scripts/core/telemetry.gd`: consent và Firebase analytics/crash collection.

Nguồn nhà cung cấp:

- [Firebase privacy](https://firebase.google.com/support/privacy)
- [AdMob data disclosure](https://developers.google.com/admob/android/privacy/play-data-disclosure)
- [Google Play account deletion](https://support.google.com/googleplay/android-developer/answer/13327111)

## Xác minh

`npm run sync:policies` sinh đủ 49 tài liệu; `npm run verify` kiểm hash các source, archive, URL của 7 game, 78 ảnh, 7 ngôn ngữ và tất cả tài liệu. Aster có kiểm riêng ngày hiệu lực mới, link xóa, thời gian 30/90 ngày và các dịch vụ Firebase. Chỉ chỉnh website; không thay cấu hình Play Console, code game hay chạy xóa tài khoản thật.
