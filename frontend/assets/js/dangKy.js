document.addEventListener('DOMContentLoaded', function () {

    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm');
    const confirmMsg = document.getElementById('confirm-msg');
    const btnRegister = document.getElementById('btnRegister');

    if (!registerForm) return;
    // Validation theo thời gian thực khi nhập
    fullnameInput?.addEventListener('input', validateForm);
    emailInput?.addEventListener('input', validateForm);
    passwordInput?.addEventListener('input', function () {
        validateForm();
        checkPasswordMatch();
    });
    confirmInput?.addEventListener('input', function () {
        validateForm();
        checkPasswordMatch();
    });

    function validateForm() {
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        // Chỉ bật nút nếu tất cả trường đều có dữ liệu và mật khẩu khớp
        if (fullname && email && password && confirm && password === confirm) {
            btnRegister.disabled = false;
        } else {
            btnRegister.disabled = true;
        }
    }

    // 2. KIỂM TRA MẬT KHẨU KHỚP
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        // Không hiện thông báo nếu trường xác nhận còn trống
        if (!confirm) {
            confirmMsg.textContent = '';
            confirmMsg.className = 'confirm-msg';
            return;
        }

        if (password === confirm) {
            confirmMsg.textContent = '✓ Mật khẩu khớp';
            confirmMsg.className = 'confirm-msg success';
        } else {
            confirmMsg.textContent = '✗ Mật khẩu không khớp';
            confirmMsg.className = 'confirm-msg error';
        }
    }

    // 3. GỬI FORM

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        // Validation
        if (!fullname || !email || !password || !confirm) {
            showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        // Kiểm tra định dạng email
        if (!isValidEmail(email)) {
            showMessage('Email không hợp lệ!', 'error');
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            showMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
            return;
        }

        // Kiểm tra mật khẩu xác nhận
        if (password !== confirm) {
            showMessage('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        // Vô hiệu hóa nút trong khi gửi
        btnRegister.disabled = true;
        btnRegister.textContent = 'Đang đăng ký...';

        // Mô phỏng gọi API (thay thế bằng API thực tế)
        setTimeout(() => {
            // Thành công - Hiện thông báo thành công với link đăng nhập
            showSuccessMessage(fullname, email);

            // Reset nút
            btnRegister.textContent = 'Đăng ký';
        }, 1500);
    });

    // 4. CÁC HÀM HỖ TRỢ

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        // Sử dụng element confirm message để hiển thị thông báo
        confirmMsg.textContent = message;
        confirmMsg.className = `confirm-msg ${type}`;

        // Ẩn sau 3 giây (nhưng giữ nút disabled cho đến khi reload trang)
        setTimeout(() => {
            if (type !== 'success') {
                confirmMsg.textContent = '';
                confirmMsg.className = 'confirm-msg';
                btnRegister.disabled = false;
                btnRegister.textContent = 'Đăng ký';
            }
        }, 3000);
    }

    function showSuccessMessage(fullname, email) {
        // Ẩn form và hiển thị thông báo thành công
        const cardInner = document.querySelector('.register-card .card-inner');

        if (cardInner) {
            cardInner.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h2>Đăng ký thành công!</h2>
                    <p class="success-info">Chào mừng bạn, <strong>${fullname}</strong>!</p>
                    <p class="success-detail">Tài khoản của bạn đã được tạo với email: <strong>${email}</strong></p>
                    <p class="success-instruction">Bạn có thể đăng nhập ngay bây giờ để bắt đầu sử dụng dịch vụ.</p>
                    <a href="dangNhap.html" class="primary-btn">Đăng nhập ngay</a>
                    <p class="back-link">Hoặc <a href="dangKy.html">đăng ký tài khoản khác</a></p>
                </div>
            `;
        }
    }

    // 5. CHỈ SỐ ĐỘ MẠNH MẬT KHẨU (Tùy chọn)

    passwordInput?.addEventListener('input', function () {
        const password = this.value;

        // Có thể thêm chỉ số độ mạnh mật khẩu ở đây
        // Hiện tại chỉ kiểm tra độ dài tối thiểu
        if (password.length > 0 && password.length < 6) {
            // Có thể hiển thị gợi ý bên dưới trường mật khẩu
        }
    });

});
