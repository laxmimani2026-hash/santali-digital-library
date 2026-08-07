// Global JS Application Script
document.addEventListener('DOMContentLoaded', () => {
  // Dark Mode Toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  }

  // Multi-Language Translations (Dictionary)
  const translations = {
    en: {
      nav_home: "Home", nav_browse: "Browse Books", nav_pricing: "Pricing", 
      nav_about: "About Us", nav_contact: "Contact", hero_title: "Empowering Santali Literature Globally",
      hero_sub: "Read, publish, and sell your eBooks effortlessly. Connecting writers and readers worldwide."
    },
    sat: {
      nav_home: "ᱚᱲᱟᱜ", nav_browse: "ᱯᱩᱛᱷᱤ ᱧᱮᱞ", nav_pricing: "ᱜᱚᱱᱚᱝ", 
      nav_about: "ᱟᱞᱮ ᱵᱟᱵᱚᱛ", nav_contact: "ᱥᱟᱹᱜᱟᱹᱭ", hero_title: "ᱥᱟᱱᱛᱟᱲᱤ ᱥᱟᱶᱦᱮᱫ ᱫᱷᱟᱹᱨᱛᱤ ᱡᱟᱠᱟᱛ ᱯᱟᱥᱱᱟᱣ",
      hero_sub: "ᱯᱩᱛᱷᱤ ᱯᱟᱲᱦᱟᱣ, ᱩᱪᱷᱟᱹᱱ ᱟᱨ ᱟᱹᱠᱷᱨᱤᱧ ᱟᱞᱜᱟ ᱛᱮ ᱾"
    },
    or: {
      nav_home: "ମୁଖ୍ୟ ପୃଷ୍ଠା", nav_browse: "ବହି ସମୂହ", nav_pricing: "ମୂଲ୍ୟ", 
      nav_about: "ଆମ ବିଷୟରେ", nav_contact: "ଯୋଗାଯୋଗ", hero_title: "ସାନ୍ତାଳୀ ସାହିତ୍ୟର ବିଶ୍ୱସ୍ତରୀୟ ପ୍ରସାର",
      hero_sub: "ଇ-ବୁକ୍ ପଢନ୍ତୁ, ପ୍ରକାଶ କରନ୍ତୁ ଏବଂ ବିକ୍ରି କରନ୍ତୁ easily।"
    },
    hi: {
      nav_home: "गृह", nav_browse: "पुस्तकें देखें", nav_pricing: "मूल्य निर्धारण", 
      nav_about: "हमारे बारे में", nav_contact: "संपर्क करें", hero_title: "संताली साहित्य का वैश्विक सशक्तिकरण",
      hero_sub: "ई-पुस्तकें आसानी से पढ़ें, प्रकाशित करें और बेचें।"
    }
  };

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      applyTranslations(selectedLang);
    });
  }

  function applyTranslations(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (dict[key]) element.textContent = dict[key];
    });
  }
});
