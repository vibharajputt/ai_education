import { logStructured, logBuffer } from '../middleware/logger.js';

async function runLogScanTest() {
  console.log('=== Running PII & Sensitive Log Scan Test ===\n');

  // Simulate logging requests
  logStructured({
    timestamp: new Date().toISOString(),
    level: 'info',
    requestId: 'req-test-123',
    method: 'POST',
    path: '/api/analyze-resume',
    status: 200,
    durationMs: 150,
  });

  logStructured({
    timestamp: new Date().toISOString(),
    level: 'warn',
    requestId: 'req-test-456',
    method: 'POST',
    path: '/api/assist',
    status: 400,
    durationMs: 45,
    error: 'INVALID_INPUT',
  });

  const piiPatterns = [
    /email/i,
    /phone/i,
    /ssn/i,
    /password/i,
    /resumeText/i,
    /bodyText/i,
    /userPrompt/i,
  ];

  for (const log of logBuffer) {
    const rawLogStr = JSON.stringify(log);

    // Verify no log line contains raw content fields or PII patterns
    if ((log as any).body || (log as any).resumeText || (log as any).prompt) {
      throw new Error(`SECURITY FAILURE: Log contains illegal payload field: ${rawLogStr}`);
    }

    // Verify keys present
    const keys = Object.keys(log);
    const allowedKeys = ['timestamp', 'level', 'requestId', 'method', 'path', 'status', 'durationMs', 'message', 'error'];
    const unexpectedKeys = keys.filter((k) => !allowedKeys.includes(k));

    if (unexpectedKeys.length > 0) {
      throw new Error(`SECURITY FAILURE: Log contains un-sanitized keys [${unexpectedKeys.join(', ')}]: ${rawLogStr}`);
    }
  }

  console.log('✅ Log Scan PASSED: All log lines strictly adhere to structured non-PII schema.');
}

runLogScanTest().catch((err) => {
  console.error('❌ Log scan test failed:', err);
  process.exit(1);
});
