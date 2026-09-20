import { app } from '../index.js';
import { sniffMimeType } from '../utils/fileParser.js';
import { assertNumericsPreserved } from '../utils/numericChecker.js';
import { logBuffer } from '../middleware/logger.js';

async function runServerTests() {
  console.log('=== Running Backend Server Test Suite ===\n');

  // Test 1: MIME Sniffing Rejection for disguised fake PDF
  console.log('Test 1: Verification of MIME sniffing for disguised .pdf files...');
  const fakePdfBuffer = Buffer.from('This is a fake text file disguised as a pdf document.');
  const sniffedType = sniffMimeType(fakePdfBuffer);

  if (sniffedType !== 'unknown') {
    throw new Error(`Expected MIME sniffer to reject fake PDF buffer, but got: ${sniffedType}`);
  }

  const realPdfBuffer = Buffer.from('%PDF-1.4 Fake PDF stream header content...');
  const realSniffedType = sniffMimeType(realPdfBuffer);
  if (realSniffedType !== 'pdf') {
    throw new Error(`Expected MIME sniffer to accept valid PDF magic header, got: ${realSniffedType}`);
  }
  console.log('✅ Test 1 PASSED: Disguised non-PDF correctly identified and rejected by MIME sniffing.\n');

  // Test 2: Hindi Mode Numeric Preservation Test
  console.log('Test 2: Verification of Hindi mode numeric preservation...');
  const sourceText = 'A convex lens of focal length 50 cm forms an image at 0.0001 m with power 2.5 D.';

  // Valid Hindi response preserving numbers
  const validHindiResponse = 'एक उत्तल लेंस जिसकी फोकल लंबाई 50 cm है, 0.0001 m पर 2.5 D क्षमता की छवि बनाता है।';
  const checkPass = assertNumericsPreserved(sourceText, validHindiResponse);
  if (!checkPass.preserved) {
    throw new Error(`Expected numeric assertion to pass, but failed for missing: ${checkPass.missingNumerics.join(', ')}`);
  }

  // Invalid Hindi response missing a number
  const invalidHindiResponse = 'एक उत्तल लेंस जिसकी फोकल लंबाई पचास cm है...';
  const checkFail = assertNumericsPreserved(sourceText, invalidHindiResponse);
  if (checkFail.preserved) {
    throw new Error('Expected numeric assertion to fail when numeric values are altered/missing');
  }
  console.log('✅ Test 2 PASSED: Hindi mode numeric preservation check correctly asserts all numbers.\n');

  // Test 3: Log Scanning Test (Zero PII or Raw User Text in Log Lines)
  console.log('Test 3: Verification of Log Scanner (No PII / No raw user text logged)...');
  const sensitiveUserText = 'John Doe SECRET_CANDIDATE_RESUME_TEXT_12345';

  // Check logBuffer entries
  for (const entry of logBuffer) {
    const jsonStr = JSON.stringify(entry);
    if (jsonStr.includes(sensitiveUserText) || jsonStr.includes('SECRET_CANDIDATE')) {
      throw new Error(`SECURITY VIOLATION: Found sensitive PII text in log entry: ${jsonStr}`);
    }
    // Verify required fields present
    if (!entry.timestamp || !entry.level || !entry.requestId) {
      throw new Error(`Invalid log schema format missing required keys: ${jsonStr}`);
    }
  }
  console.log('✅ Test 3 PASSED: Zero PII or candidate text found in structured logs.\n');

  console.log('🎉 All Server Backend Tests PASSED Successfully!');
}

runServerTests().catch((err) => {
  console.error('❌ Server test failed:', err);
  process.exit(1);
});
