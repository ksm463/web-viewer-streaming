// 모달 열기 및 닫기 스크립트
const onvifModal = document.getElementById("onvif-modal");
const rtspModal = document.getElementById("rtsp-modal");
const channelModal = document.getElementById("channel-modal");
const connectButton = document.getElementById("connect-button");
const searchButton = document.querySelector(".search-button");

// 각 모달 내부의 ONVIF 및 RTSP 버튼 선택
const onvifButtonInOnvifModal = onvifModal.querySelector(".onvif-btn");
const rtspButtonInOnvifModal = onvifModal.querySelector(".rtsp-btn");
const onvifButtonInRtspModal = rtspModal.querySelector(".onvif-btn");
const rtspButtonInRtspModal = rtspModal.querySelector(".rtsp-btn");

const closeButtons = document.querySelectorAll(".close-modal");

// Connect 버튼 클릭 시 ONVIF 모달 창 열기
connectButton.onclick = function() {
    onvifModal.style.display = "flex";
    rtspModal.style.display = "none";
    onvifButtonInOnvifModal.classList.add("active");
    rtspButtonInOnvifModal.classList.remove("active");
}

// ONVIF 모달 내부의 ONVIF 버튼 클릭 시 ONVIF 모달 창 열기
onvifButtonInOnvifModal.onclick = function() {
    onvifModal.style.display = "flex";
    rtspModal.style.display = "none";
    onvifButtonInOnvifModal.classList.add("active");
    rtspButtonInOnvifModal.classList.remove("active");
}

// ONVIF 모달 내부의 RTSP 버튼 클릭 시 RTSP 모달 창 열기
rtspButtonInOnvifModal.onclick = function() {
    rtspModal.style.display = "flex";
    onvifModal.style.display = "none";
    rtspButtonInRtspModal.classList.add("active");
    onvifButtonInRtspModal.classList.remove("active");
}

// RTSP 모달 내부의 ONVIF 버튼 클릭 시 ONVIF 모달 창 열기
onvifButtonInRtspModal.onclick = function() {
    onvifModal.style.display = "flex";
    rtspModal.style.display = "none";
    onvifButtonInOnvifModal.classList.add("active");
    rtspButtonInOnvifModal.classList.remove("active");
}

// RTSP 모달 내부의 RTSP 버튼 클릭 시 RTSP 모달 창 열기
rtspButtonInRtspModal.onclick = function() {
    rtspModal.style.display = "flex";
    onvifModal.style.display = "none";
    rtspButtonInRtspModal.classList.add("active");
    onvifButtonInRtspModal.classList.remove("active");
}

searchButton.onclick = async function() {
    const ipValue = onvifModal.querySelector('input[name="onvifIp"]').value;
    const idValue = onvifModal.querySelector('input[name="onvifId"]').value;
    const pwValue = onvifModal.querySelector('input[name="onvifPw"]').value;

    const url = `/get_onvif_list?ip=${encodeURIComponent(ipValue)}&port=80&id=${encodeURIComponent(idValue)}&pwd=${encodeURIComponent(pwValue)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail || '채널 리스트를 가져오는데 실패했습니다.');
            throw new Error(errorData.detail);
        }

        const data = await response.json();

        // 채널 리스트를 Channel Modal에 표시
        const channelModalBody = channelModal.querySelector('.modal-body');
        channelModalBody.innerHTML = '';

        data.forEach((channel, index) => {
            const channelItem = document.createElement('div');
            channelItem.classList.add('channel-item');
            channelItem.textContent = `Channel ${index + 1}: ${channel.width}x${channel.height}, FPS: ${channel.fps}, Codec: ${channel.codec}`;

            // 채널 아이템 클릭 시 선택 표시
            channelItem.addEventListener('click', function() {
                const channelItems = channelModalBody.querySelectorAll('.channel-item');
                channelItems.forEach(item => item.classList.remove('selected'));
                channelItem.classList.add('selected');
            });

            channelModalBody.appendChild(channelItem);
        });

        // 채널 데이터 저장
        window.channelData = data;

        // 모달 전환
        onvifModal.style.display = "none";
        channelModal.style.display = "flex";

    } catch (error) {
        console.error('채널 리스트 가져오기 오류:', error);
    }
}

// 닫기 버튼을 누르면 모든 모달 창 닫기
closeButtons.forEach(button => {
    button.onclick = function() {
        onvifModal.style.display = "none";
        rtspModal.style.display = "none";
        channelModal.style.display = "none";
    }
});

// 모달 외부를 클릭하면 모든 모달 창 닫기
window.onclick = function(event) {
    if (event.target == onvifModal || event.target == rtspModal || event.target == channelModal) {
        onvifModal.style.display = "none";
        rtspModal.style.display = "none";
        channelModal.style.display = "none";
    }
}

// WebSocket을 이용한 Canvas에 영상 표시
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 초기 설정: 검은색 배경 및 메시지 출력
function initializeCanvas() {
    ctx.fillStyle = '#000000';  // 검은색 배경
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // 캔버스 전체에 배경색 채우기

    ctx.fillStyle = '#FFFFFF';  // 텍스트 색상: 흰색
    ctx.font = '20px Arial';  // 텍스트 폰트 설정
    ctx.textAlign = 'center';  // 텍스트 가운데 정렬
    ctx.fillText('RTSP 정보를 입력해주세요', canvas.width / 2, canvas.height / 2);  // 메시지 출력
}

// 캔버스 크기를 윈도우 크기에 맞게 조정하는 함수
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50; // 상단 메뉴바 높이를 제외
}

// 윈도우 크기가 변경될 때마다 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);

// 초기 캔버스 설정 호출
resizeCanvas();
initializeCanvas();

let socket;


function initializeWebSocket(wsUrl) {
    socket = new WebSocket(wsUrl);

    socket.onmessage = function(event) {
        const imageData = event.data;

        const img = new Image();
        img.src = 'data:image/jpeg;base64,' + imageData;

        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    };

    socket.onclose = function() {
        console.log("WebSocket closed");
    };

    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onopen = function() {
        console.log("WebSocket connection established.");
    };
}

// 조회 버튼 클릭 시 ONVIF 채널 리스트 가져오기
searchButton.onclick = async function() {
    const ipInput = onvifModal.querySelector('input[name="onvifIp"]');
    const idInput = onvifModal.querySelector('input[name="onvifId"]');
    const pwInput = onvifModal.querySelector('input[name="onvifPw"]');

    // 입력 필드의 값을 가져옴
    const ipValue = ipInput.value;
    const idValue = idInput.value;
    const pwValue = pwInput.value;

    const url = `/get_onvif_list?ip=${encodeURIComponent(ipValue)}&port=80&id=${encodeURIComponent(idValue)}&pwd=${encodeURIComponent(pwValue)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail || '채널 리스트를 가져오는데 실패했습니다.');
            throw new Error(errorData.detail);
        }

        const data = await response.json();

        // 채널 리스트를 Channel Modal에 표시
        const channelListContainer = channelModal.querySelector('.channel-list');
        channelListContainer.innerHTML = '';

        const channelListHeader = document.createElement('div');
        channelListHeader.classList.add('channel-list-header');

        const headerChannel = document.createElement('div');
        headerChannel.classList.add('channel-column', 'channel-number');
        headerChannel.textContent = 'Channel';

        const headerResolution = document.createElement('div');
        headerResolution.classList.add('channel-column', 'channel-resolution');
        headerResolution.textContent = 'Resolution';

        const headerFps = document.createElement('div');
        headerFps.classList.add('channel-column', 'channel-fps');
        headerFps.textContent = 'FPS';

        const headerCodec = document.createElement('div');
        headerCodec.classList.add('channel-column', 'channel-codec');
        headerCodec.textContent = 'Codec';

        channelListHeader.appendChild(headerChannel);
        channelListHeader.appendChild(headerResolution);
        channelListHeader.appendChild(headerFps);
        channelListHeader.appendChild(headerCodec);

        channelListContainer.appendChild(channelListHeader);

        data.forEach((channel, index) => {
            const channelItem = document.createElement('div');
            channelItem.classList.add('channel-item');

            const channelNumberDiv = document.createElement('div');
            channelNumberDiv.classList.add('channel-column', 'channel-number');
            channelNumberDiv.textContent = `Channel ${index + 1}`;

            const resolutionDiv = document.createElement('div');
            resolutionDiv.classList.add('channel-column', 'channel-resolution');
            resolutionDiv.textContent = `${channel.width}x${channel.height}`;

            const fpsDiv = document.createElement('div');
            fpsDiv.classList.add('channel-column', 'channel-fps');
            fpsDiv.textContent = `${channel.fps}`;

            const codecDiv = document.createElement('div');
            codecDiv.classList.add('channel-column', 'channel-codec');
            codecDiv.textContent = `${channel.codec.toUpperCase()}`;

            // 채널 정보 숨김 (필요한 경우)
            channelItem.dataset.rtsp = channel.rtsp;

            // 채널 아이템 구성
            channelItem.appendChild(channelNumberDiv);
            channelItem.appendChild(resolutionDiv);
            channelItem.appendChild(fpsDiv);
            channelItem.appendChild(codecDiv);

            // 채널 아이템 클릭 시 선택 표시
            channelItem.addEventListener('click', function() {
                const channelItems = channelListContainer.querySelectorAll('.channel-item');
                channelItems.forEach(item => item.classList.remove('selected'));
                channelItem.classList.add('selected');
            });

            channelListContainer.appendChild(channelItem);
        });

        // 채널 데이터 저장
        window.channelData = data;

        // 모달 전환
        onvifModal.style.display = "none";
        channelModal.style.display = "flex";

    } catch (error) {
        console.error('채널 리스트 가져오기 오류:', error);
    }
}



// rtsp play-button 클릭 시 WebSocket 연결 시작
const rtspPlayButton = rtspModal.querySelector('.play-button');

rtspPlayButton.addEventListener('click', async function() {
    const rtspAddress = document.querySelector('input[name="rtspAddress"]').value;
    const rtspId = document.querySelector('input[name="rtspId"]').value;
    const rtspPw = document.querySelector('input[name="rtspPw"]').value;

    // 서버로 RTSP 정보 전송하여 세션 토큰 받기
    try {
        const response = await fetch('/setup_rtsp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rtsp_address: rtspAddress, rtsp_id: rtspId, rtsp_pw: rtspPw })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail);
            throw new Error(errorData.detail);
        }

        const data = await response.json();
        const fullRtspAddress = data.full_rtsp_address;
        console.log("Full RTSP 주소 받음:", fullRtspAddress);

        // WebSocket 연결 생성 (세션 토큰을 query parameter로 전달)
        const wsUrl = `ws://192.168.10.10:58444/ws/video?rtsp_address=${encodeURIComponent(fullRtspAddress)}`;
        initializeWebSocket(wsUrl);

        // RTSP 모달 닫기
        rtspModal.style.display = 'none';

        // 입력 필드 초기화
        rtspModal.querySelector('input[name="rtspAddress"]').value = '';
        rtspModal.querySelector('input[name="rtspId"]').value = '';
        rtspModal.querySelector('input[name="rtspPw"]').value = '';

    } catch (error) {
        console.error(error);
    }
});

// Channel Modal의 play-button 클릭 시 선택된 채널로 WebSocket 연결 시작
const channelPlayButton = channelModal.querySelector('.play-button');

channelPlayButton.addEventListener('click', function() {
    const channelListContainer = channelModal.querySelector('.channel-list');
    const selectedChannelItem = channelListContainer.querySelector('.channel-item.selected');

    if (selectedChannelItem) {
        const channelItems = Array.from(channelListContainer.querySelectorAll('.channel-item'));
        const index = channelItems.indexOf(selectedChannelItem);
        const selectedChannel = window.channelData[index];

        const fullRtspAddress = selectedChannel.rtsp;
        console.log("Full RTSP 주소:", fullRtspAddress);

        // WebSocket 연결 생성
        const wsUrl = `ws://192.168.10.10:58444/ws/video?rtsp_address=${encodeURIComponent(fullRtspAddress)}`;
        initializeWebSocket(wsUrl);

        // Channel 모달 닫기
        channelModal.style.display = 'none';

        // ONVIF 모달의 입력 필드 초기화
        onvifModal.querySelector('input[name="onvifIp"]').value = '';
        onvifModal.querySelector('input[name="onvifId"]').value = '';
        onvifModal.querySelector('input[name="onvifPw"]').value = '';

        // 선택된 채널 해제
        const selectedChannelItems = channelModal.querySelectorAll('.channel-item.selected');
        selectedChannelItems.forEach(item => item.classList.remove('selected'));

        // 채널 리스트 초기화 (필요한 경우)
        channelModal.querySelector('.channel-list').innerHTML = '';

    } else {
        alert('재생할 RTSP 채널이 선택되지 않았습니다.');
    }
});


const closeButton = document.getElementById('close-button');

closeButton.addEventListener('click', function() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        console.log("WebSocket connection closed by user.");
    } else {
        console.log("No active WebSocket connection to close.");
    }
    initializeCanvas();
});