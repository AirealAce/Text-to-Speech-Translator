import { StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(text);
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
}
