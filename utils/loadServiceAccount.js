import fs from "fs";
import path from "path";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import os from "os";
const tmpDir = os.tmpdir(); // Platform-specific system temp directory

// Create the 'tmp' folder if it doesn't exist
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const serviceAccountPath = path.join(tmpDir, "service-account.json");

let analyticsDataClient = null;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_B64) {
  const decoded = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_B64,
    "base64"
  ).toString("utf-8");

  fs.writeFileSync(serviceAccountPath, decoded, { mode: 0o600 });

  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: serviceAccountPath,
  });
} else {
  console.error("❌ GOOGLE_APPLICATION_CREDENTIALS_B64 is not defined.");
}

export const analyticsDataClientExport = analyticsDataClient;
