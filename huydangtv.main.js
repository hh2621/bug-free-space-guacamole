/**
 * SMART TV APP - SYMMETRICAL UI (BỐ CỤC ĐỒNG ĐỀU)
 */

const DEFAULT_CHANNELS = [
    { "name": "VTV1 HD", "url": "https://live.fptplay53.net/fnxch2/vtv1hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV2 HD", "url": "https://live.fptplay53.net/fnxhd1/vtv2_vhls.smil/chunklist_b5000000.m3u8" },
    { "name": "VTV3 HD", "url": "https://live.fptplay53.net/fnxch2/vtv3hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV4 HD", "url": "https://live.fptplay53.net/fnxch2/vtv4hd_abr.smil/chunklist.m3u8" },
    { "name": "VTV5 HD", "url": "https://live.fptplay53.net/epzch2/vtv5hd_abr.smil/chunklist.m3u8" },
    { "name": "ANTV", "url": "https://live.fptplay53.net/fnxhd2/anninhtv_vhls.smil/chunklist.m3u8" }
];

let channels = [];
let focusIndex = 0;
let hls = null;
let isMoving = false;
let video, sidebar, listContainer, infoBanner, displayName;

async function loadChannels() {

    try {

        const res = await fetch("https://raw.githubusercontent.com/huydangdh/mmm/refs/heads/main/mytv.json", { cache: "no-store" });

        channels = await res.json();

    } catch (e) { channels = DEFAULT_CHANNELS; }


    listContainer.innerHTML = channels.map((ch, i) => `

<div class="channel-item" id="ch-${i}">

<div class="ch-number">${i + 1}</div>

<div class="ch-name">${ch.name}</div>

</div>

`).join('');

    playChannel(parseInt(localStorage.getItem('lastChannel')) || 0);

}

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body { margin: 0; background: #000; overflow: hidden; font-family: "Segoe UI", sans-serif; }
        #main-player { width: 100vw; height: 100vh; background: #000; }
        
        #sidebar { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.92); display: none; z-index: 100;
            flex-direction: column; align-items: center;
        }
        #sidebar.visible { display: flex; }

        .menu-header {
            color: #fff; font-size: 42px; margin: 40px 0; 
            font-weight: bold; letter-spacing: 2px;
        }

        #list-window {
            width: 90%; height: 75vh; overflow: hidden; padding:8px;
            position: relative; /* Tạo context riêng */
        }
        
        #channel-list { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            width: 100%; 
            /* Tối ưu quan trọng nhất: Chuyển động bằng GPU */
            will-change: transform;
            transform: translate3d(0, 0, 0);
            transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .channel-item { 
            background: rgba(255, 255, 255, 0.1); 
            color: #ccc; 
            height: 150px;
            border-radius: 25px;
            border: 4px solid transparent;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            box-sizing: border-box;
            /* Hạn chế layout trashing */
            contain: content; 
        }

        .channel-item.focused { 
            background: #034EA2; 
            color: #fff; 
            border-color: #ffffff;
            transform: scale(1.02); /* Phóng nhẹ để tạo cảm giác focus mượt */
        }

        .ch-number { font-size: xx-large; font-weight: bold; color: #0078ff; }
        .focused .ch-number { color: #fff; }
        .ch-name { font-size: xx-large; padding: 0 10px; text-align: center; }

        #channel-info { 
            position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%);
            background: #034EA2; padding: 15px 50px; border-radius: 50px;
            color: #fff; display: none; z-index: 200;
        }
        #channel-info.show { display: block; }
    `;
    document.head.appendChild(style);
}

function buildAppUI() {
    const root = document.getElementById('app-root') || document.body;
    root.innerHTML = `
        <video id="main-player" autoplay></video>
        <div id="channel-info"><h1 id="display-name"></h1></div>
        <div id="sidebar">
            <div class="menu-header">DANH SÁCH KÊNH</div>
            <div id="list-window"><div id="channel-list"></div></div>
        </div>
    `;
    video = document.getElementById('main-player');
    sidebar = document.getElementById('sidebar');
    listContainer = document.getElementById('channel-list');
    infoBanner = document.getElementById('channel-info');
    displayName = document.getElementById('display-name');
}

function updateFocus() {
    // Tối ưu: Chỉ tác động lên class 'focused' cũ và mới thay vì duyệt toàn bộ danh sách
    const prevFocused = document.querySelector('.channel-item.focused');
    if (prevFocused) prevFocused.classList.remove('focused');

    const currentEl = document.getElementById(`ch-${focusIndex}`);
    if (currentEl) {
        currentEl.classList.add('focused');

        // Tính toán vị trí cuộn
        const COLUMNS = 4;
        const ROW_HEIGHT = 170; // Chiều cao item + gap
        const currentRow = Math.floor(focusIndex / COLUMNS);

        // Luôn giữ item được focus nằm ở vùng nhìn thấy (tối ưu chuyển động)
        const scrollY = currentRow * ROW_HEIGHT;
        listContainer.style.transform = `translate3d(0, -${scrollY}px, 0)`;
    }
}

function playChannel(index) {
    if (!channels[index]) return;
    focusIndex = index;
    displayName.innerText = channels[index].name;
    infoBanner.classList.add('show');
    clearTimeout(window.infoTimer);
    window.infoTimer = setTimeout(() => infoBanner.classList.remove('show'), 3000);

    if (hls) hls.destroy();
    if (Hls.isSupported()) {
        hls = new Hls({ capLevelToPlayerSize: true });
        hls.loadSource(channels[index].url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
          video.muted = false;
          video.play();
        });

    }
    sidebar.classList.remove('visible');
    localStorage.setItem('lastChannel', index);
}

window.addEventListener('keydown', (e) => {
    const COLUMNS = 4;
    const isVisible = sidebar.classList.contains('visible');

    // Tizen Back Button
    if (e.keyCode === 10009 || e.keyCode === 27) {
        if (isVisible) sidebar.classList.remove('visible');
        else if (window.tizen) tizen.application.getCurrentApplication().exit();
        return;
    }

    if (!isVisible) {
        if ([37, 38, 39, 40, 13].includes(e.keyCode)) {
            sidebar.classList.add('visible');
            updateFocus();
        }
        return;
    }

    // Xử lý di chuyển
    let newIndex = focusIndex;
    switch (e.keyCode) {
        case 38: if (focusIndex >= COLUMNS) newIndex -= COLUMNS; break; // Up
        case 40: if (focusIndex + COLUMNS < channels.length) newIndex += COLUMNS; break; // Down
        case 37: if (focusIndex > 0) newIndex--; break; // Left
        case 39: if (focusIndex < channels.length - 1) newIndex++; break; // Right
        case 13: playChannel(focusIndex); return; // Enter
    }

    if (newIndex !== focusIndex) {
        focusIndex = newIndex;
        // Sử dụng requestAnimationFrame để đảm bảo mượt mà trên màn hình TV
        requestAnimationFrame(updateFocus);
    }
});
window.onload = function () {
    injectStyles();
    buildAppUI();
    loadChannels();
};
