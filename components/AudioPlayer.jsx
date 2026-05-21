"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Play, Pause, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";

function pickVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  return (
    voices.find(
      (voice) =>
        voice.name === "Google UK English Male" && voice.lang === "en-GB",
    ) ||
    voices.find((voice) => voice.lang === "en-GB") ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
    voices[0]
  );
}

export default function AudioPlayer({ text, title = "Audio", subtitle }) {
  const synthRef = useRef(null);
  const [voices, setVoices] = useState([]);
  const [supported, setSupported] = useState(true);
  const [speakingRate, setSpeakingRate] = useState(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return undefined;
    }

    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const refreshVoices = () => {
      const nextVoices = synth.getVoices();
      setVoices(nextVoices);
      const preferred = pickVoice(nextVoices);
      if (preferred) {
        setSelectedVoiceName(preferred.name);
      }
    };

    refreshVoices();
    synth.addEventListener?.("voiceschanged", refreshVoices);

    return () => {
      synth.cancel();
      synth.removeEventListener?.("voiceschanged", refreshVoices);
    };
  }, []);

  const voice = useMemo(() => {
    if (!voices.length) return null;
    return (
      voices.find((item) => item.name === selectedVoiceName) ||
      pickVoice(voices)
    );
  }, [voices, selectedVoiceName]);

  const speak = (rate) => {
    if (!supported || !text || !synthRef.current) return;

    const synth = synthRef.current;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = rate;
    utterance.pitch = 0.75;
    utterance.volume = 1;
    utterance.voice = voice;

    utterance.onend = () => setSpeakingRate(null);
    utterance.onerror = () => setSpeakingRate(null);

    setSpeakingRate(rate);
    synth.speak(utterance);
  };

  const stop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setSpeakingRate(null);
  };

  if (!supported) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Browser ini belum mendukung Web Speech Synthesis API.
        </p>
      </div>
    );
  }

  const isNormalSpeaking = speakingRate === 1;
  const isSlowSpeaking = speakingRate === 0.75;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Suara: Google UK English Male (en-GB)
            {voice?.name && voice.name !== "Google UK English Male"
              ? ` · fallback: ${voice.name}`
              : ""}
          </p>
          {subtitle ? (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <Clock3 className="h-3.5 w-3.5" />
          {speakingRate ? `Playing x${speakingRate}` : "Ready"}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant={isNormalSpeaking ? "default" : "outline"}
          onClick={() => (isNormalSpeaking ? stop() : speak(1))}
          className="rounded-2xl flex-1 h-12 font-semibold"
        >
          {isNormalSpeaking ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isNormalSpeaking ? "Stop Normal" : "Normal"}
        </Button>
        <Button
          type="button"
          variant={isSlowSpeaking ? "default" : "outline"}
          onClick={() => (isSlowSpeaking ? stop() : speak(0.75))}
          className="rounded-2xl flex-1 h-12 font-semibold"
        >
          {isSlowSpeaking ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isSlowSpeaking ? "Stop Slow" : "Slow"}
        </Button>
      </div>
    </div>
  );
}
