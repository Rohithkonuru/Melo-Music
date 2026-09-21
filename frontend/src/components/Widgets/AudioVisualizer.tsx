import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  color = '#8b5cf6',
  barCount = 28,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          // Dynamic procedural rhythm simulation
          const wave1 = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
          const wave2 = Math.cos(phase * 1.4 + i * 0.2) * 0.5 + 0.5;
          const wave3 = Math.sin(phase * 0.8 + i * 0.5) * 0.5 + 0.5;
          barHeight = Math.max(4, ((wave1 + wave2 + wave3) / 3) * (height - 8));
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient for visualizer bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      phase += isPlaying ? 0.08 : 0.01;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, color, barCount]);

  return (
    <div className="w-full h-16 flex items-center justify-center bg-slate-100/90 dark:bg-[#090b12]/80 rounded-2xl p-2 border border-slate-200 dark:border-[#212638] shadow-inner transition-colors">
      <canvas
        ref={canvasRef}
        width={320}
        height={50}
        className="w-full h-full"
      />
    </div>
  );
};
