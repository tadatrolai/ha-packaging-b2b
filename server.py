#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HÀ ANH PACKAGING - Backend Server B2B
Phục vụ API Báo Giá, Đăng Ký Đại Lý, Xuất Bảng Giá Sỉ CSV và Phục vụ Tĩnh
Cổng mặc định: 18090
"""

import http.server
import socketserver
import sqlite3
import json
import csv
import io
import urllib.parse
import os
import sys
import datetime
import mimetypes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "ha_packaging.db")
PORT = int(os.environ.get("PORT", 18090))
HOST = "127.0.0.1"

# Đảm bảo thư mục dữ liệu tồn tại
os.makedirs(DATA_DIR, exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Bảng yêu cầu báo giá
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quote_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_code TEXT UNIQUE,
        product_name TEXT NOT NULL,
        spec_width TEXT,
        spec_length TEXT,
        quantity INTEGER NOT NULL,
        estimated_unit_price INTEGER,
        estimated_total INTEGER,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        region TEXT,
        customer_type TEXT,
        note TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Bảng đăng ký đối tác / đại lý
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partner_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner_code TEXT UNIQUE,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        region TEXT NOT NULL,
        partner_type TEXT,
        monthly_volume TEXT,
        message TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()


PRODUCTS_DATA = [
    {
        "id": "opp-clear-brown",
        "category_id": "opp",
        "category_name": "Băng dính đóng thùng OPP",
        "name": "Băng dính đóng thùng OPP trong / đục",
        "spec_thickness": "43 mic - 50 mic",
        "spec_dimension": "48mm x 100Y",
        "spec_packaging": "6 cuộn/cây",
        "image": "assets/images/product-bopp-tape.png",
        "unit": "cuộn",
        "base_price": 11500,
        "pricing_tiers": [
            {"tier": "Dưới 20 thùng", "price": 11500, "min_qty": 1},
            {"tier": "20 - 50 thùng", "price": 10800, "min_qty": 20},
            {"tier": "Trên 50 thùng", "price": 10200, "min_qty": 51}
        ],
        "description": "Màng OPP dai bền, keo nước acrylic nhập khẩu siêu dính, không đứt ngang khi chạy máy dán thùng tự động."
    },
    {
        "id": "pe-stretch-film",
        "category_id": "pe",
        "category_name": "Màng PE quấn máy / quấn tay",
        "name": "Màng PE quấn pallet công nghiệp",
        "spec_thickness": "17 mic - 23 mic",
        "spec_dimension": "50cm x 250m",
        "spec_packaging": "6 cuộn/thùng",
        "image": "assets/images/product-pe-stretch-film.png",
        "unit": "cuộn",
        "base_price": 115000,
        "pricing_tiers": [
            {"tier": "Dưới 20 cuộn", "price": 115000, "min_qty": 1},
            {"tier": "20 - 50 cuộn", "price": 108000, "min_qty": 20},
            {"tier": "Trên 50 cuộn", "price": 102000, "min_qty": 51}
        ],
        "description": "Nhựa LLDPE nguyên sinh độ co giãn 350%, kháng đâm thủng cực tốt, bảo vệ kiện hàng chống ẩm bụi và va đập."
    },
    {
        "id": "strap-pp-pet",
        "category_id": "strapping",
        "category_name": "Dây đai PP / PET",
        "name": "Dây đai nhựa PP / PET chịu lực",
        "spec_thickness": "Độ dày 0.8mm - 1.0mm",
        "spec_dimension": "12mm - 15mm",
        "spec_packaging": "Chịu lực 150kg+",
        "image": "assets/images/product-pp-pet-strapping.png",
        "unit": "cuộn",
        "base_price": 310000,
        "pricing_tiers": [
            {"tier": "Dưới 10 cuộn", "price": 310000, "min_qty": 1},
            {"tier": "10 - 30 cuộn", "price": 295000, "min_qty": 10},
            {"tier": "Trên 30 cuộn", "price": 280000, "min_qty": 31}
        ],
        "description": "Độ thẳng đều, mép viền nhẵn mịn không xước tay, tương thích cả máy đóng đai bán tự động và máy tự động tốc độ cao."
    },
    {
        "id": "tape-logo-custom",
        "category_id": "logo",
        "category_name": "Băng dính in chữ / logo",
        "name": "Băng dính in chữ / logo thương hiệu",
        "spec_thickness": "50 mic",
        "spec_dimension": "In theo yêu cầu",
        "spec_packaging": "6 cuộn/cây",
        "image": "assets/images/product-printed-logo-tape.png",
        "unit": "cuộn",
        "base_price": 15500,
        "pricing_tiers": [
            {"tier": "Dưới 50 cây", "price": 15500, "min_qty": 1},
            {"tier": "50 - 200 cây", "price": 14200, "min_qty": 50},
            {"tier": "Trên 200 cây", "price": 13000, "min_qty": 201}
        ],
        "description": "Công nghệ in ống đồng sắc nét lên tới 3 màu, chống làm giả, khẳng định dấu ấn nhận diện thương hiệu doanh nghiệp."
    },
    {
        "id": "tape-technical",
        "category_id": "tech",
        "category_name": "Băng dính 2 mặt / giấy / xốp",
        "name": "Băng dính 2 mặt / giấy / xốp EVA",
        "spec_thickness": "Độ bám dính cao",
        "spec_dimension": "Khổ 12mm - 48mm",
        "spec_packaging": "Đủ quy cách công nghiệp",
        "image": "assets/images/product-technical-tapes.png",
        "unit": "cuộn",
        "base_price": 18000,
        "pricing_tiers": [
            {"tier": "Dưới 50 cuộn", "price": 18000, "min_qty": 1},
            {"tier": "50 - 150 cuộn", "price": 16500, "min_qty": 50},
            {"tier": "Trên 150 cuộn", "price": 15000, "min_qty": 151}
        ],
        "description": "Dòng băng dính kỹ thuật chuyên dụng cho xưởng sản xuất điện tử, may mặc, nội thất và dán bưu kiện bưu chính."
    },
    {
        "id": "foam-air-pe",
        "category_id": "opp",
        "category_name": "Vật liệu chống sốc & Định hình",
        "name": "Màng xốp hơi & Xốp PE Foam định hình",
        "spec_thickness": "Gia công túi / tấm",
        "spec_dimension": "Khổ 1.2m - 1.5m",
        "spec_packaging": "Chống sốc linh kiện",
        "image": "assets/images/product-protective-foam.png",
        "unit": "cuộn",
        "base_price": 295000,
        "pricing_tiers": [
            {"tier": "Dưới 10 cuộn", "price": 295000, "min_qty": 1},
            {"tier": "10 - 30 cuộn", "price": 275000, "min_qty": 10},
            {"tier": "Trên 30 cuộn", "price": 260000, "min_qty": 31}
        ],
        "description": "Bảo vệ tối đa linh kiện dễ vỡ, máy móc cơ khí, thiết bị gia dụng và đồ gỗ xuất khẩu tránh trầy xước va đập."
    },
    {
        "id": "accessories-packing",
        "category_id": "strapping",
        "category_name": "Phụ kiện đóng gói trọn gói",
        "name": "Hạt chống ẩm & Phụ kiện đóng đai",
        "spec_thickness": "Cung ứng trọn gói",
        "spec_dimension": "Silica Gel 1g - 100g",
        "spec_packaging": "Bọ sắt / Kìm siết đai",
        "image": "assets/images/product-accessories.png",
        "unit": "gói / bộ",
        "base_price": 45000,
        "pricing_tiers": [
            {"tier": "Đơn hàng lẻ", "price": 45000, "min_qty": 1},
            {"tier": "Từ 20kg hoặc 5 bộ", "price": 38000, "min_qty": 20},
            {"tier": "Đơn hàng dự án KCN", "price": 34000, "min_qty": 100}
        ],
        "description": "Túi hút ẩm Silica Gel chuẩn xuất khẩu cùng đầy đủ kìm siết đai, máy hàn nhiệt, bọ sắt gai giữ đai chịu lực."
    }
]


class PackagingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_json_response({"status": "OK", "service": "HA Industrial Packaging B2B"})
            return

        elif path == "/favicon.ico":
            # Phục vụ favicon SVG inline dạng icon công nghiệp
            svg_favicon = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>""".encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(svg_favicon)))
            self.end_headers()
            self.wfile.write(svg_favicon)
            return

        elif path == "/api/products":
            self.send_json_response(PRODUCTS_DATA)
            return

        elif path == "/api/quote-requests":
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, quote_code, product_name, spec_width, spec_length, quantity,
                           estimated_unit_price, estimated_total, company_name, contact_name,
                           phone, region, customer_type, note, created_at
                    FROM quote_requests ORDER BY id DESC
                """)
                rows = [dict(row) for row in cursor.fetchall()]
                conn.close()
                self.send_json_response({"status": "success", "data": rows})
            except Exception as e:
                self.send_json_response({"status": "error", "message": str(e)}, status_code=500)
            return

        elif path == "/api/partner-registrations":
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, partner_code, company_name, contact_name, phone, email,
                           region, partner_type, monthly_volume, message, created_at
                    FROM partner_registrations ORDER BY id DESC
                """)
                rows = [dict(row) for row in cursor.fetchall()]
                conn.close()
                self.send_json_response({"status": "success", "data": rows})
            except Exception as e:
                self.send_json_response({"status": "error", "message": str(e)}, status_code=500)
            return

        elif path == "/api/price-list-csv":
            self.send_price_list_csv()
            return

        # Phục vụ tệp tĩnh mặc định
        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            self.send_json_response({"status": "error", "message": "Dữ liệu JSON không hợp lệ."}, status_code=400)
            return

        if path == "/api/quote-requests":
            self.handle_quote_request(payload)
            return

        elif path == "/api/partner-registrations":
            self.handle_partner_registration(payload)
            return

        self.send_json_response({"status": "error", "message": "Endpoint không tồn tại."}, status_code=404)

    def handle_quote_request(self, payload):
        # Kiểm tra dữ liệu đầu vào bắt buộc
        contact_name = payload.get("contact_name", "").strip()
        phone = payload.get("phone", "").strip()
        company_name = payload.get("company_name", "").strip()
        product_name = payload.get("product_name", "").strip()

        if not contact_name or not phone or not company_name or not product_name:
            self.send_json_response({
                "status": "error",
                "message": "Vui lòng điền đầy đủ các thông tin bắt buộc: Tên công ty, Người liên hệ, Số điện thoại và Sản phẩm."
            }, status_code=400)
            return

        try:
            conn = get_db()
            cursor = conn.cursor()

            # Tạo mã báo giá định dạng BG-YYYYMMDD-XXX
            today_str = datetime.datetime.now().strftime("%Y%m%d")
            cursor.execute("SELECT COUNT(*) FROM quote_requests WHERE quote_code LIKE ?", (f"BG-{today_str}-%",))
            count = cursor.fetchone()[0] + 1
            quote_code = f"BG-{today_str}-{count:03d}"

            now_iso = datetime.datetime.now().isoformat()
            spec_width = payload.get("spec_width", "")
            spec_length = payload.get("spec_length", "")
            quantity = int(payload.get("quantity", 10))
            estimated_unit_price = int(payload.get("estimated_unit_price", 0))
            estimated_total = int(payload.get("estimated_total", 0))
            region = payload.get("region", "")
            customer_type = payload.get("customer_type", "")
            note = payload.get("note", "")

            cursor.execute("""
                INSERT INTO quote_requests (
                    quote_code, product_name, spec_width, spec_length, quantity,
                    estimated_unit_price, estimated_total, company_name, contact_name,
                    phone, region, customer_type, note, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                quote_code, product_name, spec_width, spec_length, quantity,
                estimated_unit_price, estimated_total, company_name, contact_name,
                phone, region, customer_type, note, now_iso
            ))
            conn.commit()
            last_id = cursor.lastrowid
            conn.close()

            self.send_json_response({
                "status": "success",
                "message": "Gửi yêu cầu báo giá sỉ thành công. Chuyên viên kỹ thuật sẽ gọi lại trong 15 phút.",
                "quote_code": quote_code,
                "data": {
                    "id": last_id,
                    "quote_code": quote_code,
                    "product_name": product_name,
                    "company_name": company_name,
                    "contact_name": contact_name,
                    "phone": phone
                }
            }, status_code=200)
        except Exception as e:
            self.send_json_response({"status": "error", "message": f"Lỗi lưu trữ cơ sở dữ liệu: {str(e)}"}, status_code=500)

    def handle_partner_registration(self, payload):
        company_name = payload.get("company_name", "").strip()
        contact_name = payload.get("contact_name", "").strip()
        phone = payload.get("phone", "").strip()
        region = payload.get("region", "").strip()

        if not company_name or not contact_name or not phone or not region:
            self.send_json_response({
                "status": "error",
                "message": "Vui lòng điền đầy đủ các thông tin bắt buộc: Tên doanh nghiệp/cửa hàng, Người liên hệ, Số điện thoại và Tỉnh thành/Khu công nghiệp."
            }, status_code=400)
            return

        try:
            conn = get_db()
            cursor = conn.cursor()

            today_str = datetime.datetime.now().strftime("%Y%m%d")
            cursor.execute("SELECT COUNT(*) FROM partner_registrations WHERE partner_code LIKE ?", (f"DL-{today_str}-%",))
            count = cursor.fetchone()[0] + 1
            partner_code = f"DL-{today_str}-{count:03d}"

            now_iso = datetime.datetime.now().isoformat()
            email = payload.get("email", "")
            partner_type = payload.get("partner_type", "")
            monthly_volume = payload.get("monthly_volume", "")
            message = payload.get("message", "")

            cursor.execute("""
                INSERT INTO partner_registrations (
                    partner_code, company_name, contact_name, phone, email,
                    region, partner_type, monthly_volume, message, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                partner_code, company_name, contact_name, phone, email,
                region, partner_type, monthly_volume, message, now_iso
            ))
            conn.commit()
            last_id = cursor.lastrowid
            conn.close()

            self.send_json_response({
                "status": "success",
                "message": "Đăng ký đối tác thành công. Giám đốc kinh doanh khu vực sẽ liên hệ tư vấn chính sách đại lý.",
                "partner_code": partner_code,
                "data": {
                    "id": last_id,
                    "partner_code": partner_code,
                    "company_name": company_name,
                    "contact_name": contact_name,
                    "region": region
                }
            }, status_code=200)
        except Exception as e:
            self.send_json_response({"status": "error", "message": f"Lỗi lưu trữ cơ sở dữ liệu: {str(e)}"}, status_code=500)

    def send_price_list_csv(self):
        output = io.StringIO()
        # Ghi BOM UTF-8 để Excel trên Windows hiển thị đúng 100% tiếng Việt
        output.write('\ufeff')
        writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_MINIMAL)

        writer.writerow([
            "Mã sản phẩm",
            "Tên sản phẩm & Quy cách",
            "Độ dày mic / Khổ",
            "Đơn vị tính",
            "Giá sỉ Dưới 20 thùng",
            "Giá sỉ 20-50 thùng",
            "Giá sỉ Trên 50 thùng",
            "Ghi chú đóng gói & Chiết khấu KCN"
        ])

        csv_rows = [
            ["OPP-48-100Y-43M", "Băng dính OPP trong / đục 48mm x 100Y", "43 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Đóng 6 cuộn/cây, 24 cây/thùng - Giao 24h KCN"],
            ["OPP-48-100Y-50M", "Băng dính OPP siêu dính 48mm x 100Y", "50 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Dán thùng nặng trên 25kg, chống bong mép"],
            ["OPP-48-200Y-50M", "Băng dính OPP cuộn lớn 48mm x 200Y", "50 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Cuộn dài tiết kiệm thời gian thay cuộn"],
            ["OPP-60-100Y-50M", "Băng dính OPP bản rộng 60mm x 100Y", "50 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Dán mép thùng carton khổ lớn"],
            ["PE-50-2.8KG-17M", "Màng PE quấn tay 50cm x 2.8kg - Lõi 0.2kg", "17 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Đóng 6 cuộn/thùng, độ kéo dãn 350%"],
            ["PE-50-15KG-23M", "Màng PE quấn máy tự động 50cm x 15kg", "23 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Chuyên dụng máy quấn pallet tự động KCN"],
            ["PP-12-0.8MM-10K", "Dây đai nhựa PP vàng / xanh 12mm x 0.8mm", "0.8mm", "Cuộn 10kg", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Chịu lực trên 150kg, chạy máy bán tự động"],
            ["PET-16-0.9MM-20", "Dây đai thép dẻo PET xanh rêu 16mm x 0.9mm", "0.9mm", "Cuộn 20kg", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Thay thế đai sắt, đai kiện hàng nặng xuất khẩu"],
            ["LOGO-48-100Y-50", "Băng dính in logo thương hiệu 48mm x 100Y", "50 mic", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Miễn phí trục in từ 300 cây, in 1-3 màu"],
            ["TECH-TAPE-2MAT", "Băng dính xốp 2 mặt kỹ thuật 24mm x 10m", "Xốp EVA 1mm", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Dán biển hiệu, phụ kiện công nghiệp"],
            ["FOAM-AIR-1.4M", "Màng xốp hơi bọc hàng 1.4m x 100m", "2 lớp bóng khí", "Cuộn", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Chống va đập linh kiện điện tử, đồ gốm sứ"],
            ["SILICA-GEL-5G", "Hạt hút ẩm Silica Gel túi 5g đóng gói", "Silica hoạt tính", "Kg", "Báo giá gốc theo ngày", "Chiết khấu sỉ bậc 1", "Chiết khấu Đại lý Cấp 1 & KCN", "Bảo quản hàng may mặc, da giày, cơ khí"]
        ]

        for r in csv_rows:
            writer.writerow(r)

        csv_bytes = output.getvalue().encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", 'attachment; filename="Bang_Gia_Si_Dai_Ly_Nha_May_2026.csv"')
        self.send_header("Content-Length", str(len(csv_bytes)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(csv_bytes)

    def send_json_response(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def run_server():
    init_db()
    # Tự động gán MIME types bổ sung
    mimetypes.init()
    mimetypes.add_type("text/css", ".css")
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("image/svg+xml", ".svg")
    mimetypes.add_type("image/png", ".png")

    handler = PackagingHTTPRequestHandler
    with socketserver.TCPServer((HOST, PORT), handler) as httpd:
        httpd.allow_reuse_address = True
        print(f"[OK] HA Industrial Packaging Server is listening at http://{HOST}:{PORT}")
        print(f"[OK] Database initialized at: {DB_PATH}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[INFO] Server shutting down cleanly.")
            httpd.shutdown()


if __name__ == "__main__":
    run_server()
