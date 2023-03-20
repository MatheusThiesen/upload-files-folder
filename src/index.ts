import "dotenv/config";

import { getFiles, populateQueue } from "./populateQueue";

async function runMigration() {
  const files = await getFiles({
    filterOldMinutes: 60 * 24 * 5,
  });
  populateQueue(files);
}

runMigration();
