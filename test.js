#!/usr/bin/env node
/**
 * Unified test runner for all i18n tests
 * Runs the comprehensive i18n test suite
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Test suite results
const results = {
  i18n: { passed: 0, failed: 0, total: 0, output: [] },
};

// Run a test file and capture output
function runTest(testFile, suiteName) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    
    if (!fs.existsSync(testPath)) {
      reject(new Error(`Test file not found: ${testFile}`));
      return;
    }

    console.log(colorize(`\n${'='.repeat(80)}`, 'cyan'));
    console.log(colorize(`Running ${suiteName}...`, 'bright'));
    console.log(colorize('='.repeat(80), 'cyan'));
    console.log();

    const child = spawn('node', [testPath], {
      cwd: __dirname,
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      // Parse output to extract test results
      const output = stdout + stderr;
      const passedMatch = output.match(/(\d+)\s+passed/);
      const failedMatch = output.match(/(\d+)\s+failed/);

      if (passedMatch) {
        results[suiteName].passed = parseInt(passedMatch[1], 10);
      }
      if (failedMatch) {
        results[suiteName].failed = parseInt(failedMatch[1], 10);
      }
      results[suiteName].total = results[suiteName].passed + results[suiteName].failed;
      results[suiteName].output = output;

      if (code === 0) {
        resolve();
      } else {
        // Don't reject - we want to continue running other tests
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Print summary
function printSummary() {
  console.log(colorize('\n' + '='.repeat(80), 'cyan'));
  console.log(colorize('TEST SUMMARY', 'bright'));
  console.log(colorize('='.repeat(80), 'cyan'));
  console.log();

  const totalPassed = results.i18n.passed;
  const totalFailed = results.i18n.failed;
  const totalTests = results.i18n.total;

  // i18n tests summary
  if (results.i18n.total > 0) {
    const status = results.i18n.failed === 0 ? colorize('✓', 'green') : colorize('✗', 'red');
    console.log(`${status} i18n Tests:`);
    console.log(`   ${colorize(results.i18n.passed, 'green')} passed, ${colorize(results.i18n.failed, 'red')} failed, ${results.i18n.total} total`);
    console.log();
  }

  // Overall summary
  console.log(colorize('─'.repeat(80), 'cyan'));
  const overallStatus = totalFailed === 0 ? colorize('✓ ALL TESTS PASSED', 'green') : colorize('✗ SOME TESTS FAILED', 'red');
  console.log(`${overallStatus}`);
  console.log(`   Total: ${colorize(totalPassed, 'green')} passed, ${colorize(totalFailed, 'red')} failed, ${totalTests} total`);
  console.log(colorize('='.repeat(80), 'cyan'));
  console.log();

  // Browser test reminder
  if (totalFailed === 0) {
    console.log(colorize('Note:', 'yellow'));
    console.log('  Browser-based tests are available in test-i18n-browser.html');
    console.log('  Open that file in a web browser to test runtime i18n behavior.');
    console.log();
  }

  return totalFailed === 0 ? 0 : 1;
}

// Main execution
async function runAllTests() {
  console.log(colorize('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║                    i18n Test Suite - Unified Runner                        ║', 'bright'));
  console.log(colorize('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log();

  try {
    // Run i18n tests
    await runTest('test-i18n.js', 'i18n').catch((error) => {
      console.error(colorize(`\nError running i18n tests: ${error.message}`, 'red'));
      results.i18n.failed = 1;
      results.i18n.total = 1;
    });

    // Print summary and exit
    const exitCode = printSummary();
    process.exit(exitCode);
  } catch (error) {
    console.error(colorize(`\nFatal error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node test.js [options]

Options:
  --help, -h     Show this help message

Examples:
  node test.js                  # Run all i18n tests
  node test-i18n.js            # Run tests directly
`);
  process.exit(0);
}

// Run all tests
runAllTests();

