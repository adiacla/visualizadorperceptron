/**
 * Internationalization (i18n) module
 * Handles language switching and translation
 */

let currentLanguage = 'en';
let translations = {};

/**
 * Initialize i18n system
 * @param {string} lang - Language code ('en' or 'de')
 */
async function initI18n(lang = 'en') {
  currentLanguage = lang || 'en';
  
  try {
    const response = await fetch(`./assets/i18n/${currentLanguage}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${currentLanguage}`);
    }
    translations = await response.json();
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update page title
    document.title = translations.pageTitle || 'MNIST MLP – Inference Visualization';
    
    // Apply translations to all elements with data-i18n attribute
    applyTranslations();
    
    // Save language preference
    localStorage.setItem('preferredLanguage', currentLanguage);
    
    return translations;
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback to English if translation file fails to load
    if (currentLanguage !== 'en') {
      return initI18n('en');
    }
    throw error;
  }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (supports dot notation, e.g., "drawing.title")
 * @param {object} params - Parameters to replace in translation (e.g., {digit: 5})
 * @returns {string} Translated string
 */
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string for key: ${key}`);
    return key;
  }
  
  // Replace parameters in the format {param}
  if (params && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  
  return value;
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    // Handle different element types
    if (element.tagName === 'INPUT' && element.type === 'text') {
      element.value = translation;
    } else if (element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', translation);
    } else if (element.hasAttribute('placeholder')) {
      element.placeholder = translation;
    } else if (element.hasAttribute('title')) {
      element.title = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  // Handle elements with data-i18n-html for HTML content
  const htmlElements = document.querySelectorAll('[data-i18n-html]');
  htmlElements.forEach(element => {
    const key = element.getAttribute('data-i18n-html');
    const translation = t(key);
    element.innerHTML = translation;
  });
  
  // Handle elements with data-i18n-aria-label for aria-label attributes
  const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
  ariaLabelElements.forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    const translation = t(key);
    element.setAttribute('aria-label', translation);
  });
  
  // Update language toggle button text
  const languageToggleText = document.getElementById('languageToggleText');
  if (languageToggleText) {
    languageToggleText.textContent = currentLanguage.toUpperCase();
  }
}

/**
 * Switch language
 * @param {string} lang - Language code ('en' or 'de')
 */
async function switchLanguage(lang) {
  if (lang === currentLanguage) return;
  await initI18n(lang);
  
  // Trigger custom event for components that need to update
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
  return currentLanguage;
}

// Load saved language preference on initialization
document.addEventListener('DOMContentLoaded', () => {
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
  initI18n(savedLanguage).catch(error => {
    console.error('Failed to initialize i18n:', error);
  });
  
  // Setup language toggle button
  const languageToggleButton = document.getElementById('languageToggleButton');
  if (languageToggleButton) {
    languageToggleButton.addEventListener('click', () => {
      const currentLang = getCurrentLanguage();
      const newLang = currentLang === 'en' ? 'de' : 'en';
      switchLanguage(newLang);
    });
  }
});

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.i18n = {
    init: initI18n,
    t,
    switchLanguage,
    getCurrentLanguage,
    applyTranslations
  };
}

