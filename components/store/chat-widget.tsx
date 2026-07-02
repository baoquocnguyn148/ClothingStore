'use client';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChat } from '@/hooks/use-chat';
import { MarkdownText } from './chat-markdown';

const QUICK_REPLIES = [
  '🛍️ Xem sản phẩm mới',
  '📐 Hướng dẫn chọn size',
  '🏷️ Khuyến mãi đang có',
  '🚚 Phí và thời gian ship',
  '🔄 Chính sách đổi trả',
  '👗 Tư vấn phong cách',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, isAvailable, sendMessage, stopStreaming, clearMessages } = useChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const showQuickReplies = messages.length === 1 && !isLoading;

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────── */}
      <div
        className={`
          fixed bottom-24 right-5 z-50 w-[370px] max-w-[calc(100vw-2.5rem)]
          bg-white rounded-2xl shadow-2xl border border-gray-200
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        `}
        style={{ height: '560px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-black shrink-0 border-b border-gray-800">
          <div className="relative">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-lg">
              🤖
            </div>
            <span className={`
              absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black
              ${isAvailable === true ? 'bg-green-400' : isAvailable === false ? 'bg-red-400' : 'bg-yellow-400'}
            `} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm uppercase tracking-wide leading-tight">BN STORE AI</p>
            <p className="text-gray-400 text-xs">
              {isLoading
                ? 'Đang trả lời...'
                : isAvailable === false
                  ? '⚠ LM Studio offline'
                  : 'Trợ lý tư vấn thời trang'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearMessages}
              title="Cuộc hội thoại mới"
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-sm shrink-0">
                  🤖
                </div>
              )}
              <div
                className={`
                  max-w-[85%] rounded-2xl px-3.5 py-2.5
                  ${msg.role === 'user'
                    ? 'bg-black text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md'}
                  ${msg.isStreaming ? 'border-gray-300' : ''}
                `}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : msg.content ? (
                  <MarkdownText content={msg.content} />
                ) : (
                  <TypingIndicator />
                )}
                {msg.isStreaming && msg.content && (
                  <span className="inline-block w-1 h-4 bg-gray-400 rounded ml-0.5 animate-pulse align-bottom" />
                )}
              </div>
            </div>
          ))}

          {/* Quick replies — only shown after welcome */}
          {showQuickReplies && (
            <div className="pt-1 pb-2">
              <p className="text-xs font-semibold text-gray-400 mb-2 ml-9 uppercase tracking-widest">Gợi ý</p>
              <div className="flex flex-wrap gap-1.5 ml-9">
                {QUICK_REPLIES.map(qr => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    className="text-xs bg-white text-black border border-gray-200 rounded-full px-3 py-1.5
                               hover:bg-gray-50 hover:border-gray-300 font-medium transition-colors active:scale-95"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-gray-100 px-3 py-2.5 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2
                         text-sm text-gray-800 placeholder-gray-400 outline-none
                         focus:border-black focus:bg-white focus:ring-1 focus:ring-black
                         transition-all max-h-28 overflow-y-auto leading-relaxed"
              style={{ minHeight: '38px' }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 112) + 'px';
              }}
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                onClick={stopStreaming}
                className="shrink-0 w-9 h-9 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center
                           transition-colors active:scale-95"
                title="Dừng"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 w-9 h-9 bg-black hover:bg-gray-800 disabled:bg-gray-200
                           rounded-xl flex items-center justify-center text-white
                           transition-colors active:scale-95 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-300 mt-1.5 text-center">
            Powered by LM Studio · Qwen2.5 7B
          </p>
        </div>
      </div>

      {/* ── Floating Button ─────────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`
          fixed bottom-5 right-5 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300
          ${isOpen
            ? 'bg-gray-100 hover:bg-gray-200 rotate-0 text-black border border-gray-200'
            : 'bg-black hover:bg-gray-800 hover:scale-110 text-white'}
          active:scale-95
        `}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat tư vấn'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl select-none">💬</span>
        )}

        {/* Unread pulse (only when closed and not yet opened) */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-black border-2 border-white" />
          </span>
        )}
      </button>
    </>
  );
}
