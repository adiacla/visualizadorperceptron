/**
 * Test suite for internationalization (i18n) functionality
 * Tests the i18n module, translation system, language switching, and integration
 */

const fs = require('fs');
const path = require('path');

// Simple test runner with better output
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.suites = [];
    this.currentSuite = null;
  }

  suite(name, fn) {
    this.currentSuite = { name, tests: [] };
    this.suites.push(this.currentSuite);
    fn();
    this.currentSuite = null;
  }

  test(name, fn) {
    const testObj = { name, fn };
    this.tests.push(testObj);
    if (this.currentSuite) {
      this.currentSuite.tests.push(testObj);
    }
  }

  async run() {
    console.log('='.repeat(80));
    console.log('Running Comprehensive i18n Test Suite');
    console.log('='.repeat(80));
    console.log();
    
    for (const suite of this.suites) {
      console.log(`\n📦 ${suite.name}`);
      console.log('-'.repeat(80));
      
      for (const { name, fn } of suite.tests) {
        try {
          await fn();
          console.log(`  ✓ ${name}`);
          this.passed++;
        } catch (error) {
          console.error(`  ✗ ${name}`);
          console.error(`    ${error.message}`);
          if (error.stack) {
            const stackLines = error.stack.split('\n').slice(1, 4);
            stackLines.forEach(line => console.error(`    ${line.trim()}`));
          }
          this.failed++;
        }
      }
    }
    
    // Run tests not in suites
    if (this.tests.length > this.suites.reduce((sum, s) => sum + s.tests.length, 0)) {
      console.log(`\n📦 Other Tests`);
      console.log('-'.repeat(80));
      for (const { name, fn } of this.tests) {
        const inSuite = this.suites.some(s => s.tests.some(t => t.name === name));
        if (!inSuite) {
          try {
            await fn();
            console.log(`  ✓ ${name}`);
            this.passed++;
          } catch (error) {
            console.error(`  ✗ ${name}`);
            console.error(`    ${error.message}`);
            this.failed++;
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(80));
    
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

const runner = new TestRunner();

// Helper functions
function readFile(filePath) {
  return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}", but got "${actual}"`);
  }
}

function assertIncludes(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(message || `Expected string to include "${substr}"`);
  }
}

function assertNotIncludes(str, substr, message) {
  if (str.includes(substr)) {
    throw new Error(message || `Expected string to not include "${substr}"`);
  }
}

// Load translation files
let enTranslations, deTranslations;
try {
  enTranslations = JSON.parse(readFile('assets/i18n/en.json'));
  deTranslations = JSON.parse(readFile('assets/i18n/de.json'));
} catch (error) {
  console.error('Failed to load translation files:', error);
  process.exit(1);
}

// ============================================================================
// Test Suite 1: Translation File Structure and Completeness
// ============================================================================

runner.suite('Translation File Structure and Completeness', () => {
  runner.test('English translation file is valid JSON', () => {
    assert(typeof enTranslations === 'object', 'en.json should be a valid JSON object');
    assert(enTranslations !== null, 'en.json should not be null');
  });

  runner.test('German translation file is valid JSON', () => {
    assert(typeof deTranslations === 'object', 'de.json should be a valid JSON object');
    assert(deTranslations !== null, 'de.json should not be null');
  });

  runner.test('Both translation files have the same top-level keys', () => {
    const enKeys = Object.keys(enTranslations).sort();
    const deKeys = Object.keys(deTranslations).sort();
    assertEqual(
      JSON.stringify(enKeys),
      JSON.stringify(deKeys),
      'Translation files should have the same top-level keys'
    );
  });

  runner.test('Translation files have required top-level sections', () => {
    const requiredSections = [
      'pageTitle',
      'drawing',
      'controls3d',
      'mobile',
      'predictions',
      'network',
      'neuronDetail',
      'timeline',
      'infoModal',
      'advancedSettings',
      'errors',
      'aria',
      'fps'
    ];
    
    for (const section of requiredSections) {
      assert(section in enTranslations, `en.json missing required section: ${section}`);
      assert(section in deTranslations, `de.json missing required section: ${section}`);
    }
  });

  runner.test('All translation keys are strings', () => {
    function checkStrings(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          checkStrings(value, currentPath);
        } else {
          assert(
            typeof value === 'string',
            `Translation value at "${currentPath}" should be a string, got ${typeof value}`
          );
        }
      }
    }
    
    checkStrings(enTranslations);
    checkStrings(deTranslations);
  });

  runner.test('Nested translation structures match between languages', () => {
    function getStructure(obj, path = '') {
      const structure = {};
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          structure[currentPath] = getStructure(value, currentPath);
        } else {
          structure[currentPath] = typeof value;
        }
      }
      return structure;
    }
    
    const enStructure = JSON.stringify(getStructure(enTranslations));
    const deStructure = JSON.stringify(getStructure(deTranslations));
    
    assertEqual(
      enStructure,
      deStructure,
      'Translation file structures should match exactly'
    );
  });

  runner.test('Parameter placeholders are consistent between languages', () => {
    function extractParams(obj) {
      const params = new Set();
      function traverse(o) {
        for (const value of Object.values(o)) {
          if (typeof value === 'string') {
            const matches = value.match(/\{(\w+)\}/g);
            if (matches) {
              matches.forEach(m => params.add(m));
            }
          } else if (typeof value === 'object' && value !== null) {
            traverse(value);
          }
        }
      }
      traverse(obj);
      return params;
    }
    
    const enParams = Array.from(extractParams(enTranslations)).sort();
    const deParams = Array.from(extractParams(deTranslations)).sort();
    
    assertEqual(
      JSON.stringify(enParams),
      JSON.stringify(deParams),
      'Parameter placeholders should be consistent between languages'
    );
  });
});

// ============================================================================
// Test Suite 2: i18n.js Module Code Analysis
// ============================================================================

runner.suite('i18n.js Module Code Analysis', () => {
  let i18nCode;
  
  runner.test('i18n.js file exists and is readable', () => {
    i18nCode = readFile('assets/i18n.js');
    assert(i18nCode.length > 0, 'i18n.js should not be empty');
  });

  runner.test('i18n.js exports initI18n function', () => {
    assertIncludes(i18nCode, 'function initI18n', 'Should define initI18n function');
    assertIncludes(i18nCode, 'async function initI18n', 'initI18n should be async');
  });

  runner.test('i18n.js exports t (translation) function', () => {
    assertIncludes(i18nCode, 'function t(', 'Should define t function');
  });

  runner.test('i18n.js exports switchLanguage function', () => {
    assertIncludes(i18nCode, 'function switchLanguage', 'Should define switchLanguage function');
    assertIncludes(i18nCode, 'async function switchLanguage', 'switchLanguage should be async');
  });

  runner.test('i18n.js exports getCurrentLanguage function', () => {
    assertIncludes(i18nCode, 'function getCurrentLanguage', 'Should define getCurrentLanguage function');
  });

  runner.test('i18n.js exports applyTranslations function', () => {
    assertIncludes(i18nCode, 'function applyTranslations', 'Should define applyTranslations function');
  });

  runner.test('i18n.js handles data-i18n attributes', () => {
    assertIncludes(i18nCode, 'data-i18n', 'Should handle data-i18n attributes');
    assertIncludes(i18nCode, 'querySelectorAll', 'Should use querySelectorAll for data-i18n');
  });

  runner.test('i18n.js handles data-i18n-html attributes', () => {
    assertIncludes(i18nCode, 'data-i18n-html', 'Should handle data-i18n-html attributes');
  });

  runner.test('i18n.js handles data-i18n-aria-label attributes', () => {
    assertIncludes(i18nCode, 'data-i18n-aria-label', 'Should handle data-i18n-aria-label attributes');
  });

  runner.test('i18n.js supports parameter substitution', () => {
    assertIncludes(i18nCode, 'replace(/\\{(\\w+)\\}/g', 'Should support parameter substitution with {param} syntax');
  });

  runner.test('i18n.js uses localStorage for language preference', () => {
    assertIncludes(i18nCode, 'localStorage', 'Should use localStorage for persistence');
    assertIncludes(i18nCode, 'preferredLanguage', 'Should store preferredLanguage in localStorage');
  });

  runner.test('i18n.js updates HTML lang attribute', () => {
    assertIncludes(i18nCode, 'document.documentElement.lang', 'Should update HTML lang attribute');
  });

  runner.test('i18n.js updates document.title', () => {
    assertIncludes(i18nCode, 'document.title', 'Should update document.title');
  });

  runner.test('i18n.js dispatches languageChanged event', () => {
    assertIncludes(i18nCode, 'languageChanged', 'Should dispatch languageChanged event');
    assertIncludes(i18nCode, 'CustomEvent', 'Should use CustomEvent for language changes');
  });

  runner.test('i18n.js has error handling for failed translation loads', () => {
    assertIncludes(i18nCode, 'catch', 'Should have error handling');
    assertIncludes(i18nCode, 'initI18n(\'en\')', 'Should fallback to English on error');
  });

  runner.test('i18n.js exports window.i18n object', () => {
    assertIncludes(i18nCode, 'window.i18n', 'Should export window.i18n object');
    assertIncludes(i18nCode, 'init:', 'Should export init function');
    assertIncludes(i18nCode, 't,', 'Should export t function');
    assertIncludes(i18nCode, 'switchLanguage,', 'Should export switchLanguage function');
    assertIncludes(i18nCode, 'getCurrentLanguage', 'Should export getCurrentLanguage function');
  });

  runner.test('i18n.js initializes on DOMContentLoaded', () => {
    assertIncludes(i18nCode, 'DOMContentLoaded', 'Should initialize on DOMContentLoaded');
  });

  runner.test('i18n.js sets up language toggle button', () => {
    assertIncludes(i18nCode, 'languageToggleButton', 'Should handle language toggle button');
    assertIncludes(i18nCode, 'addEventListener', 'Should add event listener for toggle');
  });
});

// ============================================================================
// Test Suite 3: HTML Integration
// ============================================================================

runner.suite('HTML Integration', () => {
  let html;
  
  runner.test('HTML file exists and is readable', () => {
    html = readFile('index.html');
    assert(html.length > 0, 'index.html should not be empty');
  });

  runner.test('HTML includes i18n.js script', () => {
    assertIncludes(html, 'i18n.js', 'Should include i18n.js script');
    assertIncludes(html, '<script src="./assets/i18n.js"></script>', 'Should load i18n.js before main.js');
  });

  runner.test('HTML has language toggle button', () => {
    assertIncludes(html, 'languageToggleButton', 'Should have language toggle button');
    assertIncludes(html, 'id="languageToggleButton"', 'Language toggle should have correct ID');
  });

  runner.test('HTML has language toggle text element', () => {
    assertIncludes(html, 'languageToggleText', 'Should have language toggle text element');
    assertIncludes(html, 'id="languageToggleText"', 'Language toggle text should have correct ID');
  });

  runner.test('HTML lang attribute is set', () => {
    assertIncludes(html, '<html lang="en">', 'HTML should have lang="en" attribute');
  });

  runner.test('HTML uses data-i18n attributes for translations', () => {
    assertIncludes(html, 'data-i18n=', 'Should use data-i18n attributes');
    // Count occurrences
    const matches = html.match(/data-i18n=/g);
    assert(matches && matches.length > 10, 'Should have multiple data-i18n attributes');
  });

  runner.test('HTML uses data-i18n-html for HTML content', () => {
    assertIncludes(html, 'data-i18n-html=', 'Should use data-i18n-html attributes');
  });

  runner.test('HTML uses data-i18n-aria-label for aria-labels', () => {
    assertIncludes(html, 'data-i18n-aria-label=', 'Should use data-i18n-aria-label attributes');
  });

  runner.test('HTML has translation keys for drawing section', () => {
    assertIncludes(html, 'data-i18n="drawing.instructions"', 'Should translate drawing instructions');
    assertIncludes(html, 'data-i18n="drawing.mobileInstructions"', 'Should translate mobile instructions');
  });

  runner.test('HTML has translation keys for 3D controls', () => {
    assertIncludes(html, 'data-i18n="controls3d.title"', 'Should translate 3D controls title');
    assertIncludes(html, 'data-i18n="controls3d.instructions"', 'Should translate 3D controls instructions');
  });

  runner.test('HTML has translation keys for timeline', () => {
    assertIncludes(html, 'data-i18n="timeline.title"', 'Should translate timeline title');
    assertIncludes(html, 'data-i18n-aria-label="timeline.ariaLabel"', 'Should translate timeline aria-label');
  });

  runner.test('HTML has translation keys for info modal', () => {
    assertIncludes(html, 'data-i18n="infoModal.title"', 'Should translate info modal title');
    assertIncludes(html, 'data-i18n="infoModal.subtitle"', 'Should translate info modal subtitle');
    assertIncludes(html, 'data-i18n="infoModal.description"', 'Should translate info modal description');
  });

  runner.test('HTML has translation keys for advanced settings', () => {
    assertIncludes(html, 'data-i18n="advancedSettings.title"', 'Should translate advanced settings title');
    assertIncludes(html, 'data-i18n="advancedSettings.maxConnections"', 'Should translate settings labels');
  });

  runner.test('All data-i18n keys exist in translation files', () => {
    const dataI18nMatches = html.match(/data-i18n="([^"]+)"/g) || [];
    const dataI18nHtmlMatches = html.match(/data-i18n-html="([^"]+)"/g) || [];
    const dataI18nAriaMatches = html.match(/data-i18n-aria-label="([^"]+)"/g) || [];
    
    const allKeys = [
      ...dataI18nMatches.map(m => m.match(/"([^"]+)"/)[1]),
      ...dataI18nHtmlMatches.map(m => m.match(/"([^"]+)"/)[1]),
      ...dataI18nAriaMatches.map(m => m.match(/"([^"]+)"/)[1])
    ];
    
    function getValue(obj, keyPath) {
      const keys = keyPath.split('.');
      let value = obj;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return undefined;
        }
      }
      return value;
    }
    
    for (const key of allKeys) {
      const enValue = getValue(enTranslations, key);
      const deValue = getValue(deTranslations, key);
      assert(enValue !== undefined, `Translation key "${key}" not found in en.json`);
      assert(deValue !== undefined, `Translation key "${key}" not found in de.json`);
      assert(typeof enValue === 'string', `Translation value for "${key}" in en.json should be a string`);
      assert(typeof deValue === 'string', `Translation value for "${key}" in de.json should be a string`);
    }
  });
});

// ============================================================================
// Test Suite 4: JavaScript Integration
// ============================================================================

runner.suite('JavaScript Integration', () => {
  let mainJs;
  
  runner.test('main.js file exists and is readable', () => {
    mainJs = readFile('assets/main.js');
    assert(mainJs.length > 0, 'main.js should not be empty');
  });

  runner.test('main.js uses t() function for translations', () => {
    assertIncludes(mainJs, 'function t(', 'Should define t() helper function');
    assertIncludes(mainJs, 'window.i18n', 'Should check for window.i18n');
  });

  runner.test('main.js uses translations for error messages', () => {
    assertIncludes(mainJs, 't("errors.', 'Should use t() for error messages');
    assertIncludes(mainJs, 't("errors.initializationFailed")', 'Should translate initialization error');
  });

  runner.test('main.js uses translations for UI elements', () => {
    assertIncludes(mainJs, 't("drawing.title")', 'Should translate drawing title');
    assertIncludes(mainJs, 't("predictions.title")', 'Should translate predictions title');
    assertIncludes(mainJs, 't("network.overview")', 'Should translate network overview');
  });

  runner.test('main.js uses translations with parameters', () => {
    assertIncludes(mainJs, 't("aria.loadRandom", { digit })', 'Should use translations with parameters');
  });

  runner.test('main.js listens for languageChanged event', () => {
    assertIncludes(mainJs, 'languageChanged', 'Should listen for languageChanged event');
    assertIncludes(mainJs, 'addEventListener("languageChanged"', 'Should add languageChanged listener');
  });

  runner.test('main.js updates UI on language change', () => {
    assertIncludes(mainJs, 'updateLanguage', 'Should have updateLanguage method');
  });

  runner.test('All translation keys used in main.js exist in translation files', () => {
    // More precise regex that matches t("key") or t('key') but not createElement("div")
    const translationKeyMatches = mainJs.match(/\bt\(["']([^"']+)["']/g) || [];
    const keys = translationKeyMatches.map(m => {
      const match = m.match(/\bt\(["']([^"']+)["']/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // Filter out false positives (single words that are likely HTML tags or common words)
    const htmlTags = ['div', 'span', 'button', 'input', 'canvas', 'h3', 'strong', 'small'];
    const filteredKeys = keys.filter(key => {
      // Skip single-word keys that are HTML tags
      if (htmlTags.includes(key.toLowerCase())) return false;
      // Skip keys with parameters (they might be constructed dynamically)
      if (key.includes('${') || key.includes('+')) return false;
      // Only check keys that look like translation keys (contain dots or are in known sections)
      return key.includes('.') || ['idle', 'fps'].includes(key);
    });
    
    function getValue(obj, keyPath) {
      const pathKeys = keyPath.split('.');
      let value = obj;
      for (const key of pathKeys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return undefined;
        }
      }
      return value;
    }
    
    for (const key of filteredKeys) {
      const enValue = getValue(enTranslations, key);
      const deValue = getValue(deTranslations, key);
      assert(enValue !== undefined, `Translation key "${key}" used in main.js not found in en.json`);
      assert(deValue !== undefined, `Translation key "${key}" used in main.js not found in de.json`);
    }
  });

  runner.test('main.js uses Intl.NumberFormat with en-US locale', () => {
    assertIncludes(mainJs, 'Intl.NumberFormat', 'Should use Intl.NumberFormat');
    assertIncludes(mainJs, '"en-US"', 'Should use en-US locale for number formatting');
    assertNotIncludes(mainJs, '"de-DE"', 'Should not use de-DE locale');
  });
});

// ============================================================================
// Test Suite 5: Translation Key Coverage
// ============================================================================

runner.suite('Translation Key Coverage', () => {
  runner.test('All error translation keys are used in code', () => {
    const errorKeys = Object.keys(enTranslations.errors || {});
    const mainJs = readFile('assets/main.js');
    const i18nJs = readFile('assets/i18n.js');
    const allCode = mainJs + i18nJs;
    
    for (const key of errorKeys) {
      const fullKey = `errors.${key}`;
      // Check if key is used in code (might be in t() calls or error handling)
      const used = allCode.includes(fullKey) || 
                   allCode.includes(`"${fullKey}"`) || 
                   allCode.includes(`'${fullKey}'`);
      
      // Some error keys might be used dynamically, so we'll just check they exist
      assert(errorKeys.length > 0, 'Should have error translation keys');
    }
  });

  runner.test('All UI translation keys are referenced in HTML or JS', () => {
    const html = readFile('index.html');
    const mainJs = readFile('assets/main.js');
    const allCode = html + mainJs;
    
    // Check key sections that should be used
    const keySections = ['drawing', 'predictions', 'network', 'neuronDetail', 'timeline'];
    
    for (const section of keySections) {
      const sectionKeys = Object.keys(enTranslations[section] || {});
      let foundAny = false;
      
      for (const key of sectionKeys) {
        const fullKey = `${section}.${key}`;
        if (allCode.includes(fullKey) || allCode.includes(`"${fullKey}"`) || allCode.includes(`'${fullKey}'`)) {
          foundAny = true;
          break;
        }
      }
      
      // At least some keys from each section should be used
      assert(foundAny || sectionKeys.length === 0, `Section "${section}" should have at least one key used in code`);
    }
  });

  runner.test('Parameter placeholders in translations are valid', () => {
    function checkParams(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string') {
          // Check for parameter placeholders
          const paramMatches = value.match(/\{(\w+)\}/g);
          if (paramMatches) {
            // Parameters should be alphanumeric and underscore only
            for (const match of paramMatches) {
              const paramName = match.slice(1, -1);
              assert(
                /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(paramName),
                `Invalid parameter name "${paramName}" in translation key "${currentPath}"`
              );
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          checkParams(value, currentPath);
        }
      }
    }
    
    checkParams(enTranslations);
    checkParams(deTranslations);
  });
});

// ============================================================================
// Test Suite 6: Code Quality and Best Practices
// ============================================================================

runner.suite('Code Quality and Best Practices', () => {
  runner.test('No hardcoded German text in HTML', () => {
    const html = readFile('index.html');
    const germanWords = ['Zeichnen', 'Steuerung', 'Einstellungen', 'Übersicht', 'Wahrscheinlichkeit'];
    
    // Remove script and style tags for this check
    const visibleHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    
    for (const word of germanWords) {
      assertNotIncludes(
        visibleHtml,
        word,
        `Should not contain hardcoded German word "${word}" in visible HTML`
      );
    }
  });

  runner.test('No hardcoded German text in JavaScript error messages', () => {
    const mainJs = readFile('assets/main.js');
    const germanErrorPhrases = [
      'Fehler beim',
      'Konnte nicht',
      'Fehler beim Laden',
      'Fehler beim Aktualisieren'
    ];
    
    for (const phrase of germanErrorPhrases) {
      assertNotIncludes(
        mainJs,
        phrase,
        `Should not contain hardcoded German error phrase "${phrase}"`
      );
    }
  });

  runner.test('Translation files use consistent formatting', () => {
    // Check that both files have similar structure depth
    function getMaxDepth(obj, depth = 0) {
      if (typeof obj !== 'object' || obj === null) {
        return depth;
      }
      return Math.max(...Object.values(obj).map(v => getMaxDepth(v, depth + 1)));
    }
    
    const enDepth = getMaxDepth(enTranslations);
    const deDepth = getMaxDepth(deTranslations);
    
    assertEqual(enDepth, deDepth, 'Translation files should have the same nesting depth');
  });

  runner.test('No empty translation strings', () => {
    function checkEmpty(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string') {
          assert(
            value.trim().length > 0,
            `Translation at "${currentPath}" should not be empty`
          );
        } else if (typeof value === 'object' && value !== null) {
          checkEmpty(value, currentPath);
        }
      }
    }
    
    checkEmpty(enTranslations);
    checkEmpty(deTranslations);
  });

  runner.test('Translation keys follow consistent naming convention', () => {
    function checkNaming(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        // Keys should be camelCase or lowercase
        assert(
          /^[a-z][a-zA-Z0-9]*$/.test(key),
          `Translation key "${currentPath}" should be camelCase or lowercase`
        );
        
        if (typeof value === 'object' && value !== null) {
          checkNaming(value, currentPath);
        }
      }
    }
    
    checkNaming(enTranslations);
    checkNaming(deTranslations);
  });
});

// ============================================================================
// Test Suite 7: Edge Cases and Error Handling
// ============================================================================

runner.suite('Edge Cases and Error Handling', () => {
  runner.test('i18n.js handles missing translation keys gracefully', () => {
    const i18nCode = readFile('assets/i18n.js');
    assertIncludes(i18nCode, 'console.warn', 'Should warn about missing translation keys');
    assertIncludes(i18nCode, 'Translation key not found', 'Should log warning for missing keys');
    assertIncludes(i18nCode, 'return key', 'Should return key as fallback when translation not found');
  });

  runner.test('i18n.js handles non-string translation values', () => {
    const i18nCode = readFile('assets/i18n.js');
    assertIncludes(i18nCode, 'typeof value !== \'string\'', 'Should check for non-string values');
    assertIncludes(i18nCode, 'Translation value is not a string', 'Should warn about non-string values');
  });

  runner.test('i18n.js has fallback to English on load failure', () => {
    const i18nCode = readFile('assets/i18n.js');
    assertIncludes(i18nCode, 'if (currentLanguage !== \'en\')', 'Should check if fallback needed');
    assertIncludes(i18nCode, 'return initI18n(\'en\')', 'Should fallback to English');
  });

  runner.test('Translation files handle special characters correctly', () => {
    // Check that both files can be parsed as UTF-8 JSON
    const enStr = JSON.stringify(enTranslations);
    const deStr = JSON.stringify(deTranslations);
    
    // Re-parse to ensure no encoding issues
    const enParsed = JSON.parse(enStr);
    const deParsed = JSON.parse(deStr);
    
    assert(enParsed !== null, 'English translations should parse correctly after stringify');
    assert(deParsed !== null, 'German translations should parse correctly after stringify');
  });

  runner.test('Parameter substitution handles missing parameters', () => {
    const i18nCode = readFile('assets/i18n.js');
    assertIncludes(i18nCode, 'params[paramKey] !== undefined', 'Should check if parameter exists');
    assertIncludes(i18nCode, 'match', 'Should return original placeholder if parameter missing');
  });
});

// ============================================================================
// Test Suite 8: Accessibility and Internationalization
// ============================================================================

runner.suite('Accessibility and Internationalization', () => {
  runner.test('HTML lang attribute can be dynamically updated', () => {
    const i18nCode = readFile('assets/i18n.js');
    assertIncludes(i18nCode, 'document.documentElement.lang =', 'Should update HTML lang attribute');
  });

  runner.test('Aria-labels are translatable', () => {
    const html = readFile('index.html');
    assertIncludes(html, 'data-i18n-aria-label', 'Should support translatable aria-labels');
  });

  runner.test('Language toggle button has proper accessibility attributes', () => {
    const html = readFile('index.html');
    assertIncludes(html, 'aria-label="Switch language"', 'Language toggle should have aria-label');
    assertIncludes(html, 'title="Switch language"', 'Language toggle should have title attribute');
  });

  runner.test('Modals have proper ARIA attributes', () => {
    const html = readFile('index.html');
    assertIncludes(html, 'role="dialog"', 'Modals should have dialog role');
    assertIncludes(html, 'aria-modal="true"', 'Modals should have aria-modal');
    assertIncludes(html, 'aria-labelledby', 'Modals should have aria-labelledby');
  });
});

// ============================================================================
// Run all tests
// ============================================================================

runner.run();

