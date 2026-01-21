/**
 * SMART TV APP - TIZEN OS OPTIMIZED
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
let video, sidebar, listContainer, infoBanner, displayName;
let numberBuffer = ""; 
let numberTimer = null;

// --- TỐI ƯU CHO TIZEN: ĐĂNG KÝ PHÍM HỆ THỐNG ---
function registerTizenKeys() {
    if (window.tizen && tizen.tvinputdevice) {
        const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ChannelUp", "ChannelDown"];
        keys.forEach(key => {
            try { tizen.tvinputdevice.registerKey(key); } catch (e) {}
        });
    }
}

function handleNumberInput(num) {
    infoBanner.classList.add('show');
    numberBuffer += num;
    displayName.innerText = "CHỌN KÊNH: " + numberBuffer;

    clearTimeout(numberTimer);
    numberTimer = setTimeout(() => {
        const channelNum = parseInt(numberBuffer);
        const targetIndex = channelNum - 1;

        if (targetIndex >= 0 && targetIndex < channels.length) {
            playChannel(targetIndex);
        } else {
            displayName.innerText = "KÊNH " + channelNum + " KHÔNG TỒN TẠI";
            setTimeout(() => infoBanner.classList.remove('show'), 2000);
        }
        numberBuffer = "";
    }, 1500); 
}

async function loadChannels() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/huydangdh/mmm/refs/heads/main/mytv.json", { cache: "no-store" });
        channels = await res.json();
    } catch (e) { 
        channels = DEFAULT_CHANNELS; 
    }

    listContainer.innerHTML = channels.map((ch, i) => `
        <div class="channel-item" id="ch-${i}">
            <div class="ch-number">${i + 1}</div>
            <div class="ch-name">${ch.name}</div>
        </div>
    `).join('');

    const lastIdx = parseInt(localStorage.getItem('lastChannel')) || 0;
    playChannel(lastIdx);
}

function updateFocus() {
    document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('focused'));
    const currentEl = document.getElementById(`ch-${focusIndex}`);
    if (currentEl) {
        currentEl.classList.add('focused');
        const COLUMNS = 4;
        const ROW_HEIGHT = 170; 
        const currentRow = Math.floor(focusIndex / COLUMNS);
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
        hls = new Hls();
        hls.loadSource(channels[index].url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Hỗ trợ Native HLS (Tizen đời mới thường hỗ trợ tốt cái này)
        video.src = channels[index].url;
        video.play();
    }
    
    sidebar.classList.remove('visible');
    localStorage.setItem('lastChannel', index);
}

// --- XỬ LÝ SỰ KIỆN PHÍM TỔNG HỢP ---
window.addEventListener('keydown', (e) => {
    const key = e.keyCode || e.which;
    const isVisible = sidebar.classList.contains('visible');
    const COLUMNS = 4;

    // 1. Phím số (0-9)
    if (key >= 48 && key <= 57) {
        handleNumberInput(key - 48);
        return;
    }
    if (key >= 96 && key <= 105) { // Numpad
        handleNumberInput(key - 96);
        return;
    }

    // 2. Phím Back / Return (Tizen: 10009, Web: 27)
    if (key === 10009 || key === 27 || e.key === "Return" || e.key === "Backspace") {
        if (isVisible) {
            sidebar.classList.remove('visible');
            e.preventDefault();
        } else if (window.tizen) {
            tizen.application.getCurrentApplication().exit();
        }
        return;
    }

    // 3. Phím Enter (OK)
    if (key === 13 || e.key === "Enter") {
        if (!isVisible) {
            sidebar.classList.add('visible');
            updateFocus();
        } else {
            playChannel(focusIndex);
        }
        return;
    }

    // 4. Phím điều hướng
    if (!isVisible && [37, 38, 39, 40].includes(key)) {
        sidebar.classList.add('visible');
        updateFocus();
        return;
    }

    if (isVisible) {
        let newIndex = focusIndex;
        switch (key) {
            case 38: // Up
                if (focusIndex >= COLUMNS) newIndex -= COLUMNS; 
                break;
            case 40: // Down
                if (focusIndex + COLUMNS < channels.length) newIndex += COLUMNS; 
                break; 
            case 37: // Left
                if (focusIndex > 0) newIndex--; 
                break;
            case 39: // Right
                if (focusIndex < channels.length - 1) newIndex++; 
                break;
        }
        if (newIndex !== focusIndex) {
            focusIndex = newIndex;
            requestAnimationFrame(updateFocus);
        }
    }
});

// Giữ nguyên các hàm injectStyles, buildAppUI như cũ...
// Thêm registerTizenKeys vào window.onload
window.onload = function () {
    injectStyles();
    buildAppUI();
    loadChannels();
    registerTizenKeys();
};
