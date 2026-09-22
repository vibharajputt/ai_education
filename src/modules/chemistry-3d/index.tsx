// src/modules/chemistry-3d/index.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Atom, FlaskConical, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface Molecule {
  name: string;
  formula: string;
  cid: number;
}

interface MechanismStep {
  cid: number;
  label: string;
  annotation: string;
  explanation: string;
}

interface Mechanism {
  title: string;
  steps: MechanismStep[];
}

interface ChemistryData {
  molecules: Molecule[];
  mechanisms: Mechanism[];
}

const STYLE_OPTIONS = ['stick', 'ball+stick', 'sphere'] as const;
type StyleOption = typeof STYLE_OPTIONS[number];

function use3DmolScript(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.$3Dmol) { setLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js';
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);
    document.head.appendChild(script);
  }, []);

  return loaded;
}

function MoleculeViewer({ cid, style: vizStyle }: { cid: number; style: StyleOption }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const scriptLoaded = use3DmolScript();
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  const load3D = useCallback(async () => {
    if (!viewerRef.current || !scriptLoaded || !window.$3Dmol) return;
    setLoading(true);
    setFallback(false);
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`
      );
      if (!res.ok) throw new Error('SDF fetch failed');
      const sdf = await res.text();

      if (!viewerInstance.current) {
        viewerInstance.current = window.$3Dmol.createViewer(viewerRef.current, {
          backgroundColor: 'transparent',
        });
      }
      const viewer = viewerInstance.current;
      viewer.removeAllModels();
      viewer.addModel(sdf, 'sdf');

      const s = vizStyle === 'ball+stick'
        ? { stick: {}, sphere: { scale: 0.3 } }
        : vizStyle === 'sphere'
        ? { sphere: {} }
        : { stick: {} };

      if (vizStyle === 'ball+stick') {
        viewer.setStyle({}, { stick: {} });
        viewer.setStyle({}, { sphere: { scale: 0.3 } });
      } else {
        viewer.setStyle({}, s);
      }
      viewer.zoomTo();
      viewer.render();
    } catch {
      setFallback(true);
    }
    setLoading(false);
  }, [cid, vizStyle, scriptLoaded]);

  useEffect(() => { load3D(); }, [load3D]);

  if (fallback) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <img
          src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`}
          alt={`Structure CID ${cid}`}
          className="max-h-48 object-contain rounded"
        />
        <p className="text-xs text-[var(--color-text-muted)]">2D structure (WebGL unavailable)</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] rounded-xl z-10">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        </div>
      )}
      <div ref={viewerRef} className="w-full h-72 rounded-xl bg-[var(--color-bg)]" />
    </div>
  );
}

export function Chemistry3DModule() {
  const [data, setData] = useState<ChemistryData | null>(null);
  const [tab, setTab] = useState<'molecules' | 'mechanisms'>('molecules');
  const [selectedMol, setSelectedMol] = useState<Molecule | null>(null);
  const [vizStyle, setVizStyle] = useState<StyleOption>('stick');
  const [mechIndex, setMechIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    fetch('/content/chemistry-3d.json')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setSelectedMol(d.molecules[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (tab !== 'mechanisms' || !data) return;
      const mech = data.mechanisms[mechIndex];
      if (e.key === 'ArrowRight') setStepIndex((s) => Math.min(s + 1, mech.steps.length - 1));
      if (e.key === 'ArrowLeft') setStepIndex((s) => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab, mechIndex, data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentMech = data.mechanisms[mechIndex];
  const currentStep = currentMech.steps[stepIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
          15 molecules + 4 organic mechanisms — Class 11–12 Chemistry
        </span>
        <h1 className="text-2xl font-black text-[var(--color-text)] mt-0.5">
          3D Molecule Viewer & Mechanisms
        </h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'molecules', label: 'Molecules', icon: Atom },
          { id: 'mechanisms', label: 'Mechanisms', icon: FlaskConical },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              tab === id
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── MOLECULES TAB ── */}
      {tab === 'molecules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Molecule grid */}
          <div className="lg:col-span-1 grid grid-cols-3 lg:grid-cols-2 gap-2 content-start">
            {data.molecules.map((mol) => (
              <button
                key={mol.cid}
                onClick={() => setSelectedMol(mol)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMol?.cid === mol.cid
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]/20'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/40'
                }`}
              >
                <div className="text-xs font-mono font-semibold text-[var(--color-accent)]">{mol.formula}</div>
                <div className="text-xs font-bold text-[var(--color-text)] mt-0.5 leading-tight">{mol.name}</div>
              </button>
            ))}
          </div>

          {/* Viewer */}
          <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4">
            {selectedMol && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[var(--color-text)]">{selectedMol.name}</h2>
                    <span className="text-sm font-mono text-[var(--color-accent)]">{selectedMol.formula}</span>
                  </div>
                  <div className="flex gap-1">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setVizStyle(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          vizStyle === s
                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                            : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                        }`}
                      >
                        {s === 'ball+stick' ? 'Ball+Stick' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <MoleculeViewer cid={selectedMol.cid} style={vizStyle} />
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Drag to rotate · Scroll to zoom · PubChem CID: {selectedMol.cid}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MECHANISMS TAB ── */}
      {tab === 'mechanisms' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mechanism list */}
          <div className="lg:col-span-1 space-y-2">
            {data.mechanisms.map((mech, i) => (
              <button
                key={i}
                onClick={() => { setMechIndex(i); setStepIndex(0); }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  mechIndex === i
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40'
                }`}
              >
                {mech.title}
              </button>
            ))}
          </div>

          {/* Step viewer */}
          <div className="lg:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[var(--color-text)]">{currentMech.title}</h2>
              <span className="text-xs text-[var(--color-text-muted)]">
                Step {stepIndex + 1} of {currentMech.steps.length}
              </span>
            </div>

            <MoleculeViewer cid={currentStep.cid} style="stick" />

            <div className="space-y-2">
              <div className="text-sm font-bold text-[var(--color-text)]">{currentStep.label}</div>
              <div className="text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-3 py-1.5 rounded-lg inline-block">
                {currentStep.annotation}
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{currentStep.explanation}</p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStepIndex((s) => Math.max(s - 1, 0))}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-accent)]/40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex gap-1.5">
                {currentMech.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStepIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === stepIndex ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setStepIndex((s) => Math.min(s + 1, currentMech.steps.length - 1))}
                disabled={stepIndex === currentMech.steps.length - 1}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-accent)]/40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[var(--color-text-muted)] ml-auto">← → keyboard navigation</span>
            </div>
          </div>
        </div>
      )}

      {/* Licence attribution */}
      <p className="text-[11px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4">
        3D rendering: <a href="https://3dmol.org" className="underline" target="_blank" rel="noreferrer">3Dmol.js</a> (BSD-3-Clause) ·
        Molecule data: <a href="https://pubchem.ncbi.nlm.nih.gov" className="underline" target="_blank" rel="noreferrer">PubChem</a> (public domain, NIH)
      </p>
    </div>
  );
}
