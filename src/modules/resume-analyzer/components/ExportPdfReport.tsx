// src/modules/resume-analyzer/components/ExportPdfReport.tsx
// Export ATS Resume Analysis report as printable PDF or download file.

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { ResumeAnalysisResult } from '../utils/resumeParser';

interface ExportPdfReportProps {
  analysis: ResumeAnalysisResult;
}

export const ExportPdfReport: React.FC<ExportPdfReportProps> = ({ analysis }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportText = `=====================================================
ATS RESUME ANALYSIS REPORT
Overall ATS Score: ${analysis.atsScore}/100
=====================================================

PER-FACTOR BREAKDOWN:
- Parseability: ${analysis.factors.parseability}/100
- Keywords: ${analysis.factors.keywords}/100
- Structure: ${analysis.factors.structure}/100
- Quantification: ${analysis.factors.quantification}/100
- Length & Formatting: ${analysis.factors.length}/100

SECTION-BY-SECTION QUOTED FINDINGS:
${analysis.findings
  .map(
    (f, i) =>
      `\n[Finding #${i + 1} - ${f.severity.toUpperCase()}]
Location Quote: "${f.location}"
Issue: ${f.issue}
Fix Suggestion: ${f.suggestion}`
  )
  .join('\n')}

HIGH-IMPACT BULLET REWRITES:
${analysis.rewrites
  .map(
    (r, i) =>
      `\n[Rewrite #${i + 1}]
Before: "${r.original}"
After: "${r.improved}"
Why: ${r.why}`
  )
  .join('\n')}

${
  analysis.jdMatch
    ? `\nJOB DESCRIPTION GAP ANALYSIS:
Missing Skills: ${analysis.jdMatch.missingSkills.map((s) => s.skill).join(', ')}
Suggested Projects:
${analysis.jdMatch.suggestedProjects.map((p) => `- ${p.title}: ${p.description}`).join('\n')}`
    : ''
}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Resume_Analysis_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)] print:hidden">
      <button
        type="button"
        onClick={handleDownloadReport}
        className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors flex items-center gap-1.5 shadow-xs"
      >
        <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Download Report (.txt)
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
      >
        <Printer className="w-3.5 h-3.5" /> Export Report (PDF Print)
      </button>
    </div>
  );
};
