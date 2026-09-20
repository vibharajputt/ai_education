import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCollection } from '@core/loaders';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  Atom,
  RotateCw,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';

export type ViewerStyle = 'stick' | 'ball-and-stick' | 'spacefill';

// WebGL support detector
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Dynamically load 3Dmol script if not present
function load3DmolScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).$3Dmol) {
      resolve();
      return;
    }
    const existing = document.getElementById('3dmol-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = '3dmol-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.0.4/3Dmol-min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export function Chemistry3DModule() {
  const { items, loading, error, reload } = useCollection('chemistry-3d.json');
  const [activeTab, setActiveTab] = useState<'molecules' | 'mechanisms' | 'exceptions'>('molecules');
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);

  // Molecule viewer states
  const [selectedCid, setSelectedCid] = useState<number>(962);
  const [viewerStyle, setViewerStyle] = useState<ViewerStyle>('ball-and-stick');
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Mechanism states
  const [selectedMechId, setSelectedMechId] = useState<string>('chem3d-mech-001');
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Exceptions states
  const [searchQuery, setSearchQuery] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // Check WebGL and load 3Dmol
  useEffect(() => {
    const webglOk = checkWebGLSupport();
    setHasWebGL(webglOk);
    if (webglOk) {
      load3DmolScript()
        .then(() => setScriptLoaded(true))
        .catch(() => setScriptLoaded(false));
    }
  }, []);

  // Filter items by metadata.itemType
  const molecules = items.filter((i) => (i.metadata as any)?.itemType === 'molecule');
  const mechanisms = items.filter((i) => (i.metadata as any)?.itemType === 'mechanism');
  const exceptions = items.filter((i) => (i.metadata as any)?.itemType === 'exception');

  const selectedMolecule = molecules.find(
    (m) => (m.metadata as any)?.cid === selectedCid
  ) || molecules[0];

  const selectedMechanism = mechanisms.find(
    (m) => m.id === selectedMechId
  ) || mechanisms[0];

  // Render 3Dmol viewer
  const renderViewer = useCallback(async () => {
    if (!containerRef.current || !hasWebGL || !scriptLoaded || !(window as any).$3Dmol) return;

    try {
      if (!viewerRef.current) {
        containerRef.current.innerHTML = '';
        viewerRef.current = (window as any).$3Dmol.createViewer(containerRef.current, {
          backgroundColor: '0x0f172a',
        });
      }

      const viewer = viewerRef.current;
      viewer.clear();

      // Download SDF from PubChem
      const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedCid}/SDF`;
      const resp = await fetch(sdfUrl);
      if (!resp.ok) throw new Error('Failed to fetch SDF');
      const sdfData = await resp.text();

      viewer.addModel(sdfData, 'sdf');

      // Apply style
      if (viewerStyle === 'stick') {
        viewer.setStyle({}, { stick: { radius: 0.16 } });
      } else if (viewerStyle === 'ball-and-stick') {
        viewer.setStyle({}, { stick: { radius: 0.14 }, sphere: { scale: 0.25 } });
      } else if (viewerStyle === 'spacefill') {
        viewer.setStyle({}, { sphere: { scale: 0.9 } });
      }

      // Apply labels
      if (showLabels) {
        viewer.addPropertyLabels('elem', {}, { fontSize: 11, fontColor: 'white', backgroundColor: 'black' });
      }

      viewer.zoomTo();
      viewer.render();

      if (autoRotate) {
        viewer.spin('y', 0.5);
      } else {
        viewer.spin(false);
      }
    } catch {
      // Graceful fallback to 2D image is handled by state
    }
  }, [selectedCid, viewerStyle, showLabels, autoRotate, hasWebGL, scriptLoaded]);

  useEffect(() => {
    if (activeTab === 'molecules' && hasWebGL && scriptLoaded) {
      void renderViewer();
    }
  }, [activeTab, selectedCid, viewerStyle, showLabels, autoRotate, hasWebGL, scriptLoaded, renderViewer]);

  // Keyboard navigation for mechanisms
  useEffect(() => {
    if (activeTab !== 'mechanisms' || !selectedMechanism) return;
    const steps = (selectedMechanism.metadata as any)?.steps || [];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ']' || e.key === 'n') {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === '[' || e.key === 'p') {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedMechanism]);

  if (loading) {
    return <StateShell status="loading" />;
  }

  if (error) {
    return (
      <StateShell
        status="error"
        error={error}
        onRetry={reload}
      />
    );
  }

  if (items.length === 0) {
    return <StateShell status="empty" emptyTitle="No molecular data found." />;
  }

  const filteredExceptions = exceptions.filter((exc) => {
    const meta = exc.metadata as any;
    const q = searchQuery.toLowerCase();
    return (
      meta?.title?.toLowerCase().includes(q) ||
      meta?.rule?.toLowerCase().includes(q) ||
      meta?.exceptionReason?.toLowerCase().includes(q) ||
      exc.concepts.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Module Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Interactive 3D Practical Science Cluster
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              WebGL 3D Viewer · Stepped Mechanisms · Reaction Exceptions
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('molecules')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'molecules'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            15 3D Molecules
          </button>
          <button
            onClick={() => {
              setActiveTab('mechanisms');
              setCurrentStep(0);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'mechanisms'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            4 Organic Mechanisms
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'exceptions'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            20 Exceptions Library
          </button>
        </div>
      </div>

      {/* ── TAB 1: 3D MOLECULE VIEWER ── */}
      {activeTab === 'molecules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Molecule Selection List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-1">
              Select Molecule (PubChem CID)
            </h3>
            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {molecules.map((m) => {
                const meta = m.metadata as any;
                const isSelected = meta?.cid === selectedCid;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedCid(meta?.cid)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-text)] font-semibold shadow-sm'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text)]">
                          {meta?.name}
                        </span>
                        <Badge label={`CID ${meta?.cid}`} variant="default" />
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">
                        {meta?.formula} · {meta?.category}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Viewer & Details Panel (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Style:
                </span>
                {(['stick', 'ball-and-stick', 'spacefill'] as ViewerStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setViewerStyle(st)}
                    className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors ${
                      viewerStyle === st
                        ? 'bg-[var(--color-accent)] text-white font-medium'
                        : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span>Atom Labels</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-0"
                  />
                  <span>Auto-Spin</span>
                </label>
              </div>
            </div>

            {/* 3Dmol / WebGL Canvas / Fallback Container */}
            <div className="relative w-full h-[380px] rounded-2xl border border-[var(--color-border)] bg-slate-900 overflow-hidden flex items-center justify-center">
              {hasWebGL && scriptLoaded ? (
                <div
                  ref={containerRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />
              ) : (
                /* Fallback mode when WebGL is unavailable or script fails */
                <div className="p-6 text-center space-y-4 max-w-md">
                  <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      WebGL Unavailable — 2D High-Res Fallback Render
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Displaying PubChem 2D structure image and chemical properties instead of 3D canvas.
                    </p>
                  </div>
                  {selectedMolecule && (
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                      <img
                        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${(selectedMolecule.metadata as any)?.cid}/PNG`}
                        alt={(selectedMolecule.metadata as any)?.name}
                        className="w-36 h-36 mx-auto object-contain bg-white p-2 rounded-lg"
                      />
                      <p className="text-xs font-semibold text-slate-200 mt-2">
                        {(selectedMolecule.metadata as any)?.name} ({(selectedMolecule.metadata as any)?.formula})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Molecule Metadata Card */}
            {selectedMolecule && (
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text)]">
                      {(selectedMolecule.metadata as any)?.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] italic font-mono">
                      IUPAC: {(selectedMolecule.metadata as any)?.iupacName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge label={`MW: ${(selectedMolecule.metadata as any)?.molWeight} g/mol`} variant="tier" />
                    <Badge label={(selectedMolecule.metadata as any)?.category} variant="default" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block text-[11px]">Formula</span>
                    <span className="font-semibold text-[var(--color-text)] font-mono">
                      {(selectedMolecule.metadata as any)?.formula}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block text-[11px]">Geometry</span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {(selectedMolecule.metadata as any)?.geometry}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block text-[11px]">Bond Angle</span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {(selectedMolecule.metadata as any)?.bondAngle}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {(selectedMolecule.metadata as any)?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: STEPPED ORGANIC MECHANISMS ── */}
      {activeTab === 'mechanisms' && (
        <div className="space-y-6">
          {/* Mechanism Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {mechanisms.map((mech) => {
              const isSelected = mech.id === selectedMechId;
              const meta = mech.metadata as any;
              return (
                <button
                  key={mech.id}
                  onClick={() => {
                    setSelectedMechId(mech.id);
                    setCurrentStep(0);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] shadow-sm'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      {meta?.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                    {mech.body}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Stepper Container */}
          {selectedMechanism && (
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
              {/* Header & Step Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text)]">
                    {(selectedMechanism.metadata as any)?.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                    {selectedMechanism.body}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={`Step ${currentStep + 1} of ${
                      ((selectedMechanism.metadata as any)?.steps || []).length
                    }`}
                    variant="tier"
                  />
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    (Use ← / → keys to navigate)
                  </span>
                </div>
              </div>

              {/* Active Step Box */}
              {(() => {
                const steps = (selectedMechanism.metadata as any)?.steps || [];
                const step = steps[currentStep];
                if (!step) return null;
                return (
                  <div className="space-y-6">
                    {/* Step Visual Diagram & Electron Movement */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Diagram representation (6 cols) */}
                      <div className="md:col-span-6 p-6 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono space-y-3">
                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block">
                          Electron Movement & Transition Diagram
                        </span>
                        <div className="py-4 text-lg font-bold text-emerald-400 bg-slate-900/80 rounded-lg border border-slate-800 px-4 inline-block shadow-inner">
                          {step.annotationDiagram}
                        </div>
                        <p className="text-xs text-slate-400 italic">
                          Curly arrow annotation indicating nucleophilic / electrophilic electron pair shift
                        </p>
                      </div>

                      {/* Step Text Breakdown (6 cols) */}
                      <div className="md:col-span-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                          Step {step.stepNumber}: {step.title}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                            Electron Movement Annotation
                          </h4>
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {step.electronMovement}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                            One-Line Explanation
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                            {step.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step Slider & Navigation Controls */}
                    <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
                      {/* Slider Input */}
                      <input
                        type="range"
                        min={0}
                        max={steps.length - 1}
                        value={currentStep}
                        onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
                        className="w-full accent-[var(--color-accent)] cursor-pointer h-2 bg-[var(--color-surface-subtle)] rounded-lg"
                      />

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                          disabled={currentStep === 0}
                          className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous Step
                        </button>
                        <div className="flex items-center gap-1.5">
                          {steps.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentStep(idx)}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                currentStep === idx
                                  ? 'bg-[var(--color-accent)] w-6'
                                  : 'bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
                          disabled={currentStep === steps.length - 1}
                          className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                        >
                          Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: EXCEPTIONS LIBRARY ── */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Filter 20 reaction exceptions (e.g., Markovnikov, carbocation shift, peroxide)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Exceptions Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExceptions.map((exc) => {
              const meta = exc.metadata as any;
              return (
                <div
                  key={exc.id}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 hover:border-[var(--color-accent)] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--color-text)] leading-snug">
                        {meta?.title}
                      </h4>
                      <Badge label={exc.chapter || 'Chemistry'} variant="default" />
                    </div>

                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium">
                      <span className="font-bold">Standard Expectation:</span> {meta?.rule}
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      <span className="font-semibold text-[var(--color-text)]">Why Exception Occurs:</span>{' '}
                      {meta?.exceptionReason}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] space-y-1">
                      <span className="font-bold text-[var(--color-accent)] block text-[11px] uppercase tracking-wider">
                        Key Exam Takeaway
                      </span>
                      <p className="text-[11px] leading-snug">{meta?.keyTakeaway}</p>
                    </div>
                  </div>

                  {meta?.linkedMoleculeCid && (
                    <button
                      onClick={() => {
                        setSelectedCid(meta.linkedMoleculeCid);
                        setActiveTab('molecules');
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-accent)] hover:underline pt-2 border-t border-[var(--color-border)]"
                    >
                      <ExternalLink className="w-3 h-3" /> View 3D Molecule (CID {meta.linkedMoleculeCid})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visible Attribution Footer (Mandatory per AGENTS.md & User prompt) */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            3D Molecular Visualization powered by <strong>3Dmol.js</strong> (BSD 3-Clause License) & PubChem REST API.
          </span>
        </div>
        <a
          href="https://3dmol.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline font-medium"
        >
          3Dmol.org License Details
        </a>
      </div>
    </div>
  );
}
