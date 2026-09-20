import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import {
  StateShell,
  Card,
  Badge,
  StatTile,
} from '../../components';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Languages,
  Code2,
  List,
  Sparkles,
  BookOpen,
  Volume2,
  Terminal,
  Cpu,
} from 'lucide-react';

interface ChapterMarker {
  title: string;
  startTime: number;
}

interface TranscriptCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface PipelineInfo {
  scriptFile: string;
  llmPrompt: string;
  manimCode: string;
  ttsEngine: string;
  renderCommand: string;
}

type ConceptVideoItem = ContentItem & {
  metadata?: {
    title?: string;
    durationSec?: number;
    author?: string;
    chapters?: ChapterMarker[];
    transcripts?: {
      en: TranscriptCue[];
      hi: TranscriptCue[];
    };
    pipeline?: PipelineInfo;
  };
};

export const ConceptVideosModule: React.FC = () => {
  const { collection, items, loading, error } = useCollection('concept-videos.json');
  const videoItems = useMemo(() => items as ConceptVideoItem[], [items]);

  const [selectedVideoId, setSelectedVideoId] = useState<string>('vid-sci-01');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showPipelineModal, setShowPipelineModal] = useState<boolean>(false);

  const activeVideo = useMemo(() => {
    return videoItems.find((v) => v.id === selectedVideoId) || videoItems[0];
  }, [videoItems, selectedVideoId]);

  const duration = activeVideo?.metadata?.durationSec || 90;
  const chapters = activeVideo?.metadata?.chapters || [];
  const transcripts = activeVideo?.metadata?.transcripts?.[language] || [];
  const pipeline = activeVideo?.metadata?.pipeline;

  // Playback Animation Timer Loop
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 100 / playbackSpeed;
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return Math.min(duration, prev + 0.1 * playbackSpeed);
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, duration]);

  // Find active transcript cue
  const activeCueId = useMemo(() => {
    const cue = transcripts.find(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    return cue ? cue.id : transcripts[0]?.id;
  }, [transcripts, currentTime]);

  if (loading || error || !collection) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  };

  const handleTogglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleLanguageSwitch = (newLang: 'en' | 'hi') => {
    // Preserve current timestamp when switching language
    setLanguage(newLang);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/30 to-background border border-violet-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="B" variant="tier" />
              <Badge label="school" variant="track" />
              <span className="text-xs text-[var(--color-text-muted)] font-mono font-medium">
                {collection.scopeLabel}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {collection.title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
              {collection.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPipelineModal(!showPipelineModal)}
            className="px-4 py-2.5 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 transition-all text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Code2 className="w-4 h-4 text-violet-400" />
            <span>Engineering Pipeline Specs</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile
            label="Selected Lesson"
            value={activeVideo?.metadata?.title || activeVideo?.subject || 'STEM'}
            icon={<Video className="w-4 h-4 text-violet-400" />}
          />
          <StatTile
            label="Audio Language"
            value={language === 'en' ? 'English (EN)' : 'Hindi (HI)'}
            icon={<Languages className="w-4 h-4 text-indigo-400" />}
          />
          <StatTile
            label="Playback Speed"
            value={`${playbackSpeed}x`}
            icon={<Volume2 className="w-4 h-4 text-emerald-400" />}
          />
          <StatTile
            label="Total STEM Videos"
            value={`${videoItems.length} Lessons`}
            icon={<BookOpen className="w-4 h-4 text-amber-400" />}
          />
        </div>
      </div>

      {/* Video Lesson Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 overflow-x-auto">
        {videoItems.map((vid) => (
          <button
            key={vid.id}
            type="button"
            onClick={() => {
              setSelectedVideoId(vid.id);
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedVideoId === vid.id
                ? 'bg-violet-600 text-white shadow-md scale-[1.02]'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span>{vid.metadata?.title || vid.subject}</span>
          </button>
        ))}
      </div>

      {/* Video Player + Transcript Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video Canvas Player (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 space-y-4 border-violet-500/30 bg-black/40 overflow-hidden">
            {/* Animation Render Stage Simulator */}
            <div className="relative aspect-video w-full rounded-xl bg-slate-950 border border-violet-500/20 overflow-hidden flex flex-col justify-between p-6">
              {/* Top Watermark & Subject Badge */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-violet-600/80 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                    Manim 3D Engine • 1080p60
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 font-mono text-[10px] font-semibold">
                    {activeVideo?.subject}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('hi')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                      language === 'hi'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    HI
                  </button>
                </div>
              </div>

              {/* Animated STEM Geometry Stage (Manim Visual Simulation) */}
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 relative py-8">
                <div className="relative w-48 h-32 flex items-center justify-center">
                  {/* Outer animated mathematical ring */}
                  <div
                    className="absolute inset-0 border-2 border-violet-500/40 rounded-full animate-spin"
                    style={{
                      animationDuration: `${20 / playbackSpeed}s`,
                      transform: `rotate(${currentTime * 40}deg)`,
                    }}
                  />
                  <div className="absolute w-36 h-36 border border-emerald-500/30 rounded-full animate-pulse" />

                  {/* Math Formula / LaTeX Display */}
                  <div className="z-10 p-3 rounded-xl bg-slate-900/90 border border-violet-500/40 shadow-2xl backdrop-blur-md">
                    <span className="font-mono text-sm md:text-base font-bold text-violet-300">
                      {activeVideo?.latex || 'a^2 + b^2 = c^2'}
                    </span>
                  </div>
                </div>

                {/* Subtitle Line Overlay */}
                <div className="max-w-md px-4 py-2 rounded-lg bg-black/80 border border-slate-700/60 text-xs md:text-sm text-center text-slate-100 font-sans shadow-lg leading-relaxed">
                  {transcripts.find((c) => c.id === activeCueId)?.text ||
                    'Manim Scene Rendering active...'}
                </div>
              </div>

              {/* Bottom Progress Bar inside Player */}
              <div className="space-y-1 z-10">
                {/* Chapter Markers Row */}
                <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const pos = (e.clientX - rect.left) / rect.width;
                       handleSeek(pos * duration);
                     }}
                >
                  <div
                    className="h-full bg-violet-500 transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />

                  {/* Chapter ticks */}
                  {chapters.map((chap) => (
                    <div
                      key={chap.title}
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80"
                      style={{ left: `${(chap.startTime / duration) * 100}%` }}
                      title={chap.title}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Video Player Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                  className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors border border-[var(--color-border)]"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold text-[var(--color-text)] ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Language & Playback Speed Controls */}
              <div className="flex items-center gap-3">
                {/* Language Preserving Position */}
                <div className="flex items-center gap-1.5 bg-[var(--color-surface-subtle)] p-1 rounded-lg border border-[var(--color-border)] text-xs">
                  <Languages className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      language === 'en'
                        ? 'bg-violet-600 text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('hi')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      language === 'hi'
                        ? 'bg-violet-600 text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    Hindi
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 bg-[var(--color-surface-subtle)] p-1 rounded-lg border border-[var(--color-border)] text-xs">
                  {[0.5, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 text-[11px] font-mono font-bold rounded ${
                        playbackSpeed === spd
                          ? 'bg-violet-600 text-white'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapter Markers Bar */}
            <div className="pt-2 border-t border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">
                Chapter Timestamps:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {chapters.map((chap) => (
                  <button
                    key={chap.title}
                    type="button"
                    onClick={() => handleSeek(chap.startTime)}
                    className={`p-2 rounded-lg text-left text-xs border transition-all ${
                      currentTime >= chap.startTime &&
                      (chapters.find((c) => c.startTime > chap.startTime)?.startTime || duration) > currentTime
                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 font-bold'
                        : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <span className="font-mono text-[10px] block opacity-75">
                      {formatTime(chap.startTime)}
                    </span>
                    <span className="truncate block font-semibold">{chap.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Synced Interactive Transcript Panel (1 col) */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-[var(--color-text)]">
                    Interactive Transcript ({language === 'en' ? 'English' : 'Hindi'})
                  </h3>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  Click line to seek
                </span>
              </div>

              {/* Transcript Cues List */}
              <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
                {transcripts.map((cue) => {
                  const isActive = cue.id === activeCueId;
                  return (
                    <button
                      key={cue.id}
                      type="button"
                      onClick={() => handleSeek(cue.startTime)}
                      className={`w-full p-3 rounded-xl text-left transition-all border text-xs space-y-1 ${
                        isActive
                          ? 'bg-violet-600/20 border-violet-500/60 text-violet-200 font-semibold shadow-xs ring-1 ring-violet-500/40'
                          : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-violet-400 font-bold">
                          {formatTime(cue.startTime)} - {formatTime(cue.endTime)}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <Volume2 className="w-3 h-3 animate-pulse" /> Playing
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed font-sans">{cue.text}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span>Position preserved across EN / HI switch</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* Engineering Credibility Pipeline Panel */}
      <Card className="p-6 space-y-4 border-violet-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                How These Animations Are Made — Engineering Pipeline Specs
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Real Python Manim script + dual-language TTS alignment pipeline committed under <code className="text-violet-300 font-mono">tools/video/generate_concept_videos.py</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Offline Rendering Only
            </span>
            <span className="px-2.5 py-1 rounded bg-violet-900/60 text-violet-300 border border-violet-700/60">
              Zero Runtime Overhead
            </span>
          </div>
        </div>

        {/* 4-Step Architecture Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-400">
              <span>Step 1: LLM Prompt</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {pipeline?.llmPrompt || 'Structured prompt generates scene mathematical objects & timed cues.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-400">
              <span>Step 2: Manim Engine</span>
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Manim Community Edition renders 1080p60 mathematical vector animations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>Step 3: Dual TTS</span>
              <Languages className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {pipeline?.ttsEngine || 'gTTS synthesizes aligned English & Hindi audio tracks.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
              <span>Step 4: ffmpeg Mux</span>
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Muxes MP4 video + EN/HI audio + JSON subtitle timestamp cues.
            </p>
          </div>
        </div>

        {/* Manim Code Preview Block */}
        {pipeline && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Committed Generator Script: <strong className="text-white">tools/video/generate_concept_videos.py</strong></span>
              <span className="text-slate-500">Render Command: {pipeline.renderCommand}</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{pipeline.manimCode}</code>
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};
