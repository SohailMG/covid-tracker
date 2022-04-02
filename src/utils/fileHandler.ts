import fs from "fs";
import { promisify } from "util";

export interface Dataset {
  start: string | number;
  target: number[];
}

export interface FileData {
  fileName: string;
  data: Dataset;
}

export function writeToFile(fileData: FileData) {
  fs.writeFile(fileData.fileName, JSON.stringify(fileData.data), (err: any) => {
    if (err) throw err;
  });
}

export async function getFileData(fileName: string) {
  const readFile = promisify(fs.readFile);
  const jsonString = await readFile("./datasets/" + fileName);
  const fileData: Dataset = JSON.parse(jsonString.toString("utf8"));
  return fileData;
}
