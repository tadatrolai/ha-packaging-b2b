# HÀ ANH PACKAGING — Website B2B Sản Xuất Băng Dính & Vật Liệu Đóng Gói

Hệ thống Website B2B Full-Stack hoàn chỉnh dành cho **Nhà máy Sản xuất Băng dính & Vật tư Đóng gói Công nghiệp Hà Anh**, tối ưu cho các Nhà máy Sản xuất tại Khu Công Nghiệp và Hệ thống Đại lý Phân phối trên Toàn Quốc.

---

## 1. Kiến Trúc Hệ Thống

```
g:\software\ha-web\
├── server.py                        # Backend Python 3 Standard Library - Port 18090
├── index.html                       # Giao diện B2B chuẩn công nghiệp Toàn Quốc
├── hermes-verify-ha-web\            # Bộ kiểm thử E2E 14 kịch bản và ảnh chụp nghiệm thu
│   ├── verify_e2e.py
│   └── report.json
├── test_e2e.py                      # Kịch bản Playwright E2E bổ trợ
├── plan-ha-web-b2b.md               # Kế hoạch kiến trúc và ma trận kiểm thử
├── README.md                        # Tài liệu hướng dẫn kỹ thuật
├── data\
│   └── ha_packaging.db              # SQLite Database lưu quote_requests, partner_registrations
├── assets\
│   ├── css\
│   │   └── styles.css               # CSS chuẩn cỡ chữ chẵn, 0 emoji, 0 tràn ngang
│   ├── js\
│   │   └── app.js                   # Tính giá sỉ động, bộ lọc danh mục, tìm kiếm quy cách
│   └── images\                      # 9 bức ảnh thực tế sắc nét, sử dụng duy nhất không trùng lặp
│       ├── hero-warehouse-banner.png
│       ├── product-bopp-tape.png
│       ├── product-pe-stretch-film.png
│       ├── product-pp-pet-strapping.png
│       ├── product-printed-logo-tape.png
│       ├── product-technical-tapes.png
│       ├── product-protective-foam.png
│       ├── product-accessories.png
│       └── factory-production-line.png
└── Bang_Gia_Si_Dai_Ly_Nha_May_2026.csv # Bảng giá sỉ 13 dòng chuẩn UTF-8 BOM Excel
```

---

## 2. Các Tính Năng Nghiệp Vụ Cốt Lõi

### A. Top Header
- **Logo Công nghiệp**: Biểu tượng bánh răng và cuộn băng dính SVG chuẩn màu `#0284C7` & `#D97706`.
- **Thanh Tìm Kiếm Quy Cách**: Lọc tức thì theo độ mic `43 mic`, `50 mic`, khổ rộng `48mm`, `60mm`, chủng loại `PE`, `PP/PET`, `xốp`, `in logo`, có nút xóa nhanh `x`.
- **Cụm Hotline KCN**: `0912.345.678`.
- **Nút CTA Xanh Lá Emerald**: `Tải Bảng Giá Đại Lý` tải trực tiếp tệp CSV chuẩn tiếng Việt Excel có BOM UTF-8 kèm thông báo toast.
- **Thanh Điều Hướng Phụ**: Liên kết nhanh Danh mục sản phẩm, Báo giá nhanh, Năng lực nhà máy, Hợp tác Đại lý & KCN Toàn Quốc, Liên hệ đặt hàng.

### B. Khối Hero 3 Cột
- **Cột Trái - 250px**: Menu danh mục dọc với dải màu chỉ thị và mũi tên SVG:
  - Băng dính đóng thùng OPP
  - Băng dính in chữ / logo
  - Băng dính 2 mặt / giấy / xốp
  - Màng PE quấn máy / quấn tay
  - Dây đai PP / PET
  - Tất cả sản phẩm chủ lực
- **Cột Giữa**: Banner công nghiệp sắc nét `hero-warehouse-banner.png` với tiêu đề in hoa:
  `GIẢI PHÁP ĐÓNG GÓI TOÀN DIỆN CHO DOANH NGHIỆP - GIÁ GỐC TẠI XƯỞNG`.
  Dải cam kết bên dưới: `Giao hàng nhanh tới các KCN & Đại lý Toàn Quốc` • `Cam kết đủ mét, đủ cân, độ dính chuẩn mic` • `Chiết khấu cao cho Nhà máy & Đại lý`.
- **Cột Phải - 320px - Báo Giá Nhanh**:
  - Chọn dòng sản phẩm và khổ rộng.
  - Chọn nhanh thông số màng: `Độ dày 43 mic / 50 mic`, `Băng dính trong / đục`.
  - Chọn quy cách chiều dài / khối lượng.
  - Bộ tăng giảm số lượng thùng.
  - Tự động hiển thị tóm tắt quy cách và chính sách chiết khấu theo số lượng thùng thay vì đơn giá VND cố định do nguyên liệu biến động theo ngày.
  - Nút cam CTA: `Nhận Báo Giá Ngay`.

### C. Lưới Sản Phẩm Kỹ Thuật
- Hàng 1 gồm 4 sản phẩm chủ lực:
  1. `Băng dính đóng thùng OPP` - `43 mic - 50 mic`, `48mm x 100Y`, `6 cuộn/cây`.
  2. `Màng PE quấn pallet công nghiệp` - `17 mic - 23 mic`, `50cm x 250m`, `6 cuộn/thùng`.
  3. `Dây đai nhựa PP / PET chịu lực` - `12mm - 15mm`, `Độ dày 0.8mm - 1.0mm`, `Chịu lực 150kg+`.
  4. `Băng dính in chữ / logo thương hiệu` - `In theo yêu cầu`, `50 mic`, `6 cuộn/cây`.
- Hàng 2 gồm 3 sản phẩm công nghiệp bổ trợ:
  5. `Băng dính 2 mặt / giấy / xốp EVA` - `Độ bám dính cao`, `Khổ 12mm - 48mm`, `Đủ quy cách`.
  6. `Màng xốp hơi & Xốp PE Foam định hình` - `Chống sốc linh kiện`, `Khổ 1.2m - 1.5m`, `Gia công túi / tấm`.
  7. `Hạt chống ẩm & Phụ kiện đóng đai` - `Silica Gel 1g - 100g`, `Bọ sắt / Kìm siết đai`, `Cung ứng trọn gói`.
- Cả 7 thẻ sản phẩm đều hiển thị `Báo giá theo số lượng` thay cho giá tiền cố định. Mỗi thẻ có nút `Báo giá sỉ` để nạp quy cách vào Khung Báo Giá Nhanh và mở ngay Modal.

### D. Năng Lực Nhà Máy & Mạng Lưới Toàn Quốc
- Sử dụng ảnh thực tế dây chuyền sản xuất `factory-production-line.png`.
- 4 thẻ số liệu năng lực: `5.000 m²`, `63 Tỉnh Thành - Mạng lưới cung ứng & đại lý Toàn Quốc`, `35+ Khu Công Nghiệp - Đang cung ứng trực tiếp trên Toàn Quốc`, `24 Giờ`.
- 4 lợi thế cốt lõi khi mua trực tiếp từ nhà máy: Cắt giảm chi phí trung gian, Đảm bảo tiến độ chuỗi cung ứng, Xuất hóa đơn VAT chuẩn chỉnh, Nhận gia công theo yêu cầu riêng.

### E. Hợp Tác Đại Lý & Cung Ứng KCN Toàn Quốc
- 2 cột chính sách rõ ràng:
  - Cung ứng trực tiếp cho Nhà máy Sản xuất: Giá gốc tận xưởng, công nợ 30 - 45 ngày, gửi mẫu thử miễn phí test độ bám dính.
  - Chính sách Tuyển Đại lý tỉnh: Chiết khấu sỉ theo chính sách lũy tiến, bảo hộ khu vực kinh doanh, hỗ trợ vận chuyển ra chành xe hoặc giao thẳng kho đại lý tại 63 tỉnh thành trên toàn quốc: Hà Nội, Bắc Ninh, Hải Phòng, Thanh Hóa, Nghệ An, Đà Nẵng, Bình Dương, Đồng Nai, TP. Hồ Chí Minh.
- Biểu mẫu `Đăng ký Hợp tác Đại lý & Nhận Báo Giá Lô Lớn` kết nối trực tiếp `POST /api/partner-registrations` với danh sách lựa chọn KCN Toàn Quốc.

### F. Modal Yêu Cầu Báo Giá Sỉ & Nhận Mẫu Thử
- Tóm tắt quy cách sản phẩm đã chọn và số lượng yêu cầu mới nhất.
- Kiểm tra lỗi inline trên các trường bắt buộc gồm Tên công ty, Người liên hệ, Số điện thoại.
- Kết nối `POST /api/quote-requests` và trả về mã tiếp nhận báo giá `BG-YYYYMMDD-XXX`.

---

## 3. Danh Sách API Endpoints

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ `200 OK` |
| `GET` | `/api/products` | Danh sách 7 dòng sản phẩm B2B và ma trận quy cách |
| `POST` | `/api/quote-requests` | Tiếp nhận yêu cầu báo giá sỉ, sinh mã `BG-YYYYMMDD-XXX` |
| `GET` | `/api/quote-requests` | Lấy danh sách các yêu cầu báo giá đã lưu |
| `POST` | `/api/partner-registrations` | Tiếp nhận đăng ký đại lý / nhà máy, sinh mã `DL-YYYYMMDD-XXX` |
| `GET` | `/api/partner-registrations` | Lấy danh sách các hồ sơ đối tác đã lưu |
| `GET` | `/api/price-list-csv` | Tải về bảng giá sỉ file CSV 13 dòng có BOM UTF-8 |
| `GET` | `/` | Phục vụ trang chủ `index.html` và tài nguyên tĩnh |

---

## 4. Hướng Dẫn Vận Hành & Kiểm Thử

### Khởi chạy máy chủ:
```powershell
python g:\software\ha-web\server.py
```
Máy chủ lắng nghe tại: `http://127.0.0.1:18090`

### Chạy kiểm thử tự động E2E:
```powershell
python g:\software\ha-web\hermes-verify-ha-web\verify_e2e.py
```
Kết quả kiểm thử tự động xác nhận 14 kịch bản kiểm thử:
- 100% các thẻ ảnh hiển thị duy nhất.
- 0 lỗi tràn ngang trên cả Desktop 1920x1080, Laptop 1366x768, Mobile 390x844.
- 0 console error, 0 page error.
