// الثوابت المستمدة من MainActivity.java
const CONFIG = {
    SERVER_API: "https://turbo-saver-api.onrender.com/direct?url=",
    TIKTOK_API: "https://www.tikwm.com/api/?url=",
    FALLBACK_IMG: "https://via.placeholder.com/400x200/0a0a0a/E91E63?text=Turbo+Saver"
};

const dom = {
    urlInput: document.getElementById('urlInput'),
    downloadBtn: document.getElementById('downloadBtn'),
    loader: document.getElementById('loader'),
    resultArea: document.getElementById('resultArea'),
    langToggle: document.getElementById('langToggle')
};

async function fetchVideo() {
    const url = dom.urlInput.value.trim();
    const t = translations[currentLang];

    if (!url) {
        showError(t.error_url);
        return;
    }

    // تهيئة حالة التحميل
    toggleLoading(true);

    try {
        let finalApi = "";
        const isTikTok = url.includes("tiktok.com");

        if (isTikTok) {
            finalApi = CONFIG.TIKTOK_API + encodeURIComponent(url);
        } else {
            finalApi = CONFIG.SERVER_API + encodeURIComponent(url);
        }

        const response = await fetch(finalApi);
        if (!response.ok) throw new Error("API_ERROR");
        const data = await response.json();
        
        toggleLoading(false);

        if (isTikTok && data.data) {
            displayResults({
                title: data.data.title || "TikTok Video",
                cover: data.data.cover,
                video: data.data.play.startsWith('http') ? data.data.play : `https://www.tikwm.com${data.data.play}`,
                audio: data.data.music
            });
        } else if (!isTikTok && (data.video_url || data.direct_url)) {
            displayResults({
                title: data.title || "Social Media Content",
                cover: data.thumbnail || data.cover || CONFIG.FALLBACK_IMG,
                video: data.video_url || data.direct_url,
                audio: data.audio_url
            });
        } else {
            throw new Error("EMPTY_DATA");
        }

    } catch (e) {
        toggleLoading(false);
        showError(currentLang === 'ar' ? "الرابط غير مدعوم حالياً أو السيرفر مشغول. جرب تطبيقنا الرسمي!" : "URL not supported or server busy. Try our official App!");
    }
}

function displayResults(res) {
    const t = translations[currentLang];
    dom.resultArea.innerHTML = `
        <div class="p-6 text-right">
            <div class="flex flex-col md:flex-row gap-6 items-center">
                <div class="relative group w-full md:w-48">
                    <img src="${res.cover}" class="w-full h-48 object-cover rounded-2xl border border-zinc-800">
                    <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center">
                        <i class="fa-solid fa-play text-white text-3xl"></i>
                    </div>
                </div>
                <div class="flex-1 w-full">
                    <h3 class="font-bold text-xl mb-6 leading-snug">${res.title}</h3>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <a href="${res.video}" target="_blank" class="flex-1 bg-white text-black py-3 rounded-xl font-black text-center hover:bg-primary hover:text-white transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-cloud-arrow-down"></i> ${t.download_vid}
                        </a>
                        ${res.audio ? `
                        <a href="${res.audio}" target="_blank" class="bg-zinc-900 border border-zinc-800 text-white py-3 px-6 rounded-xl font-bold text-center hover:border-primary transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-music"></i> ${t.download_aud}
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    dom.resultArea.classList.remove('hidden');
}

function toggleLoading(isLoading) {
    dom.loader.style.display = isLoading ? 'block' : 'none';
    dom.downloadBtn.disabled = isLoading;
    dom.downloadBtn.style.opacity = isLoading ? '0.5' : '1';
    if (isLoading) dom.resultArea.classList.add('hidden');
}

function showError(msg) {
    dom.resultArea.innerHTML = `<div class="p-4 text-primary font-bold text-center">${msg}</div>`;
    dom.resultArea.classList.remove('hidden');
}

// Events
dom.downloadBtn.addEventListener('click', fetchVideo);
dom.langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    updateUI();
});

function updateUI() {
    const t = translations[currentLang];
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('langBtnText').innerText = currentLang === 'ar' ? 'EN' : 'AR';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });
    localStorage.setItem('turbo_lang', currentLang);
}

window.addEventListener('DOMContentLoaded', () => {
    currentLang = localStorage.getItem('turbo_lang') || 'ar';
    updateUI();
});
