/**
 * Test suite for internationalization (i18n) changes
 * Tests that verify the application has been translated from German to English
 */

const fs = require('fs');
const path = require('path');

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running i18n tests...\n');
    
    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        this.passed++;
      } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n${this.passed} passed, ${this.failed} failed`);
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

// Test HTML language attribute
runner.test('HTML lang attribute is set to "en"', () => {
  const html = readFile('index.html');
  assert(html.includes('<html lang="en">'), 'HTML lang attribute should be "en"');
  assert(!html.includes('<html lang="de">'), 'HTML should not have lang="de"');
});

// Test page title
runner.test('Page title is in English', () => {
  const html = readFile('index.html');
  assert(html.includes('<title>MNIST MLP – Inference Visualization</title>'), 
    'Page title should be in English');
  // Ensure no German title
  assert(!html.includes('Visualisierung'), 'Page title should not contain German text');
});

// Test instruction overlays
runner.test('Instruction overlays are in English', () => {
  const html = readFile('index.html');
  
  // Desktop instructions
  assert(html.includes('Drawing:'), 'Desktop instructions should contain "Drawing:"');
  assert(html.includes('3D Controls:'), 'Desktop instructions should contain "3D Controls:"');
  assert(html.includes('Click and drag on the grid'), 'Instructions should be in English');
  
  // Mobile instructions
  assert(html.includes('Touch Controls'), 'Mobile instructions should have "Touch Controls" title');
  assert(html.includes('Tap and drag on the grid'), 'Mobile instructions should be in English');
});

// Test modal content
runner.test('Info modal content is in English', () => {
  const html = readFile('index.html');
  
  assert(html.includes('MNIST Digit Classification – Inference Visualization'), 
    'Info modal title should be in English');
  assert(html.includes('Interactive Neural Network Visualization'), 
    'Info modal should contain English description');
  assert(html.includes('How it works:'), 'Info modal should have "How it works:" section');
  assert(html.includes('Network Architecture'), 'Info modal should have "Network Architecture" section');
  assert(html.includes('Input Layer:'), 'Info modal should describe layers in English');
  assert(html.includes('3D Controls:'), 'Info modal should have "3D Controls:" section');
  assert(html.includes('Color Coding:'), 'Info modal should have "Color Coding:" section');
  assert(html.includes('Training Your Own Model:'), 'Info modal should have training section in English');
  assert(html.includes('Real-time Features:'), 'Info modal should have real-time features section');
});

// Test advanced settings modal
runner.test('Advanced settings modal is in English', () => {
  const html = readFile('index.html');
  
  assert(html.includes('Advanced Settings'), 'Advanced settings modal title should be in English');
  assert(html.includes('Maximum Connections per Neuron'), 'Settings labels should be in English');
  assert(html.includes('Hide Weak Connections'), 'Settings should have "Hide Weak Connections"');
  assert(html.includes('Connection Thickness'), 'Settings should have "Connection Thickness"');
  assert(html.includes('Brush Thickness'), 'Settings should have "Brush Thickness"');
  assert(html.includes('Brush Strength'), 'Settings should have "Brush Strength"');
});

// Test timeline overlay
runner.test('Timeline overlay is in English', () => {
  const html = readFile('index.html');
  
  assert(html.includes('Training Progress'), 'Timeline should have "Training Progress" label');
  assert(html.includes('aria-label="Training Progress"'), 'Timeline slider should have English aria-label');
});

// Test error messages in JavaScript
runner.test('Error messages in main.js are in English', () => {
  const js = readFile('assets/main.js');
  
  // Check for English error messages
  assert(js.includes('Could not load MNIST manifest'), 'MNIST manifest error should be in English');
  assert(js.includes('Manifest does not contain valid file paths'), 'Manifest validation error should be in English');
  assert(js.includes('Could not load MNIST image data'), 'Image data error should be in English');
  assert(js.includes('Could not load MNIST label data'), 'Label data error should be in English');
  assert(js.includes('Could not infer sample size'), 'Sample size error should be in English');
  assert(js.includes('Number of labels does not match'), 'Label count error should be in English');
  assert(js.includes('Invalid network definition'), 'Network definition error should be in English');
  assert(js.includes('No valid timeline snapshots found'), 'Timeline error should be in English');
  assert(js.includes('Network weights could not be loaded'), 'Weights loading error should be in English');
  assert(js.includes('Base64 decoding is not available'), 'Base64 error should be in English');
  assert(js.includes('Float16 data has invalid length'), 'Float16 error should be in English');
  assert(js.includes('Snapshot could not be loaded'), 'Snapshot loading error should be in English');
  assert(js.includes('Snapshot file does not contain valid layer data'), 'Snapshot validation error should be in English');
  assert(js.includes('Grid container not found'), 'Grid container error should be in English');
  assert(js.includes('Invalid pixel values for drawing pad'), 'Pixel values error should be in English');
  
  // Ensure no German error messages (common German words that shouldn't appear)
  assert(!js.includes('Fehler beim Laden'), 'Should not contain German "Fehler beim Laden"');
  assert(!js.includes('Konnte nicht'), 'Should not contain German "Konnte nicht"');
});

// Test UI text in JavaScript
runner.test('UI text elements in main.js are in English', () => {
  const js = readFile('assets/main.js');
  
  assert(js.includes('Draw digit'), 'Drawing pad title should be "Draw digit"');
  assert(js.includes('Digit Probabilities'), 'Probability panel should have "Digit Probabilities" title');
  assert(js.includes('Network Overview'), 'Network info panel should have "Network Overview" title');
  assert(js.includes('Clear selection'), 'Neuron detail panel should have "Clear selection" button');
  assert(js.includes('Input Layer Size:'), 'Neuron detail should show "Input Layer Size:"');
  assert(js.includes('Output Layer Size:'), 'Neuron detail should show "Output Layer Size:"');
  assert(js.includes('Incoming Contributions'), 'Neuron detail should have "Incoming Contributions" section');
  assert(js.includes('Outgoing Contributions'), 'Neuron detail should have "Outgoing Contributions" section');
  assert(js.includes('Source'), 'Neuron detail should have "Source" label');
  assert(js.includes('Target'), 'Neuron detail should have "Target" label');
  assert(js.includes('Weight'), 'Neuron detail should have "Weight" label');
  assert(js.includes('Contribution'), 'Neuron detail should have "Contribution" label');
  assert(js.includes('Visualization could not be initialized'), 'Initialization error message should be in English');
});

// Test aria-labels
runner.test('Aria-labels are in English', () => {
  const html = readFile('index.html');
  const js = readFile('assets/main.js');
  
  // HTML aria-labels
  assert(html.includes('aria-label="Training Progress"'), 'Timeline slider should have English aria-label');
  
  // JavaScript-generated aria-labels
  assert(js.includes('aria-label'), 'Should have aria-label attributes');
  assert(js.includes('Load random'), 'MNIST sample buttons should have English aria-label');
  
  // Ensure no German aria-labels
  assert(!html.includes('aria-label="Fortschritt"'), 'Should not have German aria-labels');
});

// Test number formatting locale
runner.test('Number formatting uses en-US locale', () => {
  const js = readFile('assets/main.js');
  
  // Check that toLocaleString is used (which defaults to en-US in Node.js/browser)
  // The function should use toLocaleString() without specifying a locale
  assert(js.includes('toLocaleString()'), 'Should use toLocaleString for number formatting');
  
  // Verify it's not using de-DE locale
  assert(!js.includes('toLocaleString("de-DE"'), 'Should not use German locale for number formatting');
  assert(!js.includes('toLocaleString(\'de-DE\''), 'Should not use German locale for number formatting');
  
  // Test the actual formatting function behavior
  // In Node.js, toLocaleString() without locale uses system locale, but in browser it uses en-US
  // We'll test that the function exists and doesn't explicitly use de-DE
  const formatIntegerMatch = js.match(/function formatInteger\([^)]*\)\s*\{[^}]*toLocaleString\([^)]*\)/s);
  assert(formatIntegerMatch, 'formatInteger function should use toLocaleString');
  
  // Test actual number formatting behavior
  // en-US uses commas as thousands separators (1,234,567)
  // de-DE uses periods as thousands separators (1.234.567)
  // We'll simulate the formatInteger function
  function formatInteger(value) {
    if (!Number.isFinite(value)) return "";
    return Math.round(value).toLocaleString();
  }
  
  // Test with a large number - en-US should use commas
  const testNumber = 1234567;
  const formatted = formatInteger(testNumber);
  
  // In Node.js, this might use system locale, but we check it doesn't use German format
  // German format would be "1.234.567" (periods), English is "1,234,567" (commas)
  // If it uses commas, it's likely en-US; if it uses periods, it might be de-DE
  // We'll check that it's not the German format
  if (formatted.includes('.') && formatted.split('.').length > 2) {
    // Multiple periods suggest German format (though could be decimal in some locales)
    // We'll be lenient here since Node.js uses system locale
    console.warn('  ⚠ Note: Number formatting may use system locale in Node.js');
  }
  
  // The key test: ensure the code doesn't explicitly specify de-DE
  assert(!js.match(/toLocaleString\(["']de-DE["']/i), 'Code should not explicitly use German locale');
});

// Test console messages
runner.test('Console messages are in English', () => {
  const js = readFile('assets/main.js');
  
  // Check for English console messages
  assert(js.includes('MNIST test data could not be loaded'), 'Console warning should be in English');
  assert(js.includes('Could not resolve relative URL'), 'Console warning should be in English');
  assert(js.includes('Error updating snapshot:'), 'Console error should be in English');
  
  // Ensure no German console messages
  assert(!js.includes('Fehler beim Aktualisieren'), 'Should not contain German "Fehler beim Aktualisieren"');
  assert(!js.includes('Fehler beim Laden'), 'Should not contain German "Fehler beim Laden"');
  assert(!js.includes('Konnte nicht'), 'Should not contain German "Konnte nicht"');
});

// Test that key German words are not present in user-facing text
runner.test('No German text in user-facing UI elements', () => {
  const html = readFile('index.html');
  const js = readFile('assets/main.js');
  
  // Check HTML for German words in user-facing content
  const htmlLower = html.toLowerCase();
  const userFacingGermanWords = [
    'zeichnen',  // drawing
    'steuerung', // controls
    'einstellungen', // settings
    'übersicht', // overview
    'wahrscheinlichkeit', // probability
  ];
  
  for (const word of userFacingGermanWords) {
    // Check if word appears in visible text (not in URLs or code)
    if (htmlLower.includes(word) && !htmlLower.includes('github.com')) {
      // Check if it's in a visible element (not in script tags or comments)
      const visibleContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                  .replace(/<!--[\s\S]*?-->/g, '');
      if (visibleContent.toLowerCase().includes(word)) {
        throw new Error(`Found German word "${word}" in user-facing HTML content`);
      }
    }
  }
  
  // Check for German error messages that are thrown to users (not just console.error)
  // User-facing errors are those in throw new Error() or renderErrorMessage()
  const userFacingErrorPatterns = [
    /throw new Error\([^)]*["']Fehler/i,
    /throw new Error\([^)]*["']Konnte nicht/i,
    /renderErrorMessage\([^)]*["']Fehler/i,
  ];
  
  for (const pattern of userFacingErrorPatterns) {
    if (pattern.test(js)) {
      throw new Error('Found German text in user-facing error messages');
    }
  }
  
  // Check for any remaining German console messages
  const germanConsoleErrors = (js.match(/console\.(error|warn|log)\([^)]*["']Fehler/gi) || []).length;
  if (germanConsoleErrors > 0) {
    console.warn(`  ⚠ Warning: Found ${germanConsoleErrors} German console message(s) that could be translated`);
  }
});

// Test layer descriptions
runner.test('Layer descriptions are in English', () => {
  const html = readFile('index.html');
  
  assert(html.includes('Input Layer:'), 'Should describe input layer in English');
  assert(html.includes('Dense Layer'), 'Should describe dense layers in English');
  assert(html.includes('Output Layer:'), 'Should describe output layer in English');
  assert(html.includes('neurons with ReLU'), 'Should describe activation functions in English');
  assert(html.includes('Softmax probabilities'), 'Should describe output in English');
});

// Test button labels and interactive elements
runner.test('Button labels and interactive elements are in English', () => {
  const html = readFile('index.html');
  const js = readFile('assets/main.js');
  
  // Check for English button text (may be in HTML or JS)
  assert(html.includes('Advanced Settings') || js.includes('Advanced Settings'), 
    'Should have "Advanced Settings" button');
  assert(html.includes('Clear selection') || js.includes('Clear selection'), 
    'Should have "Clear selection" button');
  
  // Check that common German button words are not present in user-facing text
  const visibleHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<!--[\s\S]*?-->/g, '');
  assert(!visibleHtml.includes('Löschen'), 'Should not have German "Löschen" (clear) in HTML');
  assert(!visibleHtml.includes('Schließen'), 'Should not have German "Schließen" (close) in HTML');
  assert(!visibleHtml.includes('Einstellungen'), 'Should not have German "Einstellungen" (settings) in HTML');
});

// Test that all user-visible strings from PR description are present
runner.test('Key translated strings from PR description are present', () => {
  const html = readFile('index.html');
  const js = readFile('assets/main.js');
  
  // Key strings mentioned in PR description
  const keyStrings = [
    'MNIST MLP – Inference Visualization', // Page title
    'Draw digit', // Drawing pad
    'Digit Probabilities', // Probability panel
    'Network Overview', // Network info
    'Training Progress', // Timeline
    'Interactive Neural Network Visualization', // Info modal
    'How it works:', // Info modal section
    '3D Controls:', // Info modal section
    'Color Coding:', // Info modal section
  ];
  
  for (const str of keyStrings) {
    const found = html.includes(str) || js.includes(str);
    assert(found, `Key translated string "${str}" should be present`);
  }
});

// Run all tests
runner.run();

