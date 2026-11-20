import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Square, Volume2, VolumeX } from 'lucide-react';
import type { VoiceOption } from '../utils/voiceEngine';
import type { LiveConnectionState } from '../utils/liveAudioClient';

interface VoiceVisualizerProps {
  listening: boolean;
  speaking: boolean;
  muted: boolean;
  continuous: boolean;
  interimTranscript: string;
  voices: VoiceOption[];
  selectedVoiceId: string;
  onToggleListening: () => void;
  onInterrupt: () => void;
  onToggleMute: () => void;
  onToggleContinuous: () => void;
  onSelectVoice: (id: string) => void;
  // Live Gemini 3.8 Bidirectional Audio
  liveState: LiveConnectionState;
  liveInputTranscript: string;
  liveOutputTranscript: string;
  onToggleLiveSession: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  listening,
  speaking,
  muted,
  continuous,
  interimTranscript,
  voices,
  selectedVoiceId,
  onToggleListening,
  onInterrupt,
  onToggleMute,
  onToggleContinuous,
  onSelectVoice,
  liveState,
  liveInputTranscript,
  liveOutputTranscript,
  onToggleLiveSession,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveActive = liveState === 'connected' || liveState === 'connecting';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = 36;
      const gap = 3;
      const barW = (w - gap * (bars - 1)) / bars;
      const active = listening || speaking || liveState === 'connected';

      for (let i = 0; i < bars; i++) {
        const norm = i / bars;
        const envelope = Math.sin(norm * Math.PI);
        const wave = active
          ? 0.25 +
            0.75 *
              Math.abs(
                Math.sin(phase * (speaking ? 0.14 : 0.09) + i * 0.42) *
                  Math.cos(phase * 0.05 + i * 0.18)
              )
          : 0.08;
        const barH = Math.max(4, h * wave * (0.4 + 0.6 * envelope));
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        ctx.fillStyle = speaking
          ? 'rgba(139, 92, 246, 0.85)'
          : liveState === 'connected'
            ? 'rgba(16, 185, 129, 0.88)'
            : listening
              ? 'rgba(59, 130, 246, 0.88)'
              : 'rgba(148, 163, 184, 0.22)';
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }

      if (active) phase += 1;
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [listening, speaking, liveState]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-sm rounded-xl p-3 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleLiveSession}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              liveState === 'connected'
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : liveState === 'connecting'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {liveState === 'connected'
              ? 'End Live Voice'
              : liveState === 'connecting'
                ? 'Connecting Live...'
                : 'Gemini Live Voice'}
          </button>

          <button
            type="button"
            onClick={onToggleListening}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              listening
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80'
            }`}
          >
            {listening ? (
              <>
                <Mic className="w-3.5 h-3.5" />
                Listening
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5" />
                Voice Command
              </>
            )}
          </button>

          {speaking && (
            <button
              type="button"
              onClick={onInterrupt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Square className="w-3 h-3 fill-current" />
              Interrupt
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? 'Unmute assistant speech' : 'Mute assistant speech'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              muted
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {muted ? 'Muted' : 'Audio On'}
          </button>

          {!liveActive && (
            <button
              type="button"
              onClick={onToggleContinuous}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                continuous
                  ? 'bg-violet-50 text-violet-700 border border-violet-200'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Continuous: {continuous ? 'On' : 'Off'}
            </button>
          )}
        </div>

        <select
          aria-label="Select assistant voice"
          value={selectedVoiceId}
          onChange={(e) => onSelectVoice(e.target.value)}
          className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 max-w-[230px] focus:outline-none focus:border-blue-500"
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <canvas
          ref={canvasRef}
          width={280}
          height={32}
          className="w-44 h-8 shrink-0"
        />
        <div className="flex-1 min-w-0 text-xs text-neutral-500 truncate">
          {liveOutputTranscript ? (
            <span className="text-emerald-700">SCOPE-X Live: “{liveOutputTranscript}”</span>
          ) : liveInputTranscript ? (
            <span className="text-blue-700">You: “{liveInputTranscript}”</span>
          ) : interimTranscript ? (
            <span className="text-blue-700">“{interimTranscript}”</span>
          ) : liveState === 'connected' ? (
            <span className="text-emerald-700">
              gemini-3.8-live bidirectional stream open — speak freely or interrupt anytime
            </span>
          ) : speaking ? (
            <span className="text-violet-700">Speaking response... (speak or click Interrupt)</span>
          ) : listening ? (
            <span>Speak naturally — commands execute across SCOPE-X</span>
          ) : (
            <span>Voice standby · Gemini 3.8 Live & Neural TTS ready</span>
          )}
        </div>
      </div>
    </div>
  );
};
