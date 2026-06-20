import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function appendJsonl(fileName: string, value: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(path.join(dataDir, fileName), `${JSON.stringify(value)}\n`, "utf8");
}
