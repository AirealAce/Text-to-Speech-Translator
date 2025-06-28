import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

export const runtime = 'edge';

const openai = new OpenAI();

export async function POST(req: Request) {
  const body = await req.json();

  const base64Audio = body.audio;

  // Convert the base64 audio data to a Buffer
  const audio = Buffer.from(base64Audio, "base64");

  // Define the file path for storing the temporary WAV file
  const tmpDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(tmpDir, "input.wav");

  try {
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Write the audio data to a temporary WAV file synchronously
    fs.writeFileSync(filePath, audio);

    // Create a readable stream from the temporary WAV file
    const readStream = fs.createReadStream(filePath);

    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Remove the temporary file after successful processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
