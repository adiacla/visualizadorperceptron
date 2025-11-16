# i18n Test Suite Documentation

This document describes the comprehensive test suite for the internationalization (i18n) functionality.

## Quick Start

**Run all tests with a single command:**
```bash
node test.js
```

This will run the comprehensive i18n tests, providing a unified summary.

## Test Files

### 0. `test.js` ⭐ **RECOMMENDED**
A unified test runner that executes all Node.js-based tests and provides a comprehensive summary.

**Usage:**
```bash
# Run all tests
node test.js

# Show help
node test.js --help
```

**Features:**
- Runs the comprehensive i18n test suite
- Provides colored output and clear summaries
- Shows overall pass/fail status
- Reminds about browser tests

### 1. `test-i18n.js`
A Node.js-based test suite that performs static analysis and validation of the i18n implementation. This test can be run from the command line and doesn't require a browser.

**Usage:**
```bash
node test-i18n.js
```

**What it tests:**
- Translation file structure and completeness
- i18n.js module code analysis
- HTML integration with data-i18n attributes
- JavaScript integration with translation functions
- Translation key coverage
- Code quality and best practices
- Edge cases and error handling
- Accessibility and internationalization

### 2. `test-i18n-browser.html`
A browser-based test suite that tests the runtime behavior of the i18n system. This test requires opening the HTML file in a web browser.

**Usage:**
1. Open `test-i18n-browser.html` in a web browser
2. Tests will run automatically on page load
3. Use the buttons to run specific test suites

**What it tests:**
- Basic i18n module functionality
- Language switching behavior
- DOM element translation
- Error handling
- LocalStorage persistence
- Translation completeness

### 3. `test-i18n.js` (also run via `test.js`)
The comprehensive test file that verifies the i18n implementation. This test performs static analysis and checks for hardcoded text, translation coverage, and i18n integration.

**Usage:**
```bash
# Run directly
node test-i18n.js

# Or run via the unified test runner
node test.js
```

## Test Coverage

The comprehensive test suite includes **65 tests** across 8 test suites:

### Test Suite 1: Translation File Structure and Completeness (7 tests)
- Validates JSON structure
- Ensures both languages have matching keys
- Verifies all values are strings
- Checks parameter placeholder consistency

### Test Suite 2: i18n.js Module Code Analysis (18 tests)
- Verifies all exported functions exist
- Checks for proper error handling
- Validates localStorage usage
- Ensures event dispatching

### Test Suite 3: HTML Integration (14 tests)
- Verifies data-i18n attributes are used
- Checks language toggle button
- Validates all translation keys exist
- Ensures proper HTML structure

### Test Suite 4: JavaScript Integration (9 tests)
- Verifies t() function usage
- Checks translation key references
- Validates parameter substitution
- Ensures language change listeners

### Test Suite 5: Translation Key Coverage (3 tests)
- Verifies error keys are used
- Checks UI key references
- Validates parameter placeholders

### Test Suite 6: Code Quality and Best Practices (5 tests)
- Checks for hardcoded German text
- Validates translation file formatting
- Ensures no empty strings
- Verifies naming conventions

### Test Suite 7: Edge Cases and Error Handling (5 tests)
- Tests missing key handling
- Validates fallback behavior
- Checks special character handling
- Tests parameter substitution edge cases

### Test Suite 8: Accessibility and Internationalization (4 tests)
- Verifies HTML lang attribute updates
- Checks translatable aria-labels
- Validates accessibility attributes
- Ensures proper ARIA roles

## Running All Tests

**Recommended: Use the unified test runner:**
```bash
node test.js
```

**Or run tests individually:**
```bash
# Run comprehensive Node.js tests (via unified runner)
node test.js

# Run comprehensive tests directly
node test-i18n.js

# Open browser tests (requires a web server or file:// protocol)
open test-i18n-browser.html
```

## Test Results

All tests should pass. The comprehensive test suite reports:
- **65 tests passed, 0 failed** (as of last run)

## Adding New Tests

When adding new translation keys or i18n features:

1. **Add translation keys to both `en.json` and `de.json`**
2. **Update HTML with `data-i18n` attributes if needed**
3. **Use `t()` function in JavaScript for dynamic translations**
4. **Run the test suite to verify everything works**

## Troubleshooting

### Test fails: "Translation key not found"
- Ensure the key exists in both `en.json` and `de.json`
- Check that the key path uses dot notation (e.g., `"drawing.title"`)

### Test fails: "Hardcoded German text found"
- Remove any hardcoded German strings from HTML or JavaScript
- Use translation keys instead

### Browser tests don't run
- Ensure `assets/i18n.js` is accessible
- Check browser console for errors
- Verify translation JSON files are in `assets/i18n/`

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run i18n tests
  run: |
    node test.js
```

## Notes

- The comprehensive test suite performs static analysis and doesn't require a browser
- The browser test suite tests actual runtime behavior
- Both test suites complement each other for complete coverage
- Tests are designed to catch regressions when modifying i18n code

