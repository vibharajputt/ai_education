import React, { useState } from 'react';
import { useCollection } from '@core/loaders';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  Zap,
  Search,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RotateCcw,
  Info,
} from 'lucide-react';

// Word bank for offline acrostic fallback generation
const WORD_BANK: Record<string, string[]> = {
  A: ['Always', 'Awesome', 'Active', 'Amazing', 'Apple'],
  B: ['Brave', 'Bright', 'Brilliant', 'Bold', 'Big'],
  C: ['Clever', 'Cool', 'Creative', 'Careful', 'Calm'],
  D: ['Dear', 'Deep', 'Daring', 'Dynamic', 'Daily'],
  E: ['Energetic', 'Eager', 'Excellent', 'Easy', 'Early'],
  F: ['Fast', 'Fine', 'Famous', 'Fresh', 'Friendly'],
  G: ['Great', 'Good', 'Grand', 'Gentle', 'Golden'],
  H: ['Happy', 'High', 'Honest', 'Heroic', 'Huge'],
  I: ['Intelligent', 'Inspired', 'Instant', 'Important', 'Idle'],
  J: ['Joyful', 'Just', 'Jubilant', 'Jumping', 'Junior'],
  K: ['Kind', 'Keen', 'Known', 'King', 'Key'],
  L: ['Lively', 'Logical', 'Light', 'Loyal', 'Large'],
  M: ['Mighty', 'Modern', 'Master', 'Major', 'Mindful'],
  N: ['Noble', 'Neat', 'New', 'Natural', 'Nice'],
  O: ['Open', 'Optimal', 'Original', 'Outgoing', 'One'],
  P: ['Perfect', 'Powerful', 'Polite', 'Pure', 'Prime'],
  Q: ['Quick', 'Quiet', 'Quality', 'Queen', 'Quaint'],
  R: ['Rapid', 'Real', 'Radiant', 'Royal', 'Rich'],
  S: ['Smart', 'Strong', 'Swift', 'Silent', 'Super'],
  T: ['True', 'Top', 'Talented', 'Tough', 'Trusty'],
  U: ['Unique', 'Ultimate', 'Urgent', 'Useful', 'Upper'],
  V: ['Vast', 'Vibrant', 'Valiant', 'Vital', 'Vivid'],
  W: ['Wise', 'Warm', 'Wonderful', 'Wild', 'Wide'],
  X: ['Xenial', 'X-ray', 'Xanthic'],
  Y: ['Young', 'Yielding', 'Yellow'],
  Z: ['Zealous', 'Zesty', 'Zigzag'],
};

function generateOfflineAcrostic(itemsList: string[]): { hook: string; expansion: string } {
  const words = itemsList
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (words.length === 0) {
    return {
      hook: 'Please enter at least two words to generate a mnemonic.',
      expansion: '',
    };
  }

  const hookWords: string[] = [];
  words.forEach((w) => {
    const firstChar = w.charAt(0).toUpperCase();
    const bank = WORD_BANK[firstChar] || [firstChar];
    const picked = bank[Math.floor(Math.random() * bank.length)];
    hookWords.push(picked);
  });

  const acronym = words.map((w) => w.charAt(0).toUpperCase()).join('');

  return {
    hook: `${hookWords.join(' ')} (Acronym: ${acronym})`,
    expansion: words.join(' → '),
  };
}

export function MnemonicsModule() {
  const { items, loading, error, reload } = useCollection('mnemonics.json');
  const [activeTab, setActiveTab] = useState<'vault' | 'custom' | 'practice'>('vault');

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom Generator State
  const [customInput, setCustomInput] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<{ hook: string; expansion: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Practice Mode State
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [showExpansion, setShowExpansion] = useState<boolean>(false);
  const [practiceScore, setPracticeScore] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  const [revealedVaultIds, setRevealedVaultIds] = useState<Record<string, boolean>>({});

  const toggleVaultReveal = (id: string) => {
    setRevealedVaultIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = items.filter((item) => {
    const meta = item.metadata as any;
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesType = selectedType === 'All' || meta?.mType === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.body.toLowerCase().includes(q) ||
      meta?.hook?.toLowerCase().includes(q) ||
      meta?.expansion?.toLowerCase().includes(q) ||
      item.concepts.some((c) => c.toLowerCase().includes(q));

    return matchesSubject && matchesType && matchesSearch;
  });

  const currentPracticeItem = filteredItems[practiceIndex] || filteredItems[0];

  const handleCustomGenerate = async () => {
    if (!customInput.trim()) return;
    setIsGenerating(true);

    const termList = customInput.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);

    try {
      // Attempt live server assistant call if available
      const resp = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a memorable first-letter mnemonic hook and expansion for this list: ${termList.join(', ')}. Keep response under 100 words.`,
        }),
      });

      if (resp.ok) {
        const text = await resp.text();
        setGeneratedResult({
          hook: text,
          expansion: termList.join(' → '),
        });
      } else {
        // Fallback to offline generator
        setGeneratedResult(generateOfflineAcrostic(termList));
      }
    } catch {
      // Degrade gracefully to offline generator
      setGeneratedResult(generateOfflineAcrostic(termList));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePracticeScore = (correct: boolean) => {
    setPracticeScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setShowExpansion(false);
    if (practiceIndex < filteredItems.length - 1) {
      setPracticeIndex((prev) => prev + 1);
    } else {
      setPracticeIndex(0);
    }
  };

  if (loading) return <StateShell status="loading" />;
  if (error) return <StateShell status="error" error={error} onRetry={reload} />;
  if (items.length === 0) return <StateShell status="empty" emptyTitle="No mnemonics found." />;

  const subjects = ['All', 'Chemistry', 'Physics', 'Mathematics', 'Biology', 'History'];
  const types = ['All', 'Acronym', 'Acrostic', 'Rhyme', 'Visual Association'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">
              60 Curated Formula & Concept Mnemonics Vault
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Subject Filters · Custom Generator with Fallback · Practice Recall Mode
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Vault ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            "Make Me One"
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'practice'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Practice Mode
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-1">
              Subject:
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setPracticeIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedSubject === sub
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Type:
            </span>
            {types.map((tp) => (
              <button
                key={tp}
                onClick={() => {
                  setSelectedType(tp);
                  setPracticeIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === tp
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search mnemonics (e.g., Reactivity, OIL RIG, SOH CAH TOA, Trig)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* ── TAB 1: 60 CURATED MNEMONICS VAULT ── */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const meta = item.metadata as any;
            const isRevealed = !!revealedVaultIds[item.id];
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 hover:border-[var(--color-accent)] transition-colors flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge label={item.subject || 'STEM'} variant="default" />
                      <Badge label={meta?.mType || 'Mnemonic'} variant="tier" />
                    </div>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      {item.chapter}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[var(--color-text)] leading-snug">
                    {item.body}
                  </h4>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-semibold font-mono">
                    💡 Hook: "{meta?.hook || item.body}"
                  </div>

                  {isRevealed && (
                    <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] space-y-1">
                      <span className="font-bold text-[var(--color-accent)] uppercase tracking-wider block text-[10px]">
                        Concept Expansion
                      </span>
                      <p className="leading-relaxed text-[11px]">
                        {meta?.expansion || item.body}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleVaultReveal(item.id)}
                  className="w-full py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Hide Expansion
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Reveal Expansion
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: "MAKE ME ONE" CUSTOM GENERATOR ── */}
      {activeTab === 'custom' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Custom Mnemonic Generator
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Paste any list of terms (comma or line separated) to generate a custom memory acronym/acrostic.
              </p>
            </div>

            <textarea
              rows={4}
              placeholder="Paste your list of terms here, e.g.:&#10;Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono"
            />

            <button
              onClick={handleCustomGenerate}
              disabled={isGenerating || !customInput.trim()}
              className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>Generating Mnemonic...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Custom Mnemonic
                </>
              )}
            </button>
          </div>

          {/* Generated Result Box */}
          {generatedResult && (
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-accent)] space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                  Generated Mnemonic Memory Hook
                </span>
                <Badge label="Live API / Offline Fallback" variant="tier" />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 font-mono leading-relaxed">
                💡 {generatedResult.hook}
              </div>

              {generatedResult.expansion && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                    Original Term List
                  </span>
                  <p className="text-xs text-[var(--color-text)] font-mono bg-[var(--color-surface-subtle)] p-3 rounded-lg border border-[var(--color-border)]">
                    {generatedResult.expansion}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PRACTICE RECALL MODE ── */}
      {activeTab === 'practice' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium">
            <span>
              Practice Score:{' '}
              <strong className="text-[var(--color-text)]">
                {practiceScore.correct} / {practiceScore.total}
              </strong>
            </span>
            <span className="text-[var(--color-text-muted)]">
              Mnemonic {practiceIndex + 1} of {filteredItems.length}
            </span>
          </div>

          {currentPracticeItem ? (
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <Badge label={currentPracticeItem.subject || 'Science'} variant="default" />
                <Badge label={(currentPracticeItem.metadata as any)?.mType || 'Mnemonic'} variant="tier" />
              </div>

              <div className="space-y-3 text-center">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Recall the Expansion from this Mnemonic Hook
                </span>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-bold text-amber-500 font-mono">
                  💡 "{(currentPracticeItem.metadata as any)?.hook || currentPracticeItem.body}"
                </div>
              </div>

              {!showExpansion ? (
                <button
                  onClick={() => setShowExpansion(true)}
                  className="w-full py-3 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold text-xs border border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Reveal Term Expansion
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <span className="font-bold text-emerald-500 uppercase tracking-wider block text-[11px]">
                      Concept Expansion
                    </span>
                    <p className="text-[var(--color-text)] font-semibold leading-relaxed font-mono">
                      {(currentPracticeItem.metadata as any)?.expansion || currentPracticeItem.body}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handlePracticeScore(false)}
                      className="py-2.5 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Needs Practice
                    </button>
                    <button
                      onClick={() => handlePracticeScore(true)}
                      className="py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Got It Right!
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)]">
                No mnemonics match current filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
