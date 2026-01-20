/**
 * SMART TV APP - FULL JS DOM GENERATION
 * Tối ưu: Không cần HTML, Tự động dựng giao diện, Hỗ trợ Remote Samsung
 */

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

// Biến giữ các element được tạo bằng JS
let video, sidebar, listContainer, digitDisplay, infoBanner, displayName;

/**
 * 1. DỰNG GIAO DIỆN BẰNG JAVASCRIPT
 */
function buildAppUI() {
    const root = document.getElementById('app-root');
    if (!root) return;

    // Tạo Video Player
    video = document.createElement('video');
    video.id = 'main-player';
    video.autoplay = true;
    root.appendChild(video);

    // Tạo Banner thông tin kênh
    infoBanner = document.createElement('div');
    infoBanner.id = 'channel-info';
    displayName = document.createElement('h1');
    displayName.id = 'display-name';
    infoBanner.appendChild(displayName);
    root.appendChild(infoBanner);

    // Tạo Banner số kênh khi bấm phím
    digitDisplay = document.createElement('div');
    digitDisplay.id = 'digit-display';
    root.appendChild(digitDisplay);

    // Tạo Sidebar (Lưới kênh)
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

    console.log("UI Generation: Hoàn tất.");
}

/**
 * 2. TẢI DỮ LIỆU & ĐĂNG KÝ PHÍM
 */
async function loadChannels() {
    // Đăng ký phím Remote Tizen (Nếu chạy trên TV thật)
    try {
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Search"].forEach(key => {
            tizen.tvinputdevice.registerKey(key);
        });
    } catch(e) {}

    try {
        const response = await fetch("https://raw.githubusercontent.com/huydangdh/mmm/refs/heads/main/mytv.json", { cache: "no-store" });
        channels = await response.json();
    } catch (e) {
        channels = DEFAULT_CHANNELS;
    }
    
    renderChannelGrid();
}

/**
 * 3. RENDER DANH SÁCH KÊNH VÀO GRID
 */
function renderChannelGrid() {
    listContainer.innerHTML = "";
    channels.forEach((ch, index) => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerHTML = `
            <div style="font-weight:bold; color:#0078ff;">${index + 1}</div>
            <div style="font-size:22px; margin-top:5px;">${ch.name}</div>
        `;
        listContainer.appendChild(div);
    });

    const last = localStorage.getItem('lastChannel') || 0;
    playChannel(parseInt(last));
}

/**
 * 4. LOGIC PHÁT VIDEO
 */
async function playChannel(index) {
    if (!channels[index]) return;
    
    // Ngắt dòng cũ triệt để
    video.pause();
    video.src = "";
    video.load();

    currentIndex = index;
    focusIndex = index;

    // Cập nhật Banner
    displayName.innerText = channels[index].name;
    infoBanner.classList.add('show');
    setTimeout(() => infoBanner.classList.remove('show'), 3000);

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        if (hls) {
            hls.detachMedia();
            hls.destroy();
        }
        // Bật worker: true trên Tizen 6.0 nếu đã sửa CSP
        hls = new Hls({ enableWorker: true }); 
        hls.loadSource(channels[index].url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {}); 
            }
        });
    }

    sidebar.classList.remove('visible');
    localStorage.setItem('lastChannel', index);
    renderFocus();
}

function renderFocus() {
    const items = document.querySelectorAll('.channel-item');
    items.forEach((item, idx) => {
        item.classList.toggle('focused', idx === focusIndex);
        if (idx === focusIndex) item.scrollIntoView({ block: 'center' });
    });
}

/**
 * 5. XỬ LÝ SỰ KIỆN PHÍM BẤM
 */
window.addEventListener('keydown', function (e) {
    // Xử lý phím số (Bàn phím PC: 48-57, Remote Tizen: 456-465)
    let num = null;
    if (e.keyCode >= 48 && e.keyCode <= 57) num = e.keyCode - 48;
    else if (e.keyCode >= 456 && e.keyCode <= 465) num = e.keyCode - 456;

    if (num !== null) {
        inputNumber += num;
        digitDisplay.innerText = inputNumber;
        digitDisplay.style.display = 'block';
        clearTimeout(numberTimeout);
        numberTimeout = setTimeout(() => {
            playChannel(parseInt(inputNumber) - 1);
            inputNumber = "";
            digitDisplay.style.display = 'none';
        }, 1200);
        return;
    }

    const COLUMNS = 4;
    switch (e.keyCode) {
        case 38: // UP
            if (!sidebar.classList.contains('visible')) { sidebar.classList.add('visible'); }
            else { focusIndex = (focusIndex - COLUMNS >= 0) ? focusIndex - COLUMNS : focusIndex; }
            renderFocus();
            break;
        case 40: // DOWN
            if (!sidebar.classList.contains('visible')) { sidebar.classList.add('visible'); }
            else { focusIndex = (focusIndex + COLUMNS < channels.length) ? focusIndex + COLUMNS : focusIndex; }
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
        case 10009: // RETURN (Tizen)
            if (sidebar.classList.contains('visible')) sidebar.classList.remove('visible');
            else tizen.application.getCurrentApplication().exit();
            break;
    }
});

/**
 * 6. CHẠY APP
 */
window.onload = () => {
    buildAppUI();
    loadChannels();
};
