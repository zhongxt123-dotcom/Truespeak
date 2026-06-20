# Dialogue Localization Engine MVP

一个用于中文台词到英语母语口语台词的本地化改写 MVP。

## 功能

- 结构化输入：中文台词、角色、场景、关系、情绪、风格偏好
- 本地 RAG 示例检索：先用轻量口语表达库找相似表达
- DeepSeek 生成：默认调用 `deepseek-v4-flash`
- QA 校验：对每个英文版本做回译、自然度、情绪匹配、剧情准确度评分
- 反馈保存：用户选择、修改、评分写入 `data/feedback.jsonl`
- 生成记录：写入 `data/generations.jsonl`

## 配置

复制 `.env.example` 为 `.env.local`，然后填入：

```env
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

## 启动

```bash
npm install
npm run dev
```

打开浏览器访问本地地址，一般是：

```text
http://localhost:3000
```

## 后续扩展

- 把 `lib/rag.ts` 替换为 pgvector、Qdrant、Weaviate 或 Pinecone
- 将字幕/剧本语料清洗为带 metadata 的表达片段
- 增加项目、角色卡、历史台词一致性记忆
- 增加批量剧本导入和导出
- 为 QA 增加自动重写循环
