'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Xin chào! 👋 Tôi là trợ lý tư vấn AI của **BN STORE**.

Tôi có thể giúp bạn:
• 🛍️ **Tìm sản phẩm** phù hợp nhu cầu
• 📐 **Chọn size** chính xác
• 👗 **Gợi ý phong cách** theo dịp
• 🏷️ **Xem khuyến mãi** đang có
• 🚚 **Chính sách** vận chuyển & đổi trả

Bạn cần tư vấn gì hôm nay?`,
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Check LM Studio availability on mount
  useEffect(() => {
    fetch('/api/v1/chat')
      .then(r => r.json())
      .then(d => setIsAvailable(d.available))
      .catch(() => setIsAvailable(false));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading || !content.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const allMessages = [...messages, userMsg];
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              accumulated += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulated }
                    : m
                )
              );
            }
          } catch {
            // Ignore JSON parse errors in stream
          }
        }
      }

      // Mark streaming complete
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const errorContent = err.message?.includes('LM Studio')
        ? '⚠️ LM Studio đang không hoạt động. Vui lòng khởi động LM Studio và thử lại.'
        : '❌ Xảy ra lỗi khi kết nối với AI. Vui lòng thử lại hoặc liên hệ hotline **1800-xxxx**.';

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: errorContent, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages(prev =>
      prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m)
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  return {
    messages,
    isLoading,
    isAvailable,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
