import { StreamingTextResponse, Message } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  const response = await anthropic.messages.create({
    messages: messages.map((m: Message) => ({
      role: m.role,
      content: m.content,
    })),
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    stream: true,
  });

  // @ts-ignore - Anthropic's types are not up to date
  return new StreamingTextResponse(response);
}
