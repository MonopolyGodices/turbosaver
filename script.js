/**
 * Turbo Saver - Core Logic
 * Author: Mohammed Amine
 * Year: 2026
 */

const CONFIG = {
    SERVER_API: "https://turbo-saver-api.onrender.com/direct?url=",
    TIKTOK_API: "https://www.tikwm.com/api/?url=",
    FALLBACK_IMG: "https://via.placeholder.com/600x400/0a0a0a/E91E63?text=Turbo+Saver"
};

const dom = {
    urlInput: document.getElementById('urlInput'),
    downloadBtn: document.getElementById('downloadBtn'),
    loader: document.getElementById('loader'),
    resultArea: document.getElementById('resultArea'),
    langToggle: document.getElementById('langToggle'),
    langText: document.getElementById('langBtnText')
};

let currentLang = localStorage.getItem('turbo_lang') || 'ar';

// تهيئة اللغات عند التشغيل
function initApp() {
    setLanguage(currentLang);
}

async function fetchVideo() {
    const url = dom.urlInput.value.trim();
    const t = translations[currentLang];

    if (!url || !url.startsWith('http')) {
        showStatus(t.error_url, 'error');
        return;
    }

    toggleLoading(true);

    try {
        let apiUrl = "";
        if (url.includes("tiktok.com")) {
            apiUrl = CONFIG.TIKTOK_API + encodeURIComponent(url);
        } else {
            apiUrl = CONFIG.SERVER_API + encodeURIComponent(url);
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network issues");
        
        const data = await response.json();
        toggleLoading(false);

        // معالجة بيانات تيك توك
        if (url.includes("tiktok.com") && data.data) {
            renderResult({
                title: data.data.title || "TikTok Video",
                cover: data.data.cover,
                video: data.data.play.startsWith('http') ? data.data.play : `https://www.tikwm.com${data.data.play}`,
                audio: data.data.music
            });
        } 
        // معالجة بيانات السيرفر العام
        else if (data.video_url || data.direct_url || data.url) {
            renderResult({
                title: data.title || "Social Media Video",
                cover: data.thumbnail || data.cover || CONFIG.FALLBACK_IMG,
                video: data.video_url || data.direct_url || data.url,
                audio: data.audio_url || null
            });
        } else {
            throw new Error("No video found");
        }

    } catch (e) {
        console.error(e);
        toggleLoading(false);
        showStatus(t.error_server, 'error');
    }
}

function renderResult(res) {
    const t = translations[currentLang];
    dom.resultArea.innerHTML = `
        <div class="bg-black/50 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
            <div class="relative group">
                <img src="${res.cover}" class="w-40 h-40 object-cover rounded-xl border border-zinc-700 shadow-lg" onerror="this.src='${CONFIG.FALLBACK_IMG}'">
                <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <i class="fa-solid fa-play text-3xl"></i>
                </div>
            </div>
            <div class="flex-1 text-center md:text-start">
                <h3 class="text-xl font-bold mb-4 line-clamp-2 text-white">${res.title}</h3>
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="${res.video}" target="_blank" class="flex-1 bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                        <i class="fa-solid fa-cloud-arrow-down"></i> ${t.download_vid}
                    </a>
                    ${res.audio ? `
                    <a href="${res.audio}" target="_blank" class="bg-zinc-900 text-gray-300 py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 border border-zinc-800 hover:border-primary transition-all">
                        <i class="fa-solid fa-music"></i> ${t.download_aud}
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;
    dom.resultArea.classList.remove('hidden');
    dom.resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleLoading(isLoading) {
    dom.loader.style.display = isLoading ? 'block' : 'none';
    dom.downloadBtn.disabled = isLoading;
    dom.downloadBtn.style.opacity = isLoading ? '0.6' : '1';
    if (isLoading) dom.resultArea.classList.add('hidden');
}

function showStatus(msg, type) {
    dom.resultArea.innerHTML = `
        <div class="p-5 rounded-2xl border ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'} font-bold text-center">
            <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} mr-2"></i> ${msg}
        </div>
    `;
    dom.resultArea.classList.remove('hidden');
}

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    dom.langText.innerText = lang === 'ar' ? 'EN' : 'AR';
    
    // أيقونة الرابط تتحرك حسب الاتجاه
    const icon = document.querySelector('.icon-dir');
    if (lang === 'ar') {
        icon.style.right = '20px';
        icon.style.left = 'auto';
    } else {
        icon.style.left = '20px';
        icon.style.right = 'auto';
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    localStorage.setItem('turbo_lang', lang);
}

// Events
dom.downloadBtn.addEventListener('click', fetchVideo);
dom.urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchVideo(); });
dom.langToggle.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'en' : 'ar'));

// Run on load
window.onload = initApp;
