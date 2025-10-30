// JavaScript chung cho cả trang Đăng nhập và Đăng ký
// Xử lý: Bật/tắt hiển thị mật khẩu, Highlight menu đang active

document.addEventListener('DOMContentLoaded', function() {
    highlightActiveMenu();
    setupPasswordToggle();
});

/*Highlight menu item đang active dựa trên trang hiện tại*/
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.inner-menu ul li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href');
        
        // Kiểm tra nếu trang hiện tại khớp với menu item
        if (currentPath.includes('dangKy') || currentPath.includes('dangky')) {
            if (item.classList.contains('dangky')) {
                link.style.color = 'var(--color-primary)';
                link.style.fontWeight = '700';
            }
        } else if (currentPath.includes('dangNhap') || currentPath.includes('dangnhap')) {
            if (item.classList.contains('dangnhap')) {
                link.style.color = 'var(--color-primary)';
                link.style.fontWeight = '700';
            }
        }
    });
}

/* Thiết lập chức năng bật/tắt hiển thị mật khẩu cho tất cả các trường password*/
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.pwd-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.fa-eye');
            const eyeSlashIcon = this.querySelector('.fa-eye-slash');
            
            if (!passwordInput) return;
            
            // Chuyển đổi hiển thị mật khẩu
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Hiện icon mắt mở, ẩn icon mắt đóng
                if (eyeIcon) {
                    eyeIcon.style.display = 'none';
                }
                if (eyeSlashIcon) {
                    eyeSlashIcon.style.display = 'inline-block';
                }
                this.setAttribute('aria-label', 'Ẩn mật khẩu');
                this.setAttribute('title', 'Ẩn mật khẩu');
            } else {
                passwordInput.type = 'password';
                // Hiện icon mắt đóng, ẩn icon mắt mở
                if (eyeIcon) {
                    eyeIcon.style.display = 'inline-block';
                }
                if (eyeSlashIcon) {
                    eyeSlashIcon.style.display = 'none';
                }
                this.setAttribute('aria-label', 'Hiện mật khẩu');
                this.setAttribute('title', 'Hiện mật khẩu');
            }
        });
        
        // Thêm hỗ trợ bàn phím (Enter hoặc Space)
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}
