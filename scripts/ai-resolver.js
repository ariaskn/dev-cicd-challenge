import fs from "fs";
import path from "path";
import OpenAI from "openai";

const AIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ARTIFACTS_DIR = "../artifacts";
const LOG_FILE = path.join(ARTIFACTS_DIR, "failed_jobs.log");
const OUTPUT_FILE = path.join(ARTIFACTS_DIR, "incident_report.json");

function preprocessLogs(filePath) {
  const logs = fs.readFileSync(filePath, "utf-8");

  if (logs.length > 12000) {
    return logs.slice(0, 12000);
  }

  return logs;
}

function buildPrompt(logs) {
  return `
You are an AI DevOps assistant.

Analyze the following CI/CD pipeline failure logs.

Logs:
--------
${logs}
--------

Return ONLY a valid JSON with this structure:

{
  "step_failed": "test | build | deployStaging | deployProduction"
  "summary": "Short explanation",
  "probable_root_cause": "Most likely cause",
  "confidence": "low | medium | high",
  "suggested_fixes": ["fix1", "fix2"],
  "rollback_required": true|false
}
`;
}

async function analyzeLogs(logs) {
  const response = await AIClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: buildPrompt(logs),
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (err) {
    return {
      summary: "Failed to parse AI response",
      root_cause: content,
      confidence: "low",
      error_type: "unknown",
      suggested_fixes: [],
    };
  }
}

function saveReport(report) {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
}

async function main() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error("No logs found");
    process.exit(1);
  }

  const logs = preprocessLogs(LOG_FILE);
  const report = await analyzeLogs(logs);

  saveReport(report);

  console.log("Incident report generated at:", OUTPUT_FILE);
}

main();