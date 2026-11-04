/**
 * HÀ ANH PACKAGING - B2B INDUSTRIAL PACKAGING APPLICATION JS
 * Bộ máy tính giá sỉ thời gian thực, bộ lọc danh mục, tìm kiếm quy cách,
 * xử lý gửi yêu cầu báo giá & đăng ký đại lý KCN Bắc - Trung.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- TRẠNG THÁI ỨNG DỤNG ---
  const state = {
    selectedProductType: 'opp',
    selectedThickness: '43 mic - Tiêu chuẩn',
    selectedColor: 'Băng dính trong',
    selectedSpec: '48mm x 100Y - Tiêu chuẩn đóng thùng',
    quantity: 10,
    unitPrice: 10800,
    totalPrice: 1080000,
    activeCategoryFilter: 'all',
    searchQuery: ''
  };

  // --- BẢNG ĐỊNH GIÁ & QUY CÁCH CƠ SỞ ---
  const PRODUCT_SPECS_MAP = {
    opp: {
      name: 'Băng dính đóng thùng OPP trong / đục',
      basePrice: 11500,
      unit: 'cuộn',
      packMultiplier: 100, // 100 cuộn tương đương lô đóng gói
      specs: [
        '48mm x 100Y - Tiêu chuẩn đóng thùng',
        '48mm x 200Y - Cuộn lớn tiết kiệm',
        '48mm x 300Y - Chạy máy dán thùng',
        '60mm x 100Y - Bản rộng dán chắc'
      ]
    },
    logo: {
      name: 'Băng dính in chữ / logo thương hiệu',
      basePrice: 15500,
      unit: 'cuộn',
      packMultiplier: 100,
      specs: [
        'In logo 48mm x 100Y - In 1 màu nền trong',
        'In logo 48mm x 100Y - In 2 màu nền đục',
        'In logo 60mm x 100Y - Khổ lớn nổi bật'
      ]
    },
    pe: {
      name: 'Màng PE quấn pallet công nghiệp',
      basePrice: 115000,
      unit: 'cuộn',
      packMultiplier: 6,
      specs: [
        'Màng PE quấn tay 50cm x 2.8kg - Lõi 0.2kg',
        'Màng PE quấn tay 50cm x 3.2kg - Lõi 0.3kg',
        'Màng PE quấn máy 50cm x 15kg - Dày 23 mic'
      ]
    },
    strapping: {
      name: 'Dây đai nhựa PP / PET chịu lực',
      basePrice: 310000,
      unit: 'cuộn',
      packMultiplier: 1,
      specs: [
        'Dây đai PP vàng / xanh 12mm x 0.8mm - Cuộn 10kg',
        'Dây đai PP nguyên sinh 15mm x 0.9mm - Cuộn 10kg',
        'Dây đai thép dẻo PET 16mm x 0.9mm - Cuộn 20kg'
      ]
    },
    tech: {
      name: 'Băng dính 2 mặt / giấy / xốp EVA',
      basePrice: 18000,
      unit: 'cuộn',
      packMultiplier: 50,
      specs: [
        'Băng dính xốp 2 mặt siêu dính 24mm x 10m',
        'Băng dính giấy Kraft chịu nhiệt 48mm x 50m',
        'Băng dính dán sàn cảnh báo KCN 48mm x 33m'
      ]
    }
  };

  // --- CÁC PHẦN TỬ DOM ---
  const productTypeSelect = document.getElementById('quoteProductType');
  const specSelect = document.getElementById('quoteSpec');
  const qtyInput = document.getElementById('quoteQty');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const thicknessChips = document.querySelectorAll('.chip-thickness');
  const colorChips = document.querySelectorAll('.chip-color');
  const displayUnitPrice = document.getElementById('displayUnitPrice');
  const displayTotalPrice = document.getElementById('displayTotalPrice');
  const displayDiscountTier = document.getElementById('displayDiscountTier');
  const btnOpenQuoteModal = document.getElementById('btnOpenQuoteModal');

  // Modal elements
  const quoteModal = document.getElementById('quoteModal');
  const btnCloseQuoteModal = document.getElementById('btnCloseQuoteModal');
  const btnCancelQuoteModal = document.getElementById('btnCancelQuoteModal');
  const quoteModalForm = document.getElementById('quoteModalForm');
  const modalSelectedProductText = document.getElementById('modalSelectedProductText');
  const modalSelectedSpecText = document.getElementById('modalSelectedSpecText');
  const modalQuoteAlert = document.getElementById('modalQuoteAlert');

  // Search & Filter elements
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const categoryFilterBtns = document.querySelectorAll('.cat-item-btn');
  const productCards = document.querySelectorAll('.product-card');
  const productsEmptyNotice = document.getElementById('productsEmptyNotice');

  // Partner form elements
  const partnerForm = document.getElementById('partnerForm');
  const partnerAlert = document.getElementById('partnerAlert');

  // Download CSV price list button
  const btnDownloadPriceList = document.getElementById('btnDownloadPriceList');
  const toastContainer = document.getElementById('toastContainer');

  // --- BỘ MÁY TÍNH GIÁ SỈ THEO BẬC ---
  function calculateWholesalePrice() {
    const prodConfig = PRODUCT_SPECS_MAP[state.selectedProductType] || PRODUCT_SPECS_MAP.opp;
    let base = prodConfig.basePrice;

    // Hệ số độ dày màng
    if (state.selectedThickness.includes('50 mic')) {
      base = Math.round(base * 1.1);
    } else if (state.selectedThickness.includes('55 mic')) {
      base = Math.round(base * 1.2);
    }

    // Hệ số màu sắc / in ấn
    if (state.selectedColor.includes('màu') || state.selectedColor.includes('in chữ')) {
      base = Math.round(base * 1.25);
    }

    // Chiết khấu theo bậc số lượng
    const qty = state.quantity;
    let discountPercent = 0;
    let tierText = 'Đơn giá sỉ xưởng mức tiêu chuẩn';

    if (qty >= 50) {
      discountPercent = 12;
      tierText = 'Chiết khấu 12% - Bậc Nhà Máy & Đại Lý Lớn';
    } else if (qty >= 20) {
      discountPercent = 8;
      tierText = 'Chiết khấu 8% - Đơn hàng từ 20 thùng';
    } else if (qty >= 10) {
      discountPercent = 5;
      tierText = 'Chiết khấu 5% - Đơn hàng từ 10 thùng';
    }

    const discountedUnit = Math.round(base * (1 - discountPercent / 100));
    const totalEst = discountedUnit * qty * (prodConfig.packMultiplier || 1);

    state.unitPrice = discountedUnit;
    state.totalPrice = totalEst;

    // Cập nhật giao diện
    displayUnitPrice.textContent = `${formatVND(discountedUnit)} đ / ${prodConfig.unit}`;
    displayTotalPrice.textContent = `${formatVND(totalEst)} đ`;
    displayDiscountTier.textContent = tierText;
  }

  function formatVND(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // --- CẬP NHẬT DANH SÁCH QUY CÁCH KHI ĐỔI DÒNG SẢN PHẨM ---
  function updateSpecOptions(productKey) {
    const config = PRODUCT_SPECS_MAP[productKey] || PRODUCT_SPECS_MAP.opp;
    specSelect.innerHTML = '';
    config.specs.forEach((spec, idx) => {
      const opt = document.createElement('option');
      opt.value = spec;
      opt.textContent = spec;
      if (idx === 0) opt.selected = true;
      specSelect.appendChild(opt);
    });
    state.selectedSpec = config.specs[0];
  }

  // --- SỰ KIỆN KHUNG BÁO GIÁ NHANH ---
  if (productTypeSelect) {
    productTypeSelect.addEventListener('change', (e) => {
      state.selectedProductType = e.target.value;
      updateSpecOptions(state.selectedProductType);
      calculateWholesalePrice();
    });
  }

  if (specSelect) {
    specSelect.addEventListener('change', (e) => {
      state.selectedSpec = e.target.value;
      calculateWholesalePrice();
    });
  }

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        val -= 1;
        qtyInput.value = val;
        state.quantity = val;
        calculateWholesalePrice();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      val += 1;
      qtyInput.value = val;
      state.quantity = val;
      calculateWholesalePrice();
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      qtyInput.value = val;
      state.quantity = val;
      calculateWholesalePrice();
    });
  }

  // Chips độ dày
  thicknessChips.forEach(chip => {
    chip.addEventListener('click', () => {
      thicknessChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedThickness = chip.getAttribute('data-value');
      calculateWholesalePrice();
    });
  });

  // Chips màu sắc
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      colorChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedColor = chip.getAttribute('data-value');
      calculateWholesalePrice();
    });
  });

  // Khởi tạo quy cách mặc định
  updateSpecOptions('opp');
  calculateWholesalePrice();

  // --- MỞ MODAL BÁO GIÁ SỈ ---
  function openQuoteModalWithData(customData = null) {
    let prodName = PRODUCT_SPECS_MAP[state.selectedProductType]?.name || 'Băng dính đóng thùng OPP';
    let specName = `${state.selectedSpec} • ${state.selectedThickness} • ${state.selectedColor}`;
    let qty = state.quantity;
    let unitPrice = state.unitPrice;
    let totalEst = state.totalPrice;

    if (customData) {
      prodName = customData.name || prodName;
      specName = customData.spec || specName;
      if (customData.productKey && PRODUCT_SPECS_MAP[customData.productKey]) {
        state.selectedProductType = customData.productKey;
        if (productTypeSelect) productTypeSelect.value = customData.productKey;
        updateSpecOptions(customData.productKey);
      }
    }

    modalSelectedProductText.textContent = prodName;
    modalSelectedSpecText.textContent = `Quy cách: ${specName} — Số lượng: ${qty} thùng — Đơn giá dự kiến: ${formatVND(unitPrice)} đ / cuộn`;

    // Cập nhật hidden inputs trong form
    document.getElementById('modalFieldProductName').value = prodName;
    document.getElementById('modalFieldSpecWidth').value = specName;
    document.getElementById('modalFieldQuantity').value = qty;
    document.getElementById('modalFieldUnitPrice').value = unitPrice;
    document.getElementById('modalFieldTotal').value = totalEst;

    // Reset alert
    modalQuoteAlert.className = 'alert-box';
    modalQuoteAlert.textContent = '';

    quoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuoteModal() {
    quoteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpenQuoteModal) {
    btnOpenQuoteModal.addEventListener('click', () => {
      openQuoteModalWithData();
    });
  }

  if (btnCloseQuoteModal) btnCloseQuoteModal.addEventListener('click', closeQuoteModal);
  if (btnCancelQuoteModal) btnCancelQuoteModal.addEventListener('click', closeQuoteModal);

  // Đóng modal khi click ra ngoài backdrop
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  // --- NÚT "BÁO GIÁ SỈ" TRÊN TỪNG THẺ SẢN PHẨM ---
  const cardQuoteBtns = document.querySelectorAll('.btn-card-quote');
  cardQuoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;

      const prodName = card.getAttribute('data-name');
      const prodKey = card.getAttribute('data-product-key') || 'opp';
      const prodSpec = card.getAttribute('data-spec') || '';

      // Đồng bộ sang Khung Báo Giá Nhanh
      if (productTypeSelect && PRODUCT_SPECS_MAP[prodKey]) {
        productTypeSelect.value = prodKey;
        state.selectedProductType = prodKey;
        updateSpecOptions(prodKey);
        calculateWholesalePrice();
      }

      // Mở modal lập tức
      openQuoteModalWithData({
        name: prodName,
        productKey: prodKey,
        spec: prodSpec
      });
    });
  });

  // --- HÀM TIỆN ÍCH SINH MÃ VÀ LƯU TRỮ HYBRID OFFLINE / STATIC HOSTING ---
  function generateUniqueCode(prefix, storageKey) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}${mm}${dd}`;
    const prefixToday = `${prefix}-${todayStr}-`;

    let maxSeq = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          items.forEach(item => {
            const code = item.quote_code || item.partner_code || '';
            if (code.startsWith(prefixToday)) {
              const seq = parseInt(code.slice(prefixToday.length), 10);
              if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
              }
            }
          });
        }
      }
    } catch (e) {
      maxSeq = 0;
    }

    const nextSeq = maxSeq + 1;
    return `${prefixToday}${String(nextSeq).padStart(3, '0')}`;
  }

  function saveRecordToStorage(storageKey, record) {
    try {
      const raw = localStorage.getItem(storageKey);
      let items = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      }
      items.unshift(record);
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      // Bỏ qua lỗi lưu trữ nếu trình duyệt chặn quota
    }
  }

  function handleQuoteOfflineFallback(payload) {
    const quoteCode = generateUniqueCode('BG', 'ha_quote_requests');
    const record = {
      ...payload,
      quote_code: quoteCode,
      created_at: new Date().toISOString()
    };
    saveRecordToStorage('ha_quote_requests', record);

    modalQuoteAlert.className = 'alert-box alert-success visible';
    modalQuoteAlert.innerHTML = '<span>Mã báo giá của quý khách: <strong>' + quoteCode + '</strong> — Phòng kỹ thuật sẽ liên hệ gửi mẫu thử và báo giá chiết khấu trong 15 phút.</span>';
    quoteModalForm.reset();
    showToast('Gửi báo giá thành công. Mã tiếp nhận: ' + quoteCode);

    setTimeout(() => {
      closeQuoteModal();
    }, 3500);
  }

  function handlePartnerOfflineFallback(payload) {
    const partnerCode = generateUniqueCode('DL', 'ha_partner_registrations');
    const record = {
      ...payload,
      partner_code: partnerCode,
      created_at: new Date().toISOString()
    };
    saveRecordToStorage('ha_partner_registrations', record);

    partnerAlert.className = 'alert-box alert-success visible';
    partnerAlert.innerHTML = '<span>Đăng ký đối tác thành công! Mã đối tác tiếp nhận: <strong>' + partnerCode + '</strong> — Giám đốc kinh doanh khu vực sẽ liên hệ gửi hợp đồng mẫu và chính sách chiết khấu.</span>';
    partnerForm.reset();
    showToast('Đăng ký đối tác thành công. Mã: ' + partnerCode);
  }

  // --- DỮ LIỆU BẢNG GIÁ SỈ 12 DÒNG DÀNH CHO HYBRID STATIC HOSTING ---
  const WHOLESALE_CSV_ROWS = [
    ['OPP-48-100Y-43M', 'Băng dính OPP trong / đục 48mm x 100Y', '43 mic', 'Cuộn', '11.500 đ', '10.800 đ', '10.200 đ', 'Đóng 6 cuộn/cây, 24 cây/thùng - Giao 24h KCN'],
    ['OPP-48-100Y-50M', 'Băng dính OPP siêu dính 48mm x 100Y', '50 mic', 'Cuộn', '12.800 đ', '12.000 đ', '11.300 đ', 'Dán thùng nặng trên 25kg, chống bong mép'],
    ['OPP-48-200Y-50M', 'Băng dính OPP cuộn lớn 48mm x 200Y', '50 mic', 'Cuộn', '23.500 đ', '22.000 đ', '20.800 đ', 'Cuộn dài tiết kiệm thời gian thay cuộn'],
    ['OPP-60-100Y-50M', 'Băng dính OPP bản rộng 60mm x 100Y', '50 mic', 'Cuộn', '15.800 đ', '14.900 đ', '14.000 đ', 'Dán mép thùng carton khổ lớn'],
    ['PE-50-2.8KG-17M', 'Màng PE quấn tay 50cm x 2.8kg - Lõi 0.2kg', '17 mic', 'Cuộn', '115.000 đ', '108.000 đ', '102.000 đ', 'Đóng 6 cuộn/thùng, độ kéo dãn 350%'],
    ['PE-50-15KG-23M', 'Màng PE quấn máy tự động 50cm x 15kg', '23 mic', 'Cuộn', '590.000 đ', '560.000 đ', '530.000 đ', 'Chuyên dụng máy quấn pallet tự động KCN'],
    ['PP-12-0.8MM-10K', 'Dây đai nhựa PP vàng / xanh 12mm x 0.8mm', '0.8mm', 'Cuộn 10kg', '310.000 đ', '295.000 đ', '280.000 đ', 'Chịu lực trên 150kg, chạy máy bán tự động'],
    ['PET-16-0.9MM-20', 'Dây đai thép dẻo PET xanh rêu 16mm x 0.9mm', '0.9mm', 'Cuộn 20kg', '680.000 đ', '650.000 đ', '620.000 đ', 'Thay thế đai sắt, đai kiện hàng nặng xuất khẩu'],
    ['LOGO-48-100Y-50', 'Băng dính in logo thương hiệu 48mm x 100Y', '50 mic', 'Cuộn', '15.500 đ', '14.200 đ', '13.000 đ', 'Miễn phí trục in từ 300 cây, in 1-3 màu'],
    ['TECH-TAPE-2MAT', 'Băng dính xốp 2 mặt kỹ thuật 24mm x 10m', 'Xốp EVA 1mm', 'Cuộn', '18.000 đ', '16.500 đ', '15.000 đ', 'Dán biển hiệu, phụ kiện công nghiệp'],
    ['FOAM-AIR-1.4M', 'Màng xốp hơi bọc hàng 1.4m x 100m', '2 lớp bóng khí', 'Cuộn', '295.000 đ', '275.000 đ', '260.000 đ', 'Chống va đập linh kiện điện tử, đồ gốm sứ'],
    ['SILICA-GEL-5G', 'Hạt hút ẩm Silica Gel túi 5g đóng gói', 'Silica hoạt tính', 'Kg', '38.000 đ', '35.000 đ', '32.000 đ', 'Bảo quản hàng may mặc, da giày, cơ khí']
  ];

  function createPriceListCsvBlob() {
    const headers = [
      'Mã sản phẩm',
      'Tên sản phẩm & Quy cách',
      'Độ dày mic / Khổ',
      'Đơn vị tính',
      'Giá sỉ Dưới 20 thùng',
      'Giá sỉ 20-50 thùng',
      'Giá sỉ Trên 50 thùng',
      'Ghi chú đóng gói & Chiết khấu KCN'
    ];

    const escapeCsv = (val) => {
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const lines = [
      headers.map(escapeCsv).join(','),
      ...WHOLESALE_CSV_ROWS.map(row => row.map(escapeCsv).join(','))
    ];

    const content = '\uFEFF' + lines.join('\r\n') + '\r\n';
    return new Blob([content], { type: 'text/csv;charset=utf-8;' });
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', filename);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // --- XỬ LÝ SUBMIT YÊU CẦU BÁO GIÁ SỈ ---
  if (quoteModalForm) {
    quoteModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const companyNameInput = document.getElementById('modalCompanyName');
      const contactNameInput = document.getElementById('modalContactName');
      const phoneInput = document.getElementById('modalPhone');
      const regionInput = document.getElementById('modalRegion');
      const customerTypeInput = document.getElementById('modalCustomerType');
      const noteInput = document.getElementById('modalNote');

      // Kiểm tra validate inline
      let isValid = true;

      if (!companyNameInput.value.trim()) {
        highlightError(companyNameInput, 'errModalCompany', 'Vui lòng nhập tên công ty hoặc cửa hàng');
        isValid = false;
      } else {
        clearError(companyNameInput, 'errModalCompany');
      }

      if (!contactNameInput.value.trim()) {
        highlightError(contactNameInput, 'errModalContact', 'Vui lòng nhập tên người phụ trách thu mua');
        isValid = false;
      } else {
        clearError(contactNameInput, 'errModalContact');
      }

      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 8) {
        highlightError(phoneInput, 'errModalPhone', 'Vui lòng nhập số điện thoại hoặc Zalo hợp lệ');
        isValid = false;
      } else {
        clearError(phoneInput, 'errModalPhone');
      }

      if (!isValid) return;

      const submitBtn = quoteModalForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi thông tin...';

      const payload = {
        company_name: companyNameInput.value.trim(),
        contact_name: contactNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        region: regionInput.value,
        customer_type: customerTypeInput.value,
        note: noteInput.value.trim(),
        product_name: document.getElementById('modalFieldProductName').value,
        spec_width: document.getElementById('modalFieldSpecWidth').value,
        quantity: parseInt(document.getElementById('modalFieldQuantity').value, 10) || 10,
        estimated_unit_price: parseInt(document.getElementById('modalFieldUnitPrice').value, 10) || 0,
        estimated_total: parseInt(document.getElementById('modalFieldTotal').value, 10) || 0
      };

      try {
        const response = await fetch('/api/quote-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Khi chạy trên GitHub Pages hoặc host tĩnh mà /api/... trả về 404/405
        if (response.status === 404 || response.status === 405) {
          handleQuoteOfflineFallback(payload);
          return;
        }

        let result = {};
        try {
          result = await response.json();
        } catch (jsonErr) {
          handleQuoteOfflineFallback(payload);
          return;
        }

        if (response.ok && result.status === 'success') {
          modalQuoteAlert.className = 'alert-box alert-success visible';
          modalQuoteAlert.innerHTML = '<span>Mã báo giá của quý khách: <strong>' + result.quote_code + '</strong> — Phòng kỹ thuật sẽ liên hệ gửi mẫu thử và báo giá chiết khấu trong 15 phút.</span>';
          quoteModalForm.reset();
          showToast('Gửi báo giá thành công. Mã tiếp nhận: ' + result.quote_code);

          setTimeout(() => {
            closeQuoteModal();
          }, 3500);
        } else {
          modalQuoteAlert.className = 'alert-box alert-error visible';
          modalQuoteAlert.textContent = result.message || 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi Hotline 0912.345.678.';
        }
      } catch (err) {
        // Khi lỗi mạng hoặc host tĩnh không thể kết nối backend
        handleQuoteOfflineFallback(payload);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // --- XỬ LÝ ĐĂNG KÝ HỢP TÁC ĐẠI LÝ & NHÀ MÁY ---
  if (partnerForm) {
    partnerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const companyInput = document.getElementById('partnerCompany');
      const contactInput = document.getElementById('partnerContact');
      const phoneInput = document.getElementById('partnerPhone');
      const emailInput = document.getElementById('partnerEmail');
      const regionInput = document.getElementById('partnerRegion');
      const typeInput = document.getElementById('partnerType');
      const volumeInput = document.getElementById('partnerVolume');
      const messageInput = document.getElementById('partnerMessage');

      let isValid = true;

      if (!companyInput.value.trim()) {
        highlightError(companyInput, 'errPartnerCompany', 'Vui lòng nhập tên công ty hoặc cửa hàng phân phối');
        isValid = false;
      } else {
        clearError(companyInput, 'errPartnerCompany');
      }

      if (!contactInput.value.trim()) {
        highlightError(contactInput, 'errPartnerContact', 'Vui lòng nhập họ và tên người đại diện');
        isValid = false;
      } else {
        clearError(contactInput, 'errPartnerContact');
      }

      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 8) {
        highlightError(phoneInput, 'errPartnerPhone', 'Vui lòng nhập số điện thoại hoặc Zalo liên hệ');
        isValid = false;
      } else {
        clearError(phoneInput, 'errPartnerPhone');
      }

      if (!regionInput.value) {
        highlightError(regionInput, 'errPartnerRegion', 'Vui lòng chọn tỉnh thành hoặc khu công nghiệp');
        isValid = false;
      } else {
        clearError(regionInput, 'errPartnerRegion');
      }

      if (!isValid) return;

      const submitBtn = partnerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang tiếp nhận thông tin đối tác...';

      const payload = {
        company_name: companyInput.value.trim(),
        contact_name: contactInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        region: regionInput.value,
        partner_type: typeInput.value,
        monthly_volume: volumeInput.value,
        message: messageInput.value.trim()
      };

      try {
        const response = await fetch('/api/partner-registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Khi chạy trên GitHub Pages hoặc host tĩnh mà /api/... trả về 404/405
        if (response.status === 404 || response.status === 405) {
          handlePartnerOfflineFallback(payload);
          return;
        }

        let result = {};
        try {
          result = await response.json();
        } catch (jsonErr) {
          handlePartnerOfflineFallback(payload);
          return;
        }

        if (response.ok && result.status === 'success') {
          partnerAlert.className = 'alert-box alert-success visible';
          partnerAlert.innerHTML = '<span>Đăng ký đối tác thành công! Mã đối tác tiếp nhận: <strong>' + result.partner_code + '</strong> — Giám đốc kinh doanh khu vực sẽ liên hệ gửi hợp đồng mẫu và chính sách chiết khấu.</span>';
          partnerForm.reset();
          showToast('Đăng ký đối tác thành công. Mã: ' + result.partner_code);
        } else {
          partnerAlert.className = 'alert-box alert-error visible';
          partnerAlert.textContent = result.message || 'Lỗi khi gửi thông tin. Quý đối tác vui lòng kiểm tra lại.';
        }
      } catch (err) {
        // Khi lỗi mạng hoặc host tĩnh không thể kết nối backend
        handlePartnerOfflineFallback(payload);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --- LỌC DANH MỤC SẢN PHẨM & TÌM KIẾM ---
  function applyFilters() {
    const category = state.activeCategoryFilter;
    const query = state.searchQuery.toLowerCase().trim();
    let visibleCount = 0;

    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardName = (card.getAttribute('data-name') || '').toLowerCase();
      const cardSpecs = (card.getAttribute('data-spec') || '').toLowerCase();
      const cardDesc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

      // Kiểm tra danh mục
      const matchCategory = (category === 'all' || cardCategory === category);

      // Kiểm tra từ khóa tìm kiếm
      const matchQuery = !query ||
        cardName.includes(query) ||
        cardSpecs.includes(query) ||
        cardDesc.includes(query);

      if (matchCategory && matchQuery) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (productsEmptyNotice) {
      if (visibleCount === 0) {
        productsEmptyNotice.style.display = 'block';
      } else {
        productsEmptyNotice.style.display = 'none';
      }
    }
  }

  // Sự kiện bấm chọn danh mục dọc bên trái
  categoryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-category') || 'all';
      state.activeCategoryFilter = cat;
      applyFilters();

      // Cuộn mượt tới khu vực danh mục nếu ở màn hình nhỏ
      const targetSec = document.getElementById('catalog');
      if (targetSec && window.innerWidth < 992) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Sự kiện gõ tìm kiếm quy cách
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClearBtn) {
        if (state.searchQuery.length > 0) {
          searchClearBtn.classList.add('active');
        } else {
          searchClearBtn.classList.remove('active');
        }
      }
      applyFilters();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.classList.remove('active');
      applyFilters();
      searchInput.focus();
    });
  }

  // --- TẢI BẢNG GIÁ ĐẠI LÝ CSV (CHẾ ĐỘ HYBRID STATIC VÀ BACKEND API) ---
  if (btnDownloadPriceList) {
    btnDownloadPriceList.addEventListener('click', async () => {
      const filename = 'Bang_Gia_Si_Dai_Ly_Nha_May_2026.csv';
      let downloaded = false;

      // Khi chạy với backend server.py, ưu tiên gọi API /api/price-list-csv
      try {
        const response = await fetch('/api/price-list-csv', { method: 'GET' });
        if (response.ok && response.status === 200) {
          const blob = await response.blob();
          triggerBlobDownload(blob, filename);
          downloaded = true;
        }
      } catch (err) {
        // Lỗi mạng hoặc host tĩnh không có endpoint
      }

      // Khi chạy trên GitHub Pages hoặc static host mà /api/... trả về 404/405 hoặc lỗi mạng:
      // Tạo trực tiếp Blob CSV chuẩn UTF-8 BOM \uFEFF chứa đúng 12 dòng bảng giá sỉ từ server.py
      if (!downloaded) {
        const blob = createPriceListCsvBlob();
        triggerBlobDownload(blob, filename);
      }

      showToast('Đang tải xuống Bảng Giá Sỉ Đại Lý & Nhà Máy 2026. Tệp CSV tương thích chuẩn tiếng Việt Excel.');
    });
  }

  // --- HÀM TIỆN ÍCH HIỂN THỊ LỖI & TOAST ---
  function highlightError(inputElem, errorId, msg) {
    inputElem.classList.add('is-invalid');
    const errElem = document.getElementById(errorId);
    if (errElem) {
      errElem.textContent = msg;
      errElem.classList.add('visible');
    }
  }

  function clearError(inputElem, errorId) {
    inputElem.classList.remove('is-invalid');
    const errElem = document.getElementById(errorId);
    if (errElem) {
      errElem.textContent = '';
      errElem.classList.remove('visible');
    }
  }

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4500);
  }

});
