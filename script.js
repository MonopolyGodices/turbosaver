// الروابط المستخرجة من MainActivity.java الخاص بك
const MY_SERVER_API = "https://turbo-saver-api.onrender.com/direct?url=";
const TIKTOK_FREE_API = "https://www.tikwm.com/api/?url=";

const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('resultArea');
const langToggle = document.getElementById('langToggle');

// دالة التحميل الرئيسية
async function fetchVideo() {
    const url = urlInput.value.trim();
    const t = translations[currentLang];

    if (!url) {
        alert(t.error_url);
        return;
    }

    // تجهيز الواجهة
    loader.style.display = 'block';
    resultArea.classList.add('hidden');
    resultArea.innerHTML = '';
    downloadBtn.disabled = true;

    try {
        let apiUrl = "";
        const isTikTok = url.includes("tiktok.com");

        // اتباع نفس منطق تطبيق الأندرويد المرفق
        if (isTikTok) {
            apiUrl = TIKTOK_FREE_API + encodeURIComponent(url);
        } else {
            apiUrl = MY_SERVER_API + encodeURIComponent(url);
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        loader.style.display = 'none';
        downloadBtn.disabled = false;

        if (isTikTok && data.data) {
            renderResult({
                title: data.data.title || "TikTok Video",
                cover: data.data.cover,
                video: data.data.play.startsWith('http') ? data.data.play : `https://www.tikwm.com${data.data.play}`,
                audio: data.data.music
            });
        } else if (!isTikTok && (data.video_url || data.direct_url)) {
            renderResult({
                title: data.title || "Social Video",
                cover: data.thumbnail || data.cover || 'https://via.placeholder.com/400x200/1E1E1E/E91E63?text=Turbo+Saver',
                video: data.video_url || data.direct_url,
                audio: data.audio_url
            });
        } else {
            throw new Error("No data found");
        }

    } catch (e) {
        loader.style.display = 'none';
        downloadBtn.disabled = false;
        resultArea.innerHTML = `<div class="p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50">حدث خطأ في السيرفر. يرجى التأكد من الرابط أو المحاولة لاحقاً.</div>`;
        resultArea.classList.remove('hidden');
    }
}

function renderResult(res) {
    const t = translations[currentLang];
    resultArea.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 items-center text-right">
            <img src="${res.cover}" class="w-32 h-32 object-cover rounded-lg shadow-xl bg-black">
            <div class="flex-1">
                <h3 class="font-bold text-lg mb-4 line-clamp-2">${res.title}</h3>
                <div class="flex gap-3 flex-wrap">
                    <a href="${res.video}" target="_blank" class="bg-primary px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"> 
                        <i class="fa-solid fa-video"></i> ${t.download_vid}
                    </a>
                    ${res.audio ? `<a href="${res.audio}" target="_blank" class="bg-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition"><i class="fa-solid fa-music"></i> ${t.download_aud}</a>` : ''}
                </div>
            </div>
        </div>`;
    resultArea.classList.remove('hidden');
}

// الأحداث (Events)
downloadBtn.addEventListener('click', fetchVideo);
langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    updateLanguage();
});

// عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('turbo_lang') || 'ar';
    currentLang = savedLang;
    updateLanguage();
});