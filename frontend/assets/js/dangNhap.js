document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btnLogin');

    if (!loginForm) return;
    // Validation theo thời gian thực khi nhập
    emailInput?.addEventListener('input', validateForm);
    passwordInput?.addEventListener('input', validateForm);

    function validateForm() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Chỉ bật nút nếu cả hai trường đều có dữ liệu
        if (email && password) {
            btnLogin.disabled = false;
        } else {
            btnLogin.disabled = true;
        }
    }

    // 2. GỬI FORM

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation cơ bản
        if (!email || !password) {
            showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        // Kiểm tra định dạng email
        if (!isValidEmail(email)) {
            showMessage('Email không hợp lệ!', 'error');
            return;
        }

        // Vô hiệu hóa nút trong khi gửi
        btnLogin.disabled = true;
        btnLogin.textContent = 'Đang đăng nhập...';

        // Mô phỏng gọi API (thay thế bằng API thực tế)
        setTimeout(() => {
            // Thành công
            showMessage('Đăng nhập thành công!', 'success');

            // Chuyển hướng sau 1 giây (thay thế bằng redirect thực tế)
            setTimeout(() => {
                // window.location.href = '/dashboard';
                console.log('Đang chuyển hướng đến dashboard...');
            }, 1000);

            // Reset nút
            btnLogin.textContent = 'Đăng nhập';
            btnLogin.disabled = false;
        }, 1500);
    });

    // 3. CÁC HÀM HỖ TRỢ


    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        // Tạo element thông báo nếu chưa có
        let messageEl = document.querySelector('.form-message');

        if (!messageEl) {
            messageEl = document.createElement('p');
            messageEl.className = 'form-message';
            loginForm.insertBefore(messageEl, btnLogin);
        }

        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        messageEl.style.display = 'block';

        // Ẩn sau 3 giây
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // 4. XỬ LÝ MODAL QUÊN MẬT KHẨU

    const forgotLink = document.querySelector('.forgot-link');
    const modal = document.getElementById('forgotPasswordModal');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    const modalBack = modal?.querySelector('.modal-back');
    const modalClose = modal?.querySelector('.modal-close');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    // Mở modal
    forgotLink?.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
    });

    // Các hàm đóng/mở modal
    function openModal() {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Ngăn cuộn body
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Khôi phục cuộn body
            // Reset form
            if (forgotPasswordForm) {
                forgotPasswordForm.reset();
            }
        }
    }

    // Đóng modal khi click overlay
    modalOverlay?.addEventListener('click', closeModal);

    // Đóng modal khi click nút quay lại
    modalBack?.addEventListener('click', closeModal);

    // Đóng modal khi click nút đóng
    modalClose?.addEventListener('click', closeModal);

    // Đóng modal khi nhấn phím Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });

    // 5. GỬI FORM QUÊN MẬT KHẨU

    forgotPasswordForm?.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('forgot-username')?.value.trim();
        const email = document.getElementById('forgot-email')?.value.trim();
        const submitBtn = this.querySelector('.modal-btn');

        // Validation
        if (!username || !email) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Kiểm tra định dạng email
        if (!isValidEmail(email)) {
            alert('Email không hợp lệ!');
            return;
        }

        // Vô hiệu hóa nút trong khi gửi
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';

        // Mô phỏng gọi API
        setTimeout(() => {
            alert('Thông tin khôi phục mật khẩu đã được gửi đến email của bạn!');
            closeModal();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi thông tin';
        }, 1500);
    });

});
