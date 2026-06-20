type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekJsonResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
  };
};

const defaultBaseUrl = "https://api.deepseek.com";

export function getModelProvider() {
  return {
    provider: "deepseek",
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    baseUrl: process.env.DEEPSEEK_BASE_URL || defaultBaseUrl,
    hasKey: Boolean(process.env.DEEPSEEK_API_KEY)
  };
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

export async function callDeepSeekJson<T>(messages: DeepSeekMessage[], schema: object): Promise<T> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { model, baseUrl } = getModelProvider();

  if (!apiKey) {
    throw new Error("缺少 DEEPSEEK_API_KEY。请把它添加到 .env.local 后重启开发服务器。");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        ...messages,
        {
          role: "user",
          content: `Return JSON only. The JSON must match this schema: ${JSON.stringify(schema)}`
        }
      ],
      response_format: { type: "json_object" },
      stream: false
    })
  });

  const body = (await response.json().catch(() => ({}))) as DeepSeekJsonResponse;
  if (!response.ok) {
    const message = body.error?.message || `DeepSeek 请求失败，HTTP 状态码：${response.status}`;
    throw new Error(message);
  }

  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("DeepSeek 返回了空响应。");

  return JSON.parse(extractJson(text)) as T;
}

export async function callDeepSeekText(messages: DeepSeekMessage[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { model, baseUrl } = getModelProvider();

  if (!apiKey) {
    throw new Error("缺少 DEEPSEEK_API_KEY。请把它添加到 .env.local 后重启开发服务器。");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, stream: false })
  });

  const body = (await response.json().catch(() => ({}))) as DeepSeekJsonResponse;
  if (!response.ok) {
    const message = body.error?.message || `DeepSeek 请求失败，HTTP 状态码：${response.status}`;
    throw new Error(message);
  }

  return body.choices?.[0]?.message?.content?.trim() || "";
}
