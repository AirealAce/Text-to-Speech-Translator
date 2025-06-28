import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = 'edge';

const openai = new OpenAI();

export async function POST(req: Request) {
  const body = await req.json();

  const base64Audio = body.audio;

  // Convert the base64 audio data to a Buffer
  const audio = Buffer.from(base64Audio, "base64");

  try {
    // Create a Blob from the audio data for the OpenAI API
    const audioBlob = new Blob([audio], { type: 'audio/wav' });
    
    // Create a File object from the Blob
    const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

    const data = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
