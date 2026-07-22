const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

interface DeepSeekResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
}

export class DeepSeekClient {
  private apiKey: string;

  constructor() {
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY non configurée");
    }
    this.apiKey = DEEPSEEK_API_KEY;
  }

  async chat(
    messages: DeepSeekMessage[],
    options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
  ): Promise<string> {
    const body: DeepSeekRequest = {
      model: "deepseek-chat",
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    };

    if (options?.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${error}`);
    }

    const data = (await response.json()) as DeepSeekResponse;
    return data.choices[0]?.message?.content ?? "";
  }

  async chatJSON<T>(
    messages: DeepSeekMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<T> {
    const content = await this.chat(messages, {
      ...options,
      jsonMode: true,
    });

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error("Réponse DeepSeek invalide (JSON attendu)");
    }
  }
}

export function createDeepSeekClient() {
  return new DeepSeekClient();
}
