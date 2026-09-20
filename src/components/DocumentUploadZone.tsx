import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Type,
  FileUp,
  Loader2,
} from 'lucide-react';

export interface DocumentUploadResult {
  type: 'file' | 'text';
  file?: File;
  text?: string;
  name: string;
  sizeBytes?: number;
}

interface DocumentUploadZoneProps {
  onDocumentReady: (doc: DocumentUploadResult) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  errorMessage?: string | null;
  onClearError?: () => void;
  acceptLabel?: string;
  maxSizeBytes?: number;
  placeholderText?: string;
  className?: string;
}

export function DocumentUploadZone({
  onDocumentReady,
  isLoading = false,
  loadingMessage = 'Processing document...',
  errorMessage = null,
  onClearError,
  acceptLabel = 'PDF or DOCX (up to 5MB)',
  maxSizeBytes = 5 * 1024 * 1024,
  placeholderText = 'Paste raw document content, resume text, or syllabus syllabus units here...',
  className = '',
}: DocumentUploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const error = errorMessage || localError;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file: File) => {
    setLocalError(null);
    onClearError?.();

    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds limit (${(file.size / (1024 * 1024)).toFixed(1)}MB > 5MB max).`);
      return;
    }

    const nameLower = file.name.toLowerCase();
    const isValidExt = nameLower.endsWith('.pdf') || nameLower.endsWith('.docx') || nameLower.endsWith('.txt');
    if (!isValidExt) {
      setLocalError('Unsupported file type. Please provide a valid .pdf, .docx, or .txt document.');
      return;
    }

    setSelectedFile(file);
    onDocumentReady({
      type: 'file',
      file,
      name: file.name,
      sizeBytes: file.size,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim() || pastedText.trim().length < 20) {
      setLocalError('Please paste sufficient text content (minimum 20 characters) for analysis.');
      return;
    }
    setLocalError(null);
    onClearError?.();
    onDocumentReady({
      type: 'text',
      text: pastedText.trim(),
      name: 'Pasted Document Content',
      sizeBytes: new Blob([pastedText]).size,
    });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPastedText('');
    setLocalError(null);
    onClearError?.();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-subtle)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setLocalError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm font-bold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setLocalError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm font-bold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Paste Text Fallback
          </button>
        </div>

        <span className="text-[11px] text-[var(--color-text-muted)] hidden sm:inline">
          {acceptLabel}
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs flex items-start gap-2.5 text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            {error.toLowerCase().includes('scanned') && (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Tip: Scanned PDFs without OCR text cannot be parsed directly. Please use the <strong>Paste Text</strong> tab to paste the text directly.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/60 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
          } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
              <div className="text-xs font-bold text-[var(--color-text)]">{loadingMessage}</div>
              <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
                Extracting textual tokens and conducting in-memory audit...
              </p>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] max-w-md mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--color-text)] truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to Analyze
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2.5 py-4">
              <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-accent)] shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Click to upload or drag & drop document
                </span>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Supports PDF or DOCX (max 5MB in-memory processing)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={7}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder={placeholderText}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/60 font-mono leading-relaxed resize-y"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)]/80 px-2 py-0.5 rounded backdrop-blur-sm border border-[var(--color-border)]">
              {pastedText.length} chars • {pastedText.split('\n').filter(Boolean).length} lines
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={!pastedText || isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-40"
            >
              Clear Text
            </button>
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Text...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Proceed with Pasted Text
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
