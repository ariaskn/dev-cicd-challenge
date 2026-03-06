const fs = require('fs');
const path = require('path');

const logPath = process.argv[2] || path.join(__dirname, '..', 'logs', 'pipeline_failure.log');
const outputPath = path.join(__dirname, '..', 'artifacts', 'incident_report.md');

function analyzeLog(logContent) {
  const lower = logContent.toLowerCase();

  let probableRootCause = 'Unknown';
  let suggestedFix = 'Inspect logs and failing step manually.';
  let stepFailed = 'Unknown';
  let rollbackRequired = 'No';
  let confidence = 'Low';

  if (lower.includes('expected: 200') && lower.includes('received: 500')) {
    probableRootCause = 'Health endpoint is returning 500, likely due to missing environment configuration.';
    suggestedFix = 'Set the required APP_ENV variable in the test/runtime environment or update the app initialization.';
    stepFailed = 'Unit Tests';
    confidence = 'High';
  }

  return `# Incident Summary

**Step failed:** ${stepFailed}

**Probable root cause:** ${probableRootCause}

**Confidence:** ${confidence}

**Suggested fix:** ${suggestedFix}

**Recommended action:** Fix the issue, rerun the pipeline, and validate staging health checks.

**Rollback required:** ${rollbackRequired}
`;
}

const logContent = fs.readFileSync(logPath, 'utf8');
const report = analyzeLog(logContent);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Incident report generated at: ${outputPath}`);
