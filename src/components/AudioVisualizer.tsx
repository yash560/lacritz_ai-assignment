"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  audioStream: MediaStream | null;
}

export default function AudioVisualizer({
  isRecording,
  audioStream
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (isRecording && audioStream) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new AudioCtx();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      } catch (err) {
        console.warn("AudioContext init error:", err);
      }
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const numBars = 32;
      const barWidth = Math.max(2, (width / numBars) - 2);

      if (isRecording) {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray as any);
        }

        for (let i = 0; i < numBars; i++) {
          let value = 0;
          if (dataArray && dataArray.length > 0) {
            const index = Math.floor((i / numBars) * dataArray.length);
            value = (dataArray[index] / 255) * height;
          } else {
            // Simulated subtle rhythmic wave when audioContext stream is synthetic
            const time = Date.now() * 0.005;
            value = (Math.sin(time + i * 0.3) * 0.4 + 0.6) * (height * 0.7);
          }

          const barHeight = Math.max(4, value);
          const x = i * (barWidth + 2);
          const y = height / 2 - barHeight / 2;

          // Gradient bar
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, "#06b6d4"); // cyan
          gradient.addColorStop(0.5, "#3b82f6"); // blue
          gradient.addColorStop(1, "#10b981"); // emerald

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        // Idle flat waveform line
        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + 2);
          const barHeight = 3;
          const y = height / 2 - barHeight / 2;

          ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (source) {
        try { source.disconnect(); } catch {}
      }
      if (audioContext && audioContext.state !== "closed") {
        try { audioContext.close(); } catch {}
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={380}
        height={48}
        className="w-full max-w-md h-12 rounded-lg"
      />
    </div>
  );
}
