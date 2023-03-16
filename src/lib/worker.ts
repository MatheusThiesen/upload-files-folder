import AWS from "aws-sdk";
import "dotenv/config";
import { default as fs, default as gracefulFs } from "graceful-fs";
import path from "path";
import sharp from "sharp";
gracefulFs.gracefulify(fs);

import { QueueTask } from "./queue";

const importPath = process.env.PATH_IMAGES || "C:";
const bucketName = process.env.BUCKET_NAME || "";
const accessKeyId = process.env.AWS_ACCESS_KEY || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const endPoint = process.env.S3_ENDPOINT || "";

AWS.config.update({ accessKeyId, secretAccessKey, region: "nyc3" });
const s3 = new AWS.S3({
  endpoint: endPoint,
  params: { Bucket: bucketName },
});

async function read(file: string): Promise<Buffer> {
  const fileSlit = file.split(".");
  const mimetype: string = fileSlit[fileSlit.length - 1].toLocaleUpperCase();

  const readFile = await gracefulFs.readFileSync(
    path.resolve(importPath, file)
  );

  if (mimetype === "PDF") {
    return readFile;
  }

  const quality =
    Number(readFile.byteLength / 1024) > 9000
      ? 25
      : Number(readFile.byteLength / 1024) > 8000
      ? 30
      : Number(readFile.byteLength / 1024) > 1300
      ? 50
      : 80;

  if (mimetype === "PNG") {
    const compress = await sharp(path.resolve(importPath, file))
      .png({ quality: quality, progressive: true })
      .toBuffer();

    return compress;
  } else {
    const compress = await sharp(path.resolve(importPath, file))
      .jpeg({ quality: quality, progressive: true })
      .toBuffer();

    return compress;
  }
}

export async function worker({ filename }: QueueTask) {
  const nameSplit = filename.split(".");
  const mimetype: string = nameSplit[nameSplit.length - 1].toLocaleLowerCase();

  const file = await read(filename);

  const putObjectPromise = s3
    .putObject({
      Bucket: bucketName,
      Key: `Devolucao/${filename}`,
      Body: file,
      ContentType: mimetype === "pdf" ? "application/pdf" : "image",
      ACL: "public-read",
    })
    .promise();

  return await new Promise<string>((resolve, reject) => {
    putObjectPromise
      .then(() => {
        resolve(filename);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
