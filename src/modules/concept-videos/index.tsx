// src/modules/concept-videos/index.tsx
import React, { useState } from 'react';
import { Video, Languages, ChevronDown, ChevronUp, Play, Info } from 'lucide-react';

interface VideoEntry {
  id: string;
  topic: string;
  hiTitle: string;
  subject: string;
  script: string;
  hiScript: string;
  color: string;
}

const VIDEOS: VideoEntry[] = [
  {
    id: 'v1', subject: 'Physics',
    topic: 'Light Reflection & Refraction',
    hiTitle: 'प्रकाश परावर्तन और अपवर्तन',
    color: '#6366f1',
    script: 'Covers laws of reflection, mirror formula (1/v + 1/u = 1/f), refraction at plane surfaces, Snell\'s Law (n₁ sin θ₁ = n₂ sin θ₂), and the lens formula for Class 10 Physics. Includes ray diagrams for concave and convex mirrors.',
    hiScript: 'Class 10 Physics — परावर्तन के नियम, दर्पण सूत्र (1/v + 1/u = 1/f), अपवर्तन, स्नेल का नियम (n₁ sin θ₁ = n₂ sin θ₂), और लेंस सूत्र को cover करता है। अवतल और उत्तल दर्पणों के किरण आरेख शामिल हैं।',
  },
  {
    id: 'v2', subject: 'Mathematics',
    topic: 'Quadratic Equations',
    hiTitle: 'द्विघात समीकरण',
    color: '#10b981',
    script: 'Explains factorisation, completing the square, the quadratic formula x = (−b ± √(b²−4ac)) / 2a, nature of roots via discriminant D = b²−4ac, and real-world application problems for Class 10 Maths.',
    hiScript: 'Class 10 गणित — गुणनखंड विधि, वर्ग पूर्ण करना, द्विघात सूत्र x = (−b ± √(b²−4ac)) / 2a, विविक्तकर D = b²−4ac से मूलों की प्रकृति, और व्यावहारिक समस्याएँ cover की गई हैं।',
  },
  {
    id: 'v3', subject: 'Chemistry',
    topic: 'Chemical Reactions & Equations',
    hiTitle: 'रासायनिक अभिक्रियाएँ और समीकरण',
    color: '#f59e0b',
    script: 'Covers balancing chemical equations using conservation of mass, types of reactions (combination, decomposition, displacement, double displacement, oxidation-reduction), and identifying oxidising/reducing agents for Class 10.',
    hiScript: 'Class 10 — द्रव्यमान संरक्षण से समीकरण संतुलन, अभिक्रियाओं के प्रकार (संयोजन, वियोजन, विस्थापन, द्विविस्थापन, ऑक्सीकरण-अपचयन), और ऑक्सीकारक/अपचायक पहचान cover करता है।',
  },
  {
    id: 'v4', subject: 'Mathematics',
    topic: 'Trigonometry',
    hiTitle: 'त्रिकोणमिति',
    color: '#ec4899',
    script: 'Trigonometric ratios (sin, cos, tan, cosec, sec, cot), standard angles (0°, 30°, 45°, 60°, 90°), complementary angles, Pythagorean identities, and height & distance applications for Class 10.',
    hiScript: 'Class 10 — त्रिकोणमितीय अनुपात (sin, cos, tan, cosec, sec, cot), मानक कोण (0°, 30°, 45°, 60°, 90°), पूरक कोण, पाइथागोरस सर्वसमिकाएँ, और ऊँचाई-दूरी के प्रयोग।',
  },
  {
    id: 'v5', subject: 'Physics',
    topic: 'Electricity',
    hiTitle: 'विद्युत',
    color: '#3b82f6',
    script: 'Electric potential & current (I = Q/t), Ohm\'s Law (V = IR), resistance factors, series & parallel circuits, power (P = VI = I²R = V²/R), and the heating effect of current for Class 10 Physics.',
    hiScript: 'Class 10 — विद्युत विभव और धारा (I = Q/t), ओम का नियम (V = IR), प्रतिरोध के कारक, श्रेणी और समानांतर परिपथ, शक्ति (P = VI = I²R = V²/R), और धारा का ऊष्मीय प्रभाव।',
  },
  {
    id: 'v6', subject: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    hiTitle: 'अम्ल, क्षारक और लवण',
    color: '#8b5cf6',
    script: 'Arrhenius theory, pH scale, neutralisation reactions (acid + base → salt + water), pH indicators, preparation and properties of NaOH, HCl, Na₂CO₃, NaHCO₃, bleaching powder, and baking soda for Class 10.',
    hiScript: 'Class 10 — अरेनियस सिद्धांत, pH पैमाना, उदासीनीकरण अभिक्रिया (अम्ल + क्षारक → लवण + जल), pH सूचक, NaOH, HCl, Na₂CO₃, NaHCO₃, विरंजक चूर्ण और बेकिंग सोडा के गुण।',
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  Mathematics: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  Chemistry: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
};

function VideoCard({ video }: { video: VideoEntry }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [open, setOpen] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-accent)]/40 transition-all">
      {/* Thumbnail */}
      <div
        className="h-36 flex flex-col items-center justify-center gap-2 relative"
        style={{ background: `${video.color}18`, borderBottom: `2px solid ${video.color}30` }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
          style={{ background: video.color }}
        >
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </div>
        <div className="text-center px-3">
          <p className="text-xs font-bold text-[var(--color-text)] line-clamp-1">
            {lang === 'en' ? video.topic : video.hiTitle}
          </p>
        </div>
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: video.color }}>
          Rendering Soon
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {lang === 'en' ? video.topic : video.hiTitle}
            </h3>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SUBJECT_COLORS[video.subject]}`}>
              {video.subject}
            </span>
          </div>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 text-[var(--color-text-muted)] transition-colors flex-shrink-0"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        {/* Script preview */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-accent)] hover:underline text-left"
        >
          <span>View narration script</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)]">
            {lang === 'en' ? video.script : video.hiScript}
          </p>
        )}

        {/* Pipeline info */}
        <button
          onClick={() => setShowPipeline(p => !p)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-left"
        >
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> How this is made</span>
          {showPipeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showPipeline && (
          <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)] space-y-1.5">
            <p className="font-semibold text-[var(--color-text)]">Generation Pipeline</p>
            <div className="font-mono text-[10px] space-y-1">
              <p>1. <span className="text-[var(--color-accent)]">Planner LLM</span> → scene-by-scene blueprint (JSON)</p>
              <p>2. <span className="text-[var(--color-accent)]">Coder LLM</span> → Manim Python animation code</p>
              <p>3. <span className="text-[var(--color-accent)]">Validator</span> → compile check + SymPy math verify</p>
              <p>4. <span className="text-[var(--color-accent)]">AI4Bharat IndicF5</span> → Hindi + English TTS narration</p>
              <p>5. <span className="text-[var(--color-accent)]">WhisperX</span> → word-level timestamp alignment</p>
              <p>6. <span className="text-[var(--color-accent)]">FFmpeg</span> → final MP4 mux</p>
            </div>
            <p className="text-[10px]">
              Generator script:{' '}
              <code className="bg-[var(--color-surface)] px-1 rounded">tools/video/generate_concept_videos.py</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConceptVideosModule() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
          6 animated concept explainers — Maths & Science, Hindi + English
        </span>
        <h1 className="text-2xl font-black text-[var(--color-text)] mt-0.5">
          Concept Explainer Videos
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1.5">
          <Video className="w-4 h-4 text-[var(--color-accent)]" />
          Generated with Manim animation + AI4Bharat IndicF5 TTS. Videos render offline — toggle language, read scripts, and see the pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {VIDEOS.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
