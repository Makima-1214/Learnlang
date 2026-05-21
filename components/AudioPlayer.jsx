"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AudioPlayer({ audioUrl, title = "Audio" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
      setError(""); // Clear any previous errors on successful load
      retryCountRef.current = 0; // Reset retry count
    };

    const handleTimeUpdate = () => {
      setCurrent(audio.currentTime);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    const handleEnded = () => {
      setPlaying(false);
    };

    const handleError = (e) => {
      console.error("Audio load error:", e);

      // Try to retry loading the audio
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(
          `Retrying audio load (${retryCountRef.current}/${maxRetries})...`,
        );

        // Reset the audio source and retry
        setTimeout(() => {
          if (audio) {
            audio.load();
          }
        }, 1000 * retryCountRef.current); // Exponential backoff
      } else {
        // Final error after retries
        setError("Failed to load audio - please check the URL");
        setLoading(false);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("progress", handleProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Reset retry count and loading state when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      retryCountRef.current = 0;
      setLoading(true);
      setError("");
      setPlaying(false);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Play error:", err);
          setError("Could not play audio");
        });
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">{error}</p>
          <p className="text-xs text-red-700 mt-1 break-all">{audioUrl}</p>
          <p className="text-xs text-red-600 mt-2">
            💡 Try using a CORS-enabled audio URL like:{" "}
            <code className="bg-red-100 px-1 rounded">
              https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlay}
          disabled={loading || error}
          className="rounded-full p-2 h-10 w-10"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1">
          <div
            onClick={handleSeek}
            className="relative h-2 bg-slate-200 rounded-full cursor-pointer group hover:h-3 transition-all"
          >
            {/* Buffered progress */}
            <div
              className="absolute h-full bg-slate-300 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Current progress */}
            <div
              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${(current / duration) * 100}%` }}
            />
            {/* Seek handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${(current / duration) * 100}% - 8px)` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <span>{formatTime(current)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {title && (
        <p className="mt-3 text-xs text-slate-600 flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          {title}
        </p>
      )}
    </div>
  );
}
