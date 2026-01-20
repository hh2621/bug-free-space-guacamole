/**
 * SMART TV APP - REMOTE LOGIC FULL
 * Tác giả: Gemini Thought Partner
 */

// --- CẤU HÌNH BIẾN TOÀN CỤC ---
const DEFAULT_CHANNELS = [
    { "name": "VTV1 HD", "url": "https://live.fptplay53.net/fnxch2/vtv1hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV2 HD", "url": "https://live.fptplay53.net/fnxhd1/vtv2_vhls.smil/chunklist_b5000000.m3u8" },
    { "name": "VTV3 HD", "url": "https://live.fptplay53.net/fnxch2/vtv3hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV4 HD", "url": "https://live.fptplay53.net/fnxch2/vtv4hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV5 HD", "url": "https://live.fptplay53.net/epzch2/vtv5hd_abr.smil/chunklist.m3u8" },
    { "name": "ANTV", "url": "https://cmcty.vtvdigital.vn/mean/ANNINHTV/index.m3u8" }
];

let channels = [];
let currentIndex = 0;
let focusIndex = 0;
let inputNumber = "";
let numberTimeout = null;
let hls = null;

// Khai báo các biến DOM
let video, sidebar, listContainer, digitDisplay, infoBanner, displayName;

/**
 * 1. TỰ ĐỘNG CHÈN CSS VÀO HEAD (Fix lỗi không hiện Grid)
 */
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body { margin: 0; background: #000; overflow: hidden; font-family: sans-serif; }
        #main-player { width: 100vw; height: 100vh; background: #000; }
        
        /* Sidebar & Grid */
        #sidebar { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.85); display: none; z-index: 100;
            flex-direction: column; align-items: center; justify-content: center;
        }
        #sidebar.visible { display: flex; }
        .menu-title { color: #fff; margin-bottom: 20px; font-size: 30px; text-shadow: 2px 2px 4px #000; }
        
        #channel-list { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); /* 4 cột */
            gap: 20px; padding: 40px; width: 90%; max-height: 80vh; overflow-y: auto;
        }
        
        /* Item Kênh */
        .channel-item { 
            background: rgba(255,255,255,0.1); color: #fff; padding: 20px; 
            border-radius: 10px; text-align: center; border: 3px solid transparent;
            transition: all 0.2s;
        }
        .channel-item.focused { 
            background: #0078ff; border-color: #fff; transform: scale(1.1); font-weight: bold;
        }
        
        /* Thông báo số & Tên kênh */
        #digit-display { 
            position: fixed; top: 50px; right: 50px; font-size: 80px; color: #fff; 
            background: rgba(0,0,0,0.6); padding: 10px 30px; border-radius: 15px; display: none; 
        }
        #channel-info { 
            position: fixed; bottom: 50px; left: 50px; background: rgba(0,0,0,0.7); 
            padding: 10px 40px; border-radius: 50px; color: #fff; opacity: 0; transition: 0.5s; 
        }
        #channel-info.show { opacity: 1; }
    `;
    document.head.appendChild(style);
}

/**
 * 1. DỰNG GIAO DIỆN BẰNG JS (An toàn tuyệt đối)
 */
function buildAppUI() {
    const root = document.getElementById('app-root');
    if (!root) {
        console.error("Không tìm thấy app-root!");
        return;
    }
    root.innerHTML = ""; // Xóa trắng trước khi dựng

    video = document.createElement('video');
    video.id = 'main-player';
    video.autoplay = true;
    video.style = "width:100%; height:100%; background:#000;";
    root.appendChild(video);

    infoBanner = document.createElement('div');
    infoBanner.id = 'channel-info';
    displayName = document.createElement('h1');
    displayName.id = 'display-name';
    infoBanner.appendChild(displayName);
    root.appendChild(infoBanner);

    digitDisplay = document.createElement('div');
    digitDisplay.id = 'digit-display';
    root.appendChild(digitDisplay);

    sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    const title = document.createElement('h2');
    title.className = 'menu-title';
    title.innerText = "DANH SÁCH KÊNH";
    sidebar.appendChild(title);

    listContainer = document.createElement('div');
    listContainer.id = 'channel-list';
    sidebar.appendChild(listContainer);
    
    root.appendChild(sidebar);
    console.log("UI: Built successfully.");
}

/**
 * 2. TẢI KÊNH & ĐĂNG KÝ PHÍM
 */
async function loadChannels() {
    try {
        // Đăng ký phím Remote Samsung
        tizen.tvinputdevice.registerKey("0");
        tizen.tvinputdevice.registerKey("1");
        tizen.tvinputdevice.registerKey("2");
        tizen.tvinputdevice.registerKey("3");
        tizen.tvinputdevice.registerKey("4");
        tizen.tvinputdevice.registerKey("5");
        tizen.tvinputdevice.registerKey("6");
        tizen.tvinputdevice.registerKey("7");
        tizen.tvinputdevice.registerKey("8");
        tizen.tvinputdevice.registerKey("9");
    } catch (e) {}

    try {
        const response = await fetch("https://raw.githubusercontent.com/huydangdh/mmm/refs/heads/main/mytv.json", { cache: "no-store" });
        channels = await response.json();
    } catch (e) {
        channels = DEFAULT_CHANNELS;
    }
    
    renderChannelGrid();
}

function renderChannelGrid() {
    if (!listContainer) return;
    listContainer.innerHTML = "";
    channels.forEach((ch, index) => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerHTML = `<div style="font-weight:bold; color:#0078ff;">${index + 1}</div><div style="font-size:22px;">${ch.name}</div>`;
        listContainer.appendChild(div);
    });

    const last = localStorage.getItem('lastChannel') || 0;
    playChannel(parseInt(last));
}

/**
 * 3. PHÁT VIDEO (Cập nhật fix lỗi classList)
 */
async function playChannel(index) {
    if (!channels || !channels[index]) return;
    if (!video) return;

    video.pause();
    video.src = "";

    currentIndex = index;
    focusIndex = index;

    if (displayName && infoBanner) {
        displayName.innerText = channels[index].name;
        infoBanner.classList.add('show');
        setTimeout(() => { if (infoBanner) infoBanner.classList.remove('show'); }, 3000);
    }

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        if (hls) hls.destroy();
        hls = new Hls();
        hls.loadSource(channels[index].url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
        });
    }

    if (sidebar) sidebar.classList.remove('visible');
    localStorage.setItem('lastChannel', index);
    renderFocus();
}

function renderFocus() {
    const items = document.querySelectorAll('.channel-item');
    if (!items || items.length === 0) return;

    items.forEach((item, idx) => {
        if (item && item.classList) {
            item.classList.toggle('focused', idx === focusIndex);
            if (idx === focusIndex) item.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    });
}

/**
 * 4. XỬ LÝ PHÍM BẤM
 */
window.addEventListener('keydown', function (e) {
    let num = null;
    if (e.keyCode >= 48 && e.keyCode <= 57) num = e.keyCode - 48; // PC
    else if (e.keyCode >= 456 && e.keyCode <= 465) num = e.keyCode - 456; // TV

    if (num !== null) {
        inputNumber += num;
        if (digitDisplay) {
            digitDisplay.innerText = inputNumber;
            digitDisplay.style.display = 'block';
        }
        clearTimeout(numberTimeout);
        numberTimeout = setTimeout(() => {
            playChannel(parseInt(inputNumber) - 1);
            inputNumber = "";
            if (digitDisplay) digitDisplay.style.display = 'none';
        }, 1200);
        return;
    }

    const COLUMNS = 4;
    if (!sidebar) return;

    switch (e.keyCode) {
        case 38: // UP
            if (!sidebar.classList.contains('visible')) sidebar.classList.add('visible');
            else focusIndex = (focusIndex - COLUMNS >= 0) ? focusIndex - COLUMNS : focusIndex;
            renderFocus();
            break;
        case 40: // DOWN
            if (!sidebar.classList.contains('visible')) sidebar.classList.add('visible');
            else focusIndex = (focusIndex + COLUMNS < channels.length) ? focusIndex + COLUMNS : focusIndex;
            renderFocus();
            break;
        case 37: // LEFT
            if (sidebar.classList.contains('visible')) {
                focusIndex = (focusIndex > 0) ? focusIndex - 1 : 0;
                renderFocus();
            }
            break;
        case 39: // RIGHT
            if (sidebar.classList.contains('visible')) {
                focusIndex = (focusIndex < channels.length - 1) ? focusIndex + 1 : focusIndex;
                renderFocus();
            }
            break;
        case 13: // OK
            if (sidebar.classList.contains('visible')) playChannel(focusIndex);
            else sidebar.classList.add('visible');
            break;
        case 10009: // RETURN
            if (sidebar.classList.contains('visible')) sidebar.classList.remove('visible');
            else tizen.application.getCurrentApplication().exit();
            break;
    }
});

/**
 * 5. HÀM KHỞI TẠO (Được gọi từ loader.js)
 */
function initRemoteApp() {
    injectStyles();
    console.log("Remote App Initializing...");
    buildAppUI();
    // Đợi UI render xong mới load dữ liệu
    setTimeout(loadChannels, 200);
}

// Tự kích hoạt nếu chạy độc lập
window.onload = function() {
    initRemoteApp();
};
