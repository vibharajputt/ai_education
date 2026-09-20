// src/components/UploadArtifactSection.tsx
// Shared Upload + Parse + Result-View Workspace component for artifact-driven modules.

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Clipboard, AlertTriangle, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Card } from './Card';

export interface UploadArtifactError {
  code: string;
  message: string;
  isScannedPdf?: boolean;
  isEmptyResume?: boolean;
}

export interface UploadArtifactSectionProps {
  title: string;
  subtitle: string;
  acceptTypes?: string;
  maxSizeBytes?: number;
  secondaryInput?: React.ReactNode;
  onAnalyze: (file: File | null, rawText: string | null) => Promise<void>;
  isAnalyzing: boolean;
  error: UploadArtifactError | null;
  onResetError: () => void;
  hasResult: boolean;
  onResetResult: () => void;
  children?: React.ReactNode;
}

export const UploadArtifactSection: React.FC<UploadArtifactSectionProps> = ({
  title,
  subtitle,
  acceptTypes = '.pdf,.docx,.txt',
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  secondaryInput,
  onAnalyze,
  isAnalyzing,
  error,
  onResetError,
  hasResult,
  onResetResult,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [localFileError, setLocalFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setLocalFileError(null);
    onResetError();

    if (file.size > maxSizeBytes) {
      setLocalFileError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB uploaded). Please choose a smaller file.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [maxSizeBytes]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'upload' && !selectedFile) {
      setLocalFileError('Please select or drop a PDF/DOCX file to upload.');
      return;
    }
    if (activeTab === 'paste' && !pastedText.trim()) {
      setLocalFileError('Please paste your document text in the text area below.');
      return;
    }

    setLocalFileError(null);
    onResetError();

    if (activeTab === 'upload' && selectedFile) {
      await onAnalyze(selectedFile, null);
    } else {
      await onAnalyze(null, pastedText);
    }
  };

  // If analysis is already complete and results exist, render result view with header action
  if (hasResult && children) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">Analysis Ready</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectedFile ? `Source: ${selectedFile.name}` : 'Source: Pasted raw text'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setPastedText('');
              onResetResult();
            }}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Analyze Another Document
          </button>
        </div>

        {children}
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{subtitle}</p>
      </div>

      {/* Input Mode Tabs: Upload vs Paste */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            setLocalFileError(null);
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File (PDF / DOCX)
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('paste');
            setLocalFileError(null);
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'paste'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" /> Paste Raw Text
        </button>
      </div>

      {/* Error Banners */}
      {(localFileError || error) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {error?.isScannedPdf
                ? 'Scanned / Image-Only PDF Detected'
                : error?.isEmptyResume
                ? 'Empty Document Text'
                : 'Upload / Parse Requirement Warning'}
            </span>
          </div>
          <p className="text-[var(--color-text)] leading-relaxed">
            {localFileError || error?.message}
          </p>
          {error?.isScannedPdf && activeTab === 'upload' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('paste');
                  onResetError();
                }}
                className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-bold"
              >
                Switch to 'Paste Raw Text' Mode
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'upload' ? (
          <div>
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 scale-[1.01]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-[var(--color-surface-subtle)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="artifact-file-input"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]">
                    <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>{selectedFile.name}</span>
                    <span className="text-[var(--color-text-muted)] text-[11px]">
                      ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1 hover:text-rose-500 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[var(--color-text)]">
                      Drag & drop your document here, or <span className="text-[var(--color-accent)] underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Supports PDF, DOCX, TXT (Maximum size: 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="artifact-raw-text" className="block text-xs font-bold text-[var(--color-text)]">
              Document Plain Text
            </label>
            <textarea
              id="artifact-raw-text"
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the complete document text here..."
              className="w-full p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Optional Secondary Input (e.g. Job Description or Deadline / Daily Study Hours) */}
        {secondaryInput && <div className="pt-2">{secondaryInput}</div>}

        {/* Submit Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isAnalyzing || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && !pastedText.trim())}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold disabled:opacity-40 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Parsing & Analyzing Artifact...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze Artifact
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  );
};
