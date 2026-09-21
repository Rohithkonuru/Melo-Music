import React, { useMemo } from 'react';
import { Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface LyricsWidgetProps {
  song: Song;
}

export const LyricsWidget: React.FC<LyricsWidgetProps> = ({ song }) => {
  const { currentTime, seek } = usePlayer();

  // Procedurally generated synchronized lyrics based on track title, artist, and mood
  const lyricLines = useMemo(() => {
    const d = song.duration || 180;
    const interval = Math.max(6, Math.floor(d / 12));

    const moodPhrases: Record<string, string[]> = {
      Chill: [
        'Gentle waves beneath the midnight sky...',
        'Drifting through the quiet avenues of thought',
        'Soft ambient chords floating into space',
        'Breathing in the warmth of fading twilight',
        'Every second melts into harmony',
        'Lost between the stars and silent memories',
        'A soothing rhythm guiding us back home',
        'Nothing left to chase, just serenity now',
        'Echoes of calmness in the night breeze',
        'Peace settles softly over the horizon',
      ],
      Workout: [
        'Ignite the spark, feel the surge within!',
        'Push past the limits, break the barrier now',
        'High voltage running through every single vein',
        'Never backing down, rising with the beat',
        'Unstoppable velocity taking command',
        'Heavy bass pulses pounding in the chest',
        'Power elevated to the maximum degree',
        'Champions are born inside the rhythm',
        'No surrender, full throttle to the end',
      ],
      Focus: [
        'Lines of logic falling smoothly into place',
        'Clear frequency, uninterrupted mind',
        'A steady cadence leading through the maze',
        'Deep focus unlocked, clarity restored',
        'Building the future note by resonant note',
        'Quiet momentum driving every thought',
        'The architecture of pure concentration',
      ],
      Romantic: [
        'Your eyes like constellations across the dark',
        'Holding this timeless moment in our hands',
        'Every heartbeat synced to this sweet refrain',
        'Dancing slowly underneath the streetlights',
        'A whisper carried on the autumn wind',
        'Forever caught inside this melody with you',
      ],
      default: [
        `Listening to "${song.title}" by ${song.artistName}`,
        'Melodies echoing through the soundscape',
        'Rhythms resonating deep within the soul',
        'Music that speaks when words cannot explain',
        'Harmonies blending seamlessly into the atmosphere',
        'Feeling the emotional cadence of the track',
        'A beautiful journey through sound and emotion',
      ],
    };

    const phrases = moodPhrases[song.mood] || moodPhrases.default;

    return phrases.map((text, idx) => ({
      time: idx * interval,
      text,
    }));
  }, [song]);

  // Find active line
  let activeIndex = 0;
  for (let i = 0; i < lyricLines.length; i++) {
    if (currentTime >= lyricLines[i].time) {
      activeIndex = i;
    }
  }

  return (
    <div className="h-48 overflow-y-auto space-y-3 p-3 scrollbar-none text-center">
      {lyricLines.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <p
            key={idx}
            onClick={() => seek(line.time)}
            className={`transition-all duration-300 cursor-pointer text-sm md:text-base font-medium select-none ${
              isActive
                ? 'text-purple-600 dark:text-purple-300 font-bold scale-105 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)] bg-purple-50 dark:bg-purple-900/20 py-1.5 px-3 rounded-xl border border-purple-200 dark:border-purple-500/30'
                : isPast
                ? 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                : 'text-slate-500 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400'
            }`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
};
