import fastq, { queueAsPromised } from "fastq";
import { worker } from "./worker";

export type QueueTask = {
  filename: string;
};

const CONCURRENCY = 4;

export const queue: queueAsPromised<QueueTask> = fastq.promise(
  worker,
  CONCURRENCY
);
