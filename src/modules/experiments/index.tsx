import React, { useState, useEffect } from 'react';
import { useCollection } from '@core/loaders';
import { StateShell } from '@components/StateShell';
import { Badge } from '@components/Badge';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  Save,
  BookOpen,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY = 'ai_edu_exp_observations_v1';

export function ExperimentsModule() {
  const { items, loading, error, reload } = useCollection('experiments.json');
  const [selectedExpId, setSelectedExpId] = useState<string>('exp-10-001');

  // Observation table state stored in localStorage per expId
  const [userTables, setUserTables] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const selectedExp = items.find((i) => i.id === selectedExpId) || items[0];

  // Sync userTables to localStorage
  const saveTableData = (expId: string, rows: any[]) => {
    const updated = { ...userTables, [expId]: rows };
    setUserTables(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save observation table to localStorage:', err);
    }
  };

  // Get current rows for selected experiment (fallback to defaultRows)
  const meta = selectedExp?.metadata as any;
  const columns: string[] = meta?.tableColumns || [];
  const defaultRows: any[] = meta?.defaultRows || [];
  const currentRows: any[] = userTables[selectedExpId] || defaultRows;

  const handleCellChange = (rowIndex: number, colKey: string, value: string) => {
    const updatedRows = currentRows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return { ...row, [colKey]: value };
      }
      return row;
    });
    saveTableData(selectedExpId, updatedRows);
  };

  const handleResetTable = () => {
    saveTableData(selectedExpId, defaultRows);
  };

  const handleAddRow = () => {
    const emptyRow: Record<string, string> = {};
    columns.forEach((col) => {
      const key = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      emptyRow[key] = '';
    });
    saveTableData(selectedExpId, [...currentRows, emptyRow]);
  };

  if (loading) {
    return <StateShell status="loading" />;
  }

  if (error) {
    return <StateShell status="error" error={error} onRetry={reload} />;
  }

  if (items.length === 0) {
    return <StateShell status="empty" emptyTitle="No experiment data found." />;
  }

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">
              CBSE Class 10 Practical Science Lab
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Interactive PhET Simulations · LocalStorage Persisted Observation Tables
            </p>
          </div>
        </div>

        <Badge label="8 Practical Experiments" variant="tier" />
      </div>

      {/* Experiment Selector List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {items.map((exp) => {
          const expMeta = exp.metadata as any;
          const isSelected = exp.id === selectedExpId;
          return (
            <button
              key={exp.id}
              onClick={() => setSelectedExpId(exp.id)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] font-semibold text-[var(--color-text)] shadow-sm'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="text-[11px] block font-bold text-[var(--color-accent)]">
                Exp {expMeta?.expNumber}
              </span>
              <span className="text-xs font-medium text-[var(--color-text)] line-clamp-1">
                {exp.subject}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Experiment Workspace */}
      {selectedExp && (
        <div className="space-y-6">
          {/* Main Title & Aim Box */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <Badge label={`Experiment ${meta?.expNumber}`} variant="tier" />
                <Badge label={selectedExp.subject || 'Science'} variant="default" />
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  {selectedExp.body}
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--color-text)] space-y-1">
              <span className="font-bold text-emerald-500 uppercase tracking-wider block text-[11px]">
                Experiment Aim
              </span>
              <p className="leading-relaxed font-medium">{meta?.aim}</p>
            </div>

            {/* Materials Required */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Materials & Apparatus Required
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(meta?.materials || []).map((mat: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text)]"
                  >
                    • {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Embedded PhET Simulation (Responsive & 360px safe) */}
          {meta?.phetUrl && (
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-text)]">
                    Interactive PhET Laboratory Simulation
                  </h4>
                </div>
                <a
                  href={meta.phetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Open full screen <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Responsive container capped at max-w-full, works at 360px */}
              <div className="w-full max-w-full h-[360px] sm:h-[480px] rounded-xl border border-[var(--color-border)] bg-slate-950 overflow-hidden relative shadow-inner">
                <iframe
                  src={meta.phetUrl}
                  title={`PhET Simulation - ${selectedExp.body}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Procedure Steps */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Procedure & Experimental Steps
            </h4>
            <ol className="space-y-2 text-xs text-[var(--color-text-muted)] list-decimal list-inside pl-1">
              {(meta?.procedure || []).map((step: string, idx: number) => (
                <li key={idx} className="leading-relaxed text-[var(--color-text)]">
                  <span className="font-normal text-[var(--color-text-muted)] pl-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Student Editable Observation Table (Persists to localStorage) */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-[var(--color-text)]">
                  Student Interactive Observation Table
                </h4>
                <Badge label="Auto-Saved to LocalStorage" variant="tier" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddRow}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
                >
                  + Add Row
                </button>
                <button
                  onClick={handleResetTable}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[var(--color-border)] bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Defaults
                </button>
              </div>
            </div>

            {/* Editable Table Component */}
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="p-3 font-semibold text-[var(--color-text)] whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {currentRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[var(--color-surface-hover)]">
                      {columns.map((col, cIdx) => {
                        const keys = Object.keys(row);
                        const key = keys[cIdx] || col.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const cellVal = row[key] !== undefined ? row[key] : (Object.values(row)[cIdx] || '');
                        return (
                          <td key={cIdx} className="p-2">
                            <input
                              type="text"
                              value={cellVal}
                              onChange={(e) => handleCellChange(rIdx, key, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
              <Save className="w-3 h-3 text-emerald-500 shrink-0" />
              All observation entries are saved automatically in your browser's local storage and survive page refreshes.
            </p>
          </div>

          {/* Result & Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Result Box */}
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Experimental Result & Conclusion
              </h4>
              <p className="text-xs text-[var(--color-text)] leading-relaxed font-medium">
                {meta?.result}
              </p>
            </div>

            {/* Precautions Box */}
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Safety Precautions
              </h4>
              <ul className="space-y-1 text-xs text-[var(--color-text-muted)] list-disc list-inside">
                {(meta?.precautions || []).map((prec: string, idx: number) => (
                  <li key={idx} className="leading-snug">
                    {prec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Visible Attribution Footer (Mandatory per AGENTS.md & User prompt) */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            Simulations provided by <strong>PhET Interactive Simulations</strong>, University of Colorado Boulder, under Creative Commons Attribution (CC-BY 4.0).
          </span>
        </div>
        <a
          href="https://phet.colorado.edu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline font-medium"
        >
          phet.colorado.edu
        </a>
      </div>
    </div>
  );
}
