document.addEventListener('DOMContentLoaded', function () {
    // Phần tử microphone
    const micButton = document.getElementById('micButton');
    const statusText = document.querySelector('.status-text');
    const statusIndicator = document.querySelector('.status-indicator');

    // Phần tử phân tích
    const welcomeMessage = document.getElementById('welcomeMessage');
    const transcriptionBox = document.getElementById('transcriptionBox');
    const transcriptionContent = document.getElementById('transcriptionContent');
    const processingState = document.getElementById('processingState');
    const errorState = document.getElementById('errorState');
    const resultNormal = document.getElementById('resultNormal');
    const resultScam = document.getElementById('resultScam');
    const retryBtn = document.getElementById('retryBtn');

    // Phần tử menu người dùng
    const userIcon = document.querySelector('.user-icon');
    const userDropdown = document.getElementById('userDropdown');
    const logoutOption = document.getElementById('logoutOption');
    const logoutModal = document.getElementById('logoutModal');
    const closeModal = document.getElementById('closeModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');

    // Phần tử lịch sử
    const viewAllBtn = document.querySelector('.view-all-btn');
    const historyActions = document.querySelectorAll('.history-action');
    const historyDetailModal = document.getElementById('historyDetailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const historyDetailContent = document.getElementById('historyDetailContent');

    let recordingActive = false;
    let audioRecorder = null;
    let recordedChunks = [];
    let speechRecognizer = null;
    let completeTranscript = '';

    // KHỞI TẠO BAN ĐẦU 

    verifyMicrophoneAccess();
    initializeSpeechRecognition();
    displayWelcomeScreen();

    // ĐĂNG KÝ SỰ KIỆN 

    // Sự kiện nút microphone
    micButton?.addEventListener('click', toggleRecording);

    // Sự kiện menu người dùng
    userIcon?.addEventListener('click', handleUserIconClick);

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', handleOutsideClick);

    // Sự kiện đăng xuất
    logoutOption?.addEventListener('click', handleLogoutClick);
    closeModal?.addEventListener('click', hideLogoutConfirmation);
    cancelLogout?.addEventListener('click', hideLogoutConfirmation);
    confirmLogout?.addEventListener('click', executeLogout);
    logoutModal?.addEventListener('click', handleModalBackdropClick);

    // Sự kiện thử lại
    retryBtn?.addEventListener('click', resetToWelcome);

    // Sự kiện xem tất cả lịch sử
    viewAllBtn?.addEventListener('click', navigateToFullHistory);

    // Sự kiện xem chi tiết bản ghi
    historyActions.forEach(action => {
        action.addEventListener('click', handleHistoryDetailClick);
    });

    // Sự kiện đóng modal chi tiết
    closeDetailModal?.addEventListener('click', hideHistoryModal);
    historyDetailModal?.addEventListener('click', handleHistoryModalBackdrop);

    // XỬ LÝ MENU NGƯỜI DÙNG 

    function handleUserIconClick(event) {
        event.stopPropagation();
        userDropdown?.classList.toggle('active');
    }

    function handleOutsideClick(event) {
        if (!event.target.closest('.user-menu-wrapper')) {
            userDropdown?.classList.remove('active');
        }
    }

    function handleLogoutClick(event) {
        event.stopPropagation();
        userDropdown?.classList.remove('active');
        showLogoutConfirmation();
    }

    function showLogoutConfirmation() {
        logoutModal?.classList.add('active');
    }

    function hideLogoutConfirmation() {
        logoutModal?.classList.remove('active');
    }

    function handleModalBackdropClick(event) {
        if (event.target === logoutModal) {
            hideLogoutConfirmation();
        }
    }

    function executeLogout() {
        console.log('Đăng xuất khỏi hệ thống...');

        // Mô phỏng quá trình đăng xuất
        setTimeout(() => {
            hideLogoutConfirmation();
            window.location.href = 'dangNhap.html';
        }, 500);
    }

    //  XỬ LÝ GHI ÂM VÀ MICROPHONE 

    async function verifyMicrophoneAccess() {
        try {
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

                switch (permissionStatus.state) {
                    case 'granted':
                        setMicrophoneStatus('ready', 'Đã sẵn sàng');
                        break;
                    case 'denied':
                        setMicrophoneStatus('error', 'Không có quyền truy cập');
                        break;
                    default:
                        setMicrophoneStatus('prompt', 'Chờ cấp quyền');
                }
            }
        } catch (err) {
            console.log('Không hỗ trợ kiểm tra quyền:', err);
            setMicrophoneStatus('ready', 'Đã sẵn sàng');
        }
    }

    async function toggleRecording() {
        if (!recordingActive) {
            await beginRecording();
        } else {
            endRecording();
        }
    }

    async function beginRecording() {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioRecorder = new MediaRecorder(audioStream);
            recordedChunks = [];
            completeTranscript = '';

            audioRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            audioRecorder.onstop = handleRecordingComplete;

            audioRecorder.start();
            recordingActive = true;

            // Cập nhật giao diện
            micButton.classList.add('recording');
            micButton.querySelector('i').className = 'fa-solid fa-stop';
            setMicrophoneStatus('recording', 'Đang ghi âm...');

            // Hiển thị ô dịch realtime
            showTranscriptionPanel();

            // Khởi động nhận dạng giọng nói
            if (speechRecognizer) {
                speechRecognizer.start();
            }

            console.log('Đã bắt đầu ghi âm');
        } catch (err) {
            console.error('Lỗi khi bắt đầu ghi âm:', err);

            if (err.name === 'NotAllowedError') {
                setMicrophoneStatus('error', 'Không có quyền truy cập');
                displayNotification('Vui lòng cấp quyền truy cập microphone', 'error');
            } else {
                setMicrophoneStatus('error', 'Lỗi ghi âm');
                displayNotification('Không thể bắt đầu ghi âm', 'error');
            }
            displayWelcomeScreen();
        }
    }

    function endRecording() {
        if (audioRecorder && recordingActive) {
            audioRecorder.stop();
            audioRecorder.stream.getTracks().forEach(track => track.stop());
            recordingActive = false;

            // Dừng nhận dạng giọng nói
            if (speechRecognizer) {
                speechRecognizer.stop();
            }

            // Cập nhật giao diện
            micButton.classList.remove('recording');
            micButton.querySelector('i').className = 'fa-solid fa-microphone';
            setMicrophoneStatus('processing', 'Đang xử lý...');

            console.log('Đã dừng ghi âm');
        }
    }

    function handleRecordingComplete() {
        const audioData = new Blob(recordedChunks, { type: 'audio/wav' });
        console.log('Kích thước file âm thanh:', audioData.size, 'bytes');
        console.log('Văn bản đã dịch:', completeTranscript);

        // Hiển thị trạng thái đang xử lý
        showProcessingPanel();

        // Mô phỏng quá trình xử lý
        setTimeout(() => {
            analyzeAudioData(audioData);
        }, 2500);
    }

    async function analyzeAudioData(audioData) {
        try {
            // Mô phỏng kết quả ngẫu nhiên để demo
            const randomValue = Math.random();

            if (randomValue < 0.12) {
                // 12% cơ hội lỗi server
                showErrorPanel();
                setMicrophoneStatus('error', 'Lỗi xử lý');
            } else if (randomValue < 0.56) {
                // 44% cơ hội bình thường
                const sampleText = completeTranscript || 'Xin chào, tôi gọi để hỏi thăm về sản phẩm của công ty bạn. Tôi quan tâm đến dịch vụ tư vấn tài chính và muốn biết thêm thông tin chi tiết.';
                showNormalResult(sampleText);
                setMicrophoneStatus('ready', 'Đã sẵn sàng');
            } else {
                // 44% cơ hội scam
                const scamText = completeTranscript || 'Chào anh/chị, tôi là nhân viên ngân hàng. Tài khoản của anh/chị đang có vấn đề bảo mật. Anh/chị vui lòng cung cấp mã OTP để chúng tôi xác minh và bảo vệ tài khoản.';
                showScamResult(scamText);
                setMicrophoneStatus('ready', 'Đã sẵn sàng');
            }

            // TODO: Gửi đến backend để phân tích thực tế
            // const formData = new FormData();
            // formData.append('audio', audioData);
            // const response = await fetch('/api/analyze', { method: 'POST', body: formData });
            // const analysisResult = await response.json();

        } catch (err) {
            console.error('Lỗi khi phân tích âm thanh:', err);
            showErrorPanel();
            setMicrophoneStatus('error', 'Lỗi xử lý');
        }
    }

    function setMicrophoneStatus(statusType, statusMessage) {
        if (!statusText || !statusIndicator) return;

        statusText.textContent = statusMessage;

        // Cập nhật màu chỉ báo
        const colorMap = {
            'ready': '#10B981',
            'recording': '#EF4444',
            'processing': '#F59E0B',
            'error': '#EF4444',
            'prompt': '#6B7280'
        };

        statusIndicator.style.backgroundColor = colorMap[statusType] || '#6B7280';
    }

    //  NHẬN DẠNG GIỌNG NÓI REALTIME 

    function initializeSpeechRecognition() {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            console.log('Trình duyệt không hỗ trợ nhận dạng giọng nói');
            return;
        }

        speechRecognizer = new SpeechRecognitionAPI();
        speechRecognizer.continuous = true;
        speechRecognizer.interimResults = true;
        speechRecognizer.lang = 'vi-VN';

        speechRecognizer.onresult = function (event) {
            let temporaryText = '';
            let finalizedText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const currentTranscript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalizedText += currentTranscript + ' ';
                } else {
                    temporaryText += currentTranscript;
                }
            }

            // Cập nhật văn bản hoàn chỉnh
            if (finalizedText) {
                completeTranscript += finalizedText;
            }

            // Cập nhật giao diện với văn bản
            refreshTranscriptionDisplay(completeTranscript + temporaryText);
        };

        speechRecognizer.onerror = function (event) {
            console.error('Lỗi nhận dạng giọng nói:', event.error);
        };

        speechRecognizer.onend = function () {
            console.log('Nhận dạng giọng nói đã kết thúc');
        };
    }

    function refreshTranscriptionDisplay(textContent) {
        const textElement = transcriptionContent?.querySelector('.transcription-text');
        if (textElement) {
            textElement.textContent = textContent || 'Đang lắng nghe...';
        }
    }

    // QUẢN LÝ HIỂN THỊ CÁC TRẠNG THÁI 

    function clearAllPanels() {
        welcomeMessage?.classList.remove('active');
        transcriptionBox?.classList.remove('active');
        processingState?.classList.remove('active');
        errorState?.classList.remove('active');
        resultNormal?.classList.remove('active');
        resultScam?.classList.remove('active');

        // Ẩn tất cả
        [welcomeMessage, transcriptionBox, processingState, errorState, resultNormal, resultScam].forEach(el => {
            if (el) el.style.display = 'none';
        });
    }

    function displayWelcomeScreen() {
        clearAllPanels();
        if (welcomeMessage) {
            welcomeMessage.classList.add('active');
            welcomeMessage.style.display = 'block';
        }
    }

    function showTranscriptionPanel() {
        clearAllPanels();
        if (transcriptionBox) {
            transcriptionBox.classList.add('active');
            transcriptionBox.style.display = 'block';
        }
        refreshTranscriptionDisplay('Đang lắng nghe...');
    }

    function showProcessingPanel() {
        clearAllPanels();
        if (processingState) {
            processingState.classList.add('active');
            processingState.style.display = 'block';
        }
    }

    function showErrorPanel() {
        clearAllPanels();
        if (errorState) {
            errorState.classList.add('active');
            errorState.style.display = 'block';
        }
    }

    function showNormalResult(transcriptText) {
        clearAllPanels();
        if (resultNormal) {
            resultNormal.classList.add('active');
            resultNormal.style.display = 'block';

            const transcriptElement = document.getElementById('normalTranscript');
            if (transcriptElement) {
                transcriptElement.textContent = transcriptText;
            }
        }
    }

    function showScamResult(transcriptText) {
        clearAllPanels();
        if (resultScam) {
            resultScam.classList.add('active');
            resultScam.style.display = 'block';

            const transcriptElement = document.getElementById('scamTranscript');
            if (transcriptElement) {
                transcriptElement.textContent = transcriptText;
            }
        }
    }

    function resetToWelcome() {
        displayWelcomeScreen();
    }

    //  QUẢN LÝ LỊCH SỬ GHI ÂM 

    function navigateToFullHistory() {
        alert('Chức năng xem tất cả lịch sử sẽ được triển khai sau!');
        // TODO: Chuyển hướng đến trang lịch sử đầy đủ
    }

    function handleHistoryDetailClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const recordIdentifier = this.getAttribute('data-id');
        loadHistoryDetail(recordIdentifier);
    }

    function loadHistoryDetail(recordId) {
        // Dữ liệu mẫu - thay thế bằng API call thực tế
        const sampleRecords = {
            '1': {
                title: 'Cuộc gọi từ bạn bè',
                date: '24/10/2025',
                time: '14:30',
                duration: '2:45',
                status: 'safe',
                statusLabel: 'An toàn',
                confidence: '95%',
                transcript: 'Xin chào, tôi gọi để hỏi thăm về sản phẩm của công ty bạn. Tôi quan tâm đến dịch vụ tư vấn tài chính và muốn biết thêm thông tin chi tiết về các gói dịch vụ mà công ty đang cung cấp. Bạn có thể giúp tôi không?'
            },
            '2': {
                title: 'Cuộc gọi từ số lạ',
                date: '24/10/2025',
                time: '11:15',
                duration: '1:20',
                status: 'warning',
                statusLabel: 'Cảnh báo',
                confidence: '78%',
                transcript: 'Chào anh, tôi là nhân viên của công ty viễn thông. Hiện tại chúng tôi đang có chương trình khuyến mãi đặc biệt cho khách hàng. Anh có quan tâm nâng cấp gói cước không?'
            },
            '3': {
                title: 'Lừa đảo - Giả mạo ngân hàng',
                date: '23/10/2025',
                time: '09:45',
                duration: '3:10',
                status: 'danger',
                statusLabel: 'Lừa đảo',
                confidence: '92%',
                transcript: 'Chào anh/chị, tôi là nhân viên ngân hàng Vietcombank. Tài khoản của anh/chị đang có vấn đề bảo mật nghiêm trọng. Chúng tôi phát hiện có giao dịch bất thường. Anh/chị vui lòng cung cấp mã OTP và mật khẩu để chúng tôi xác minh và bảo vệ tài khoản ngay lập tức.'
            }
        };

        const recordData = sampleRecords[recordId];
        if (!recordData) return;

        // Xây dựng nội dung modal
        const modalContent = `
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <p class="detail-info-label">Ngày ghi âm</p>
                    <p class="detail-info-value">${recordData.date}</p>
                </div>
                <div class="detail-info-item">
                    <p class="detail-info-label">Thời gian</p>
                    <p class="detail-info-value">${recordData.time}</p>
                </div>
                <div class="detail-info-item">
                    <p class="detail-info-label">Thời lượng</p>
                    <p class="detail-info-value">${recordData.duration}</p>
                </div>
                <div class="detail-info-item">
                    <p class="detail-info-label">Độ tin cậy</p>
                    <p class="detail-info-value">${recordData.confidence}</p>
                </div>
            </div>
            
            <div class="detail-info-item" style="margin-bottom: 24px;">
                <p class="detail-info-label">Kết quả phân tích</p>
                <span class="detail-status-badge ${recordData.status}">${recordData.statusLabel}</span>
            </div>

            <div class="detail-transcript-section">
                <h4>Văn bản đã dịch:</h4>
                <div class="detail-transcript-box">
                    <p class="detail-transcript-text">${recordData.transcript}</p>
                </div>
            </div>
        `;

        if (historyDetailContent) {
            historyDetailContent.innerHTML = modalContent;
        }

        displayHistoryModal();
    }

    function displayHistoryModal() {
        historyDetailModal?.classList.add('active');
    }

    function hideHistoryModal() {
        historyDetailModal?.classList.remove('active');
    }

    function handleHistoryModalBackdrop(event) {
        if (event.target === historyDetailModal) {
            hideHistoryModal();
        }
    }

    // HÀM HỖ TRỢ 

    function displayNotification(message, notificationType = 'info') {
        // TODO: Triển khai hệ thống thông báo
        console.log(`[${notificationType.toUpperCase()}] ${message}`);
    }

    function convertSecondsToTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
});
