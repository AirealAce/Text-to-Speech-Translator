import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, voice_id, model_id, voice_settings } = await request.json();

    // Check if API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key is not configured');
      return NextResponse.json({ error: 'ElevenLabs API key is not configured' }, { status: 500 });
    }

    console.log('Making request to ElevenLabs API...');
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: model_id || 'eleven_multilingual_v2',
          voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json({ 
        error: 'Failed to generate speech',
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        }
      }, { status: 500 });
    }

    // ElevenLabs returns audio/mpeg
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 