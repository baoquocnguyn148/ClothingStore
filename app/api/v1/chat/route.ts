import { NextRequest } from 'next/server';
import { LMStudioClient } from '@/lib/server/chat/lmstudio.client';
import { buildSystemPrompt } from '@/lib/server/chat/context-builder';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Array<{ role: string; content: string }> = body.messages ?? [];

    if (!messages.length) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const userMessage = messages.findLast(m => m.role === 'user')?.content ?? '';

    // Build RAG context system prompt
    const systemPrompt = await buildSystemPrompt(userMessage);

    // Build message array: system + last 10 messages
    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const client = new LMStudioClient();

    // Check availability
    const available = await client.isAvailable();
    if (!available) {
      return Response.json(
        { error: 'AI service (LM Studio) is not available. Please ensure LM Studio is running on port 1234.' },
        { status: 503 }
      );
    }

    const stream = await client.chatStream(llmMessages);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[Chat API] Error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const client = new LMStudioClient();
  const available = await client.isAvailable();
  return Response.json({ available, model: process.env.LM_STUDIO_MODEL ?? 'qwen2.5-7b-instruct' });
}
