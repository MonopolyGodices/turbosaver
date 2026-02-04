// الروابط من MainActivity.java
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
    langToggle: document.getElementById('langToggle'),
    langText: document.getElementById('langBtnText'),
    arrowIcon: document.getElementById('arrowIcon')
};

async function fetchVideo() {
    const url = dom.urlInput.value.trim();
    const t = translations[currentLang];

    if (!url) {
        showError(t.error_url);
        return;
    }

    setLoadingState(true);

    try {
        let apiUrl = url.includes("tiktok.com") 
            ? CONFIG.TIKTOK_API + encodeURIComponent(url)
            : CONFIG.SERVER_API + encodeURIComponent(url);

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        setLoadingState(false);

        if (url.includes("tiktok.com") && data.data) {
            renderResult({
                title: data.data.title || "TikTok Video",
                cover: data.data.cover,
                video: data.data.play.startsWith('http') ? data.data.play : `https://www.tikwm.com${data.data.play}`,
                audio: data.data.music
            });
        } else if (data.video_url || data.direct_url) {
            renderResult({
                title: data.title || "Video Content",
                cover: data.thumbnail || data.cover || CONFIG.FALLBACK_IMG,
                video: data.video_url || data.direct_url,
                audio: data.audio_url
            });
        } else {
            throw new Error();
        }
    } catch (e) {
        setLoadingState(false);
        showError(t.error_server);
    }
}

function renderResult(res) {
    const t = translations[currentLang];
    dom.resultArea.innerHTML = `
        <div class="p-4 sm:p-6">
            <div class="flex flex-col md:flex-row gap-6 items-center text-start">
                <img src="${res.cover}" class="w-32 h-32 object-cover rounded-xl border border-zinc-800 bg-zinc-900">
                <div class="flex-1 w-full">
                    <h3 class="font-bold text-lg mb-4 line-clamp-2">${res.title}</h3>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <a href="${res.video}" target="_blank" class="flex-1 bg-white text-black py-3 rounded-lg font-black text-center hover:bg-primary hover:text-white transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-download"></i> ${t.download_vid}
                        </a>
                        ${res.audio ? `
                        <a href="${res.audio}" target="_blank" class="bg-zinc-900 text-white py-3 px-6 rounded-lg font-bold text-center hover:border-primary border border-transparent transition flex items-center justify-center gap-2 text-xs">
                            <i class="fa-solid fa-music"></i> ${t.download_aud}
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    dom.resultArea.classList.remove('hidden');
}

function setLoadingState(isL) {
    dom.loader.style.display = isL ? 'block' : 'none';
    dom.downloadBtn.disabled = isL;
    dom.downloadBtn.style.opacity = isL ? '0.5' : '1';
    if (isL) dom.resultArea.classList.add('hidden');
}

function showError(msg) {
    dom.resultArea.innerHTML = `<div class="p-4 text-primary font-bold text-center text-sm">${msg}</div>`;
    dom.resultArea.classList.remove('hidden');
}

// تبديل اللغة والواجهة بالكامل
function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // تغيير الخصائص الجذرية
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    dom.langText.innerText = lang === 'ar' ? 'EN' : 'AR';
    
    // تحديث أيقونة السهم حسب الاتجاه
    dom.arrowIcon.className = lang === 'ar' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-down';

    // ترجمة النصوص
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });

    // ترجمة الـ Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    localStorage.setItem('turbo_lang', lang);
}

dom.downloadBtn.addEventListener('click', fetchVideo);
dom.langToggle.addEventListener('click', () => {
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

// الكشف التلقائي عن لغة المتصفح
window.onload = () => {
    const saved = localStorage.getItem('turbo_lang');
    if (saved) {
        setLanguage(saved);
    } else {
        const browserLang = (navigator.language || navigator.userLanguage).startsWith('ar') ? 'ar' : 'en';
        setLanguage(browserLang);
    }
};
