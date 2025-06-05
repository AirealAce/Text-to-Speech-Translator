import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// IMPORTANT: Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if we have an API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key is not configured. Please add your API key to .env.local file.',
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Ask OpenAI for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: messages.map((message: any) => ({
        content: message.content,
        role: message.role,
      })),
    });

    // Convert the response into a friendly text-stream
    return new StreamingTextResponse(OpenAIStream(response as any));
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Handle specific error cases
    if (error?.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API quota exceeded. Please check your billing details at platform.openai.com/account/billing',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during your request.',
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 