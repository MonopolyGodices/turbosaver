let currentLang = 'ar';

const translations = {
    ar: {
        nav_download: "تثبيت التطبيق",
        hero_title_1: "حمل فيديوهاتك",
        hero_title_2: "بسرعة توربو",
        hero_desc: "أداة قوية لتحميل الوسائط من تيك توك، فيسبوك، انستغرام، وتويتر (X).",
        btn_download: "تحميل",
        app_sec_title: "تطبيق الأندرويد الرسمي",
        app_sec_desc: "احصل على ميزات حصرية مثل حفظ حالات واتساب وسرعة تحميل مضاعفة.",
        btn_apk: "تنزيل APK مجاناً",
        footer_rights: "&copy; 2026 Turbo Saver. جميع الحقوق محفوظة.",
        error_url: "المرجو وضع رابط صحيح!",
        download_vid: "تحميل الفيديو",
        download_aud: "تحميل الصوت"
    },
    en: {
        nav_download: "Get App",
        hero_title_1: "Download Videos",
        hero_title_2: "At Turbo Speed",
        hero_desc: "Powerful tool to download media from TikTok, Facebook, Instagram, and Twitter (X).",
        btn_download: "Download",
        app_sec_title: "Official Android App",
        app_sec_desc: "Get exclusive features like WhatsApp Status saver and 2x faster downloads.",
        btn_apk: "Download APK Free",
        footer_rights: "&copy; 2026 Turbo Saver. All rights reserved.",
        error_url: "Please enter a valid URL!",
        download_vid: "Download Video",
        download_aud: "Download Audio"
    }
};

function updateLanguage() {
    const t = translations[currentLang];
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('langBtnText').innerText = currentLang === 'ar' ? 'English' : 'العربية';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });

    localStorage.setItem('turbo_lang', currentLang);
}