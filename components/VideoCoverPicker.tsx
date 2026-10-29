'use client';
import { useEffect, useRef, useState } from 'react';

interface VideoCoverPickerProps {
  file: File;
  selectedTime: number | null;
  onSelectTime: (time: number) => void;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function VideoCoverPicker({ file, selectedTime, onSelectTime }: VideoCoverPickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setDuration(0);
    setCurrentTime(0);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function seekTo(time: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }

  return (
    <div className="space-y-3 rounded-xl border border-ac/15 bg-bg/70 p-3">
      <p className="text-sm text-tx">Scrub the video to a clear frame, then choose it as the cover.</p>
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => {
            const videoDuration = event.currentTarget.duration;
            if (Number.isFinite(videoDuration)) setDuration(videoDuration);
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
          aria-label="Preview video and choose a cover frame"
          className="max-h-64 w-full rounded-lg bg-black object-contain"
        />
      )}
      <label className="block space-y-1 text-xs text-mu">
        Preview position: {formatTime(currentTime)}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          disabled={!duration}
          onChange={(event) => seekTo(Number(event.currentTarget.value))}
          className="w-full accent-[rgb(var(--ac))]"
          aria-label="Seek to a video frame"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="ulink font-mono text-xs text-ac"
          disabled={!duration}
          onClick={() => onSelectTime(currentTime)}
        >
          Use this frame as cover
        </button>
        {selectedTime !== null && (
          <span role="status" className="text-xs text-mu">
            Cover frame selected at {formatTime(selectedTime)}.
          </span>
        )}
      </div>
    </div>
  );
}
