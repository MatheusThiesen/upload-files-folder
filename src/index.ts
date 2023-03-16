import "dotenv/config";

import { getFiles, populateQueue } from "./populateQueue";

async function runMigration() {
  const files = await getFiles();
  populateQueue(files);
}

runMigration();
