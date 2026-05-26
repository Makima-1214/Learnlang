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
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-3 shadow-sm flex items-center gap-4">
      <button
        type="button"
        onClick={() => (isNormalSpeaking ? stop() : speak(1))}
        className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isNormalSpeaking ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md scale-105" : "bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF] border-2 border-[#C7D2FE]"
        }`}
      >
        {isNormalSpeaking ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-1" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-800">
          {title}
        </p>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
          {isNormalSpeaking ? "Sedang memutar audio..." : "Putar audio untuk mendengar"}
        </p>
      </div>
    </div>
  );
}
