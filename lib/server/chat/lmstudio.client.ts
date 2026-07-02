export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LMStudioConfig {
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class LMStudioClient {
  private baseUrl: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config?: LMStudioConfig) {
    this.baseUrl = config?.baseUrl ?? process.env.LM_STUDIO_BASE_URL ?? 'http://127.0.0.1:1234/v1';
    this.model = config?.model ?? process.env.LM_STUDIO_MODEL ?? 'qwen2.5-7b-instruct';
    this.maxTokens = config?.maxTokens ?? Number(process.env.LM_STUDIO_MAX_TOKENS ?? 1024);
    this.temperature = config?.temperature ?? Number(process.env.LM_STUDIO_TEMPERATURE ?? 0.7);
  }

  async chatStream(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stop: ['<|im_end|>', '<|endoftext|>'],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`LM Studio error ${res.status}: ${err}`);
    }

    if (!res.body) throw new Error('No response body from LM Studio');
    return res.body;
  }

  async chatOnce(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });
    if (!res.ok) throw new Error(`LM Studio error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}
