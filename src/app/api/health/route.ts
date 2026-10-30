import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Parakeet AI Desktop Copilot",
    version: "1.0.0",
    runtime: "Next.js 15 + React 19",
    timestamp: new Date().toISOString(),
    capabilities: [
      "Microphone Audio Capture",
      "Real-time Speech-to-Text Transcription",
      "Progressive Streaming Local LLM Inference",
      "Ollama Local Runtime Integration",
      "Multi-Mode Meeting Copilot Engine"
    ]
  });
}
