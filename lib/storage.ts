import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function appendJsonl(fileName: string, value: unknown) {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(path.join(dataDir, fileName), `${JSON.stringify(value)}\n`, "utf8");
    return true;
  } catch (error) {
    console.warn(`无法写入本地记录文件 ${fileName}。线上环境请改用数据库或对象存储。`, error);
    return false;
  }
}
