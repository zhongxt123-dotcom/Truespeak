import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台词本地化改写引擎",
  description: "中文台词到英语母语口语的本地化改写工具"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
