import "dotenv/config";
import fs from "fs";
import path from "path";
import { queue, QueueTask } from "./lib/queue";

const importPath = process.env.PATH_IMAGES || "C:";

export async function populateQueue(listFiles: QueueTask[]) {
  const imported: { name: string }[] = [];
  const noImported: { name: string }[] = [];

  let count = 1;
  for (const item of listFiles) {
    queue
      .push({ filename: item.filename })
      .then(() => {
        console.log(
          `Uploaded: ${item.filename} ${count} de ${listFiles.length}`
        );
        count++;
        imported.push({ name: item.filename });
      })
      .catch((err) => {
        console.log(`Error on video: ${item.filename}`, err);
        noImported.push({ name: item.filename });
      });
  }
}

export async function getFiles({
  filterOldMinutes,
}: {
  filterOldMinutes?: number;
}) {
  var normalized: QueueTask[] = [];
  var re = /\.(JPEG|JPG|PDF|PNG|Pdf|gif|jfif|jpeg|jpg|pdf|png)$/;

  const readdirSync = fs.readdirSync(path.resolve(importPath));

  var now: Date = new Date();
  if (filterOldMinutes) {
    now.setMinutes(now.getMinutes() - filterOldMinutes);
  }

  var matches = readdirSync
    .filter((text) => re.test(text))
    .filter((textFile) => {
      let statFile: undefined | fs.Stats = undefined;
      try {
        statFile = fs.statSync(path.resolve(importPath, textFile));
      } catch (error) {}

      if (statFile) {
        if (!filterOldMinutes) {
          if (
            now <= new Date(statFile.mtime) ||
            now <= new Date(statFile.ctime) //||
            // now <= new Date(statFile.birthtime) ||
            // now <= new Date(statFile.atime)
          ) {
            return textFile;
          }
        } else {
          return textFile;
        }
      }

      return;
    });
  var numFiles = matches.length;

  if (numFiles) {
    for (let i = 0; i < numFiles; i++) {
      const file = matches[i];

      if (file) {
        normalized.push({
          filename: file,
        });
      }
    }
  }

  return normalized;
}
