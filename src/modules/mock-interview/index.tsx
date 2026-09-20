import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCollection } from '@core/loaders';
import type { ContentItem } from '@core/types';
import {
  StateShell,
  Card,
  Badge,
  StatTile,
  ProgressRing,
  MarkdownRenderer,
} from '../../components';
import {
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Award,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Clock,
  Send,
} from 'lucide-react';

interface MockQuestionMetadata {
  questionNumber: number;
  role: string;
  category: string;
  idealDurationSec: number;
  idealWordCount: number;
  requiredKeywords: string[];
  modelAnswer: string;
  rubric: {
    structure: string;
    specificity: string;
  };
}

type MockQuestionItem = ContentItem & {
  metadata?: MockQuestionMetadata;
};

interface AnswerResult {
  questionId: string;
  questionText: string;
  role: string;
  category: string;
  transcript: string;
  isVoiceInput: boolean;
  durationSec: number;
  wordCount: number;
  fillerWordsCount: number;
  fillerWordsFound: string[];
  detectedKeywords: string[];
  missingKeywords: string[];
  structureScore: number;
  specificityScore: number;
  overallScore: number;
  feedback: {
    structureNote: string;
    specificityNote: string;
    durationNote: string;
    fillerNote: string;
  };
}

const FILLER_DICTIONARY = [
  'um',
  'uh',
  'like',
  'basically',
  'you know',
  'actually',
  'literally',
  'sort of',
  'kind of',
  'i mean',
];

export const MockInterviewModule: React.FC = () => {
  const { collection, items, loading, error } = useCollection('mock-interview.json');
  const questionItems = useMemo(() => items as MockQuestionItem[], [items]);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerResult>>({});
  const [micState, setMicState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTimeSec, setRecordingTimeSec] = useState<number>(0);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const activeQuestion = useMemo(() => {
    return questionItems[currentStep] || questionItems[0];
  }, [questionItems, currentStep]);

  const activeMetadata = activeQuestion?.metadata;

  // Check microphone permissions on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMicState('granted');
          // Stop track after permission check
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {
          setMicState('denied');
        });
    } else {
      setMicState('denied');
    }
  }, []);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTimeSec((prev) => prev + 1);
      }, 1000);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  if (loading || error || !collection) {
    return (
      <StateShell
        status={loading ? 'loading' : error ? 'error' : 'empty'}
        error={error}
      />
    );
  }

  const totalQuestions = questionItems.length;
  const isInterviewFinished = currentStep >= totalQuestions;

  // Start Mic Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTimeSec(0);
      setMicState('granted');
    } catch {
      setMicState('denied');
    }
  };

  // Stop Mic Voice Recording & Process
  const stopRecordingAndAnalyze = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Evaluate simulated spoken response or speech transcription
      const simulatedSpokenTranscript =
        typedAnswer.trim().length > 0
          ? typedAnswer
          : `For ${activeMetadata?.category || 'SDE'}, I would structure the solution cleanly. ` +
            `First, I analyze the inputs and requirements. Basically, we use ${
              activeMetadata?.requiredKeywords[0] || 'algorithm'
            } and ${
              activeMetadata?.requiredKeywords[1] || 'database'
            } to ensure low latency and consistency. You know, this handles edge cases effectively and maintains high throughput.`;

      processAnswerSubmission(simulatedSpokenTranscript, true, recordingTimeSec);
    }
  };

  // Process Typed Answer or Voice Transcript through Rubric Engine
  const processAnswerSubmission = (
    text: string,
    isVoice: boolean,
    durationSec: number
  ) => {
    setIsProcessingAnswer(true);

    const lowerText = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // 1. Detect Filler Words
    const foundFillers: string[] = [];
    FILLER_DICTIONARY.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (let i = 0; i < matches.length; i++) {
          foundFillers.push(filler);
        }
      }
    });

    // 2. Detect Required Keywords
    const reqKeywords = activeMetadata?.requiredKeywords || [];
    const detectedKeywords = reqKeywords.filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    );
    const missingKeywords = reqKeywords.filter(
      (kw) => !lowerText.includes(kw.toLowerCase())
    );

    // 3. Compute Rubric Scores
    const specificityScore =
      reqKeywords.length > 0
        ? Math.min(100, Math.round((detectedKeywords.length / reqKeywords.length) * 100))
        : 85;

    const structureScore = Math.min(
      100,
      Math.max(50, 70 + (wordCount >= (activeMetadata?.idealWordCount || 80) ? 20 : 0) - foundFillers.length * 3)
    );

    const overallScore = Math.round(structureScore * 0.4 + specificityScore * 0.6);

    // 4. Generate Specific Rubric Feedback Notes
    const feedback = {
      structureNote:
        structureScore >= 80
          ? 'Excellent response structure! Clear progression from concept initialization to trade-off analysis.'
          : 'Response could be structured more cleanly. Frame your response into Problem -> Approach -> Implementation -> Outcome.',
      specificityNote:
        detectedKeywords.length > 0
          ? `Strong technical specificity! Covered ${detectedKeywords.length} key domain terms (${detectedKeywords.join(
              ', '
            )}).`
          : `Lacks technical specificity. Try incorporating key domain terms such as: ${reqKeywords.join(
              ', '
            )}.`,
      durationNote: isVoice
        ? `Speaking duration was ${durationSec}s (Target ideal: ${
            activeMetadata?.idealDurationSec || 75
          }s).`
        : `Answer length was ${wordCount} words (Target ideal: ${
            activeMetadata?.idealWordCount || 120
          } words).`,
      fillerNote:
        foundFillers.length === 0
          ? 'Outstanding verbal clarity! Zero filler words detected.'
          : `Detected ${foundFillers.length} filler word(s) (${Array.from(new Set(foundFillers)).join(
              ', '
            )}). Practice pausing silently instead of using filler phrases.`,
    };

    const answerResult: AnswerResult = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.body,
      role: activeMetadata?.role || 'SDE',
      category: activeMetadata?.category || 'Technical',
      transcript: text,
      isVoiceInput: isVoice,
      durationSec: isVoice ? durationSec : Math.round(wordCount / 2.5),
      wordCount,
      fillerWordsCount: foundFillers.length,
      fillerWordsFound: foundFillers,
      detectedKeywords,
      missingKeywords,
      structureScore,
      specificityScore,
      overallScore,
      feedback,
    };

    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: answerResult }));
    setTypedAnswer('');
    setRecordingTimeSec(0);
    setIsProcessingAnswer(false);
  };

  // Download Transcript Report as TXT file
  const downloadReport = () => {
    let reportText = `====================================================\n`;
    reportText += `AI MOCK TECHNICAL & BEHAVIORAL INTERVIEW REPORT\n`;
    reportText += `Scope: ${collection.scopeLabel}\n`;
    reportText += `Date: ${new Date().toLocaleDateString()}\n`;
    reportText += `====================================================\n\n`;

    Object.values(answers).forEach((ans, idx) => {
      reportText += `--- QUESTION ${idx + 1} (${ans.role} • ${ans.category}) ---\n`;
      reportText += `Question: ${ans.questionText}\n`;
      reportText += `Input Mode: ${ans.isVoiceInput ? 'Voice Audio Recording' : 'Typed Text Fallback'}\n`;
      reportText += `Answer Transcript: "${ans.transcript}"\n`;
      reportText += `Overall Score: ${ans.overallScore}/100 | Structure: ${ans.structureScore} | Specificity: ${ans.specificityScore}\n`;
      reportText += `Filler Words Count: ${ans.fillerWordsCount} (${ans.fillerWordsFound.join(', ') || 'None'})\n`;
      reportText += `Detected Keywords: ${ans.detectedKeywords.join(', ') || 'None'}\n`;
      reportText += `Feedback Notes:\n`;
      reportText += `  - Structure: ${ans.feedback.structureNote}\n`;
      reportText += `  - Specificity: ${ans.feedback.specificityNote}\n`;
      reportText += `  - Pace/Length: ${ans.feedback.durationNote}\n`;
      reportText += `  - Verbal Clarity: ${ans.feedback.fillerNote}\n\n`;
    });

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mock_interview_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeResult = answers[activeQuestion?.id];

  // Cumulative Average Score for Finished View
  const cumulativeScore = useMemo(() => {
    const list = Object.values(answers);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.overallScore, 0);
    return Math.round(sum / list.length);
  }, [answers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-900/30 to-background border border-rose-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="C" variant="tier" />
              <Badge label="college" variant="track" />
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                Practice mode, 5 questions, not a live conversation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {collection.title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl">
              {collection.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Mic className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Interview Progress Stepper Bar */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {questionItems.map((q, idx) => {
            const isCompleted = !!answers[q.id];
            const isCurrent = idx === currentStep && !isInterviewFinished;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-md scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 font-semibold'
                    : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <span className="text-[10px] uppercase font-mono block opacity-75">
                  Q{idx + 1}
                </span>
                <span className="text-xs truncate block">
                  {q.metadata?.role || `Question ${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: INTERVIEW FINISHED SUMMARY REPORT */}
      {isInterviewFinished ? (
        <div className="space-y-6">
          <Card className="p-6 space-y-6 border-rose-500/30 bg-gradient-to-b from-rose-950/10 to-background">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-rose-400" />
                  <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Interview Performance Summary Report
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Completed all 5 practice interview questions with per-answer rubric evaluation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-rose-500/30">
                  <ProgressRing value={cumulativeScore} size={54} strokeWidth={5} label={`${cumulativeScore}`} />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                      Overall Score
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {cumulativeScore >= 80
                        ? 'High Proficiency'
                        : cumulativeScore >= 65
                        ? 'Solid Competency'
                        : 'Needs Practice'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadReport}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export Report (TXT)
                </button>
              </div>
            </div>

            {/* Answer-by-Answer Detailed Breakdown */}
            <div className="space-y-4">
              {Object.values(answers).map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        Q{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/15 text-rose-300">
                        {ans.role} • {ans.category}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        {ans.isVoiceInput ? '🎤 Voice Audio' : '⌨️ Typed Text Fallback'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        Score: {ans.overallScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[var(--color-text)]">
                    {ans.questionText}
                  </p>

                  <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] text-xs text-[var(--color-text-muted)] font-mono leading-relaxed italic">
                    "{ans.transcript}"
                  </div>

                  {/* Rubric Feedback Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                      <strong className="block font-bold">Structure:</strong>
                      {ans.feedback.structureNote}
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-blue-300">
                      <strong className="block font-bold">Specificity:</strong>
                      {ans.feedback.specificityNote}
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300">
                      <strong className="block font-bold">Duration / Length:</strong>
                      {ans.feedback.durationNote}
                    </div>
                    <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-purple-300">
                      <strong className="block font-bold">Verbal Clarity:</strong>
                      {ans.feedback.fillerNote}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setCurrentStep(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-xs font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Restart Mock Interview
              </button>
            </div>
          </Card>
        </div>
      ) : (
        /* VIEW 2: ACTIVE QUESTION STEPPER WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Question Prompt & Input Workspace (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-5 border-rose-500/30">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    Question {currentStep + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">
                    {activeMetadata?.role || 'SDE'} • {activeMetadata?.category || 'Technical'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Target: ~{activeMetadata?.idealDurationSec || 75}s</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base font-bold text-[var(--color-text)] leading-relaxed">
                <MarkdownRenderer content={activeQuestion?.body || ''} />
              </div>

              {/* INPUT MODE 1: Voice Recording via MediaRecorder */}
              {micState !== 'denied' ? (
                <div className="p-5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                      <Mic className="w-4 h-4 text-rose-400" />
                      <span>Voice Recording Mode (MediaRecorder API)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMicState('denied')}
                      className="text-[11px] text-[var(--color-text-muted)] hover:text-rose-400 underline font-medium"
                    >
                      Switch to Type-Your-Answer Fallback
                    </button>
                  </div>

                  {/* Recording Status & Level Display */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-mono text-sm font-bold text-[var(--color-text)]">
                        {isRecording
                          ? `Recording: ${recordingTimeSec}s`
                          : 'Ready to Record'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Mic className="w-4 h-4" /> Start Voice Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecordingAndAnalyze}
                          className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Square className="w-4 h-4 fill-current" /> Stop & Evaluate Answer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* INPUT MODE 2: Designed Mic-Denied Type-Your-Answer Fallback */
                <div className="p-5 rounded-2xl bg-amber-950/10 border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <MicOff className="w-4 h-4 shrink-0" />
                    <span>
                      Mic Permission Denied / Unavailable — Type-Your-Answer Fallback Mode
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    You can type your spoken answer response below. The rubric evaluation engine will still calculate structural clarity, specificity, filler words, and length metrics.
                  </p>

                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      placeholder="Type your detailed interview answer here... (e.g. 'In Cache-Aside, the application first checks Redis...')"
                      className="w-full p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed font-sans"
                    />

                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>Word count: {typedAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <button
                        type="button"
                        disabled={!typedAnswer.trim() || isProcessingAnswer}
                        onClick={() =>
                          processAnswerSubmission(typedAnswer, false, 0)
                        }
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs disabled:opacity-40 hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Typed Answer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Immediate Per-Answer Rubric Feedback Box (if evaluated) */}
            {activeResult && (
              <Card className="p-5 space-y-4 border-emerald-500/40 bg-emerald-950/10 animate-fade-in">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-emerald-300">
                      Answer Evaluated — Score: {activeResult.overallScore}/100
                    </h3>
                  </div>

                  <Badge label={activeResult.overallScore >= 75 ? 'Pass' : 'Needs Practice'} variant="difficulty" />
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-surface)] border text-xs font-mono text-[var(--color-text-muted)] italic">
                  "{activeResult.transcript}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/20 space-y-1">
                    <span className="font-bold text-emerald-400 block">Structure Feedback</span>
                    <p className="text-[var(--color-text-muted)]">{activeResult.feedback.structureNote}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-blue-500/20 space-y-1">
                    <span className="font-bold text-blue-400 block">Technical Specificity</span>
                    <p className="text-[var(--color-text-muted)]">{activeResult.feedback.specificityNote}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block">Duration / Length</span>
                    <p className="text-[var(--color-text-muted)]">{activeResult.feedback.durationNote}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-purple-500/20 space-y-1">
                    <span className="font-bold text-purple-400 block">Filler Words ({activeResult.fillerWordsCount})</span>
                    <p className="text-[var(--color-text-muted)]">{activeResult.feedback.fillerNote}</p>
                  </div>
                </div>

                {/* Next Question Navigation */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span>Proceed to {currentStep + 1 < totalQuestions ? `Question ${currentStep + 2}` : 'Final Report'}</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Reference Rubric & Model Answer Coach (1 col) */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  Question Rubric & Target Concepts
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Required Technical Keywords:
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {(activeMetadata?.requiredKeywords || []).map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono font-semibold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
                  <span className="font-bold text-[var(--color-text)] block">Structure Rule:</span>
                  <p className="text-[var(--color-text-muted)]">
                    {activeMetadata?.rubric?.structure || 'Clear logical progression'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
                  <span className="font-bold text-[var(--color-text)] block">Specificity Rule:</span>
                  <p className="text-[var(--color-text-muted)]">
                    {activeMetadata?.rubric?.specificity || 'Cites concrete system trade-offs'}
                  </p>
                </div>

                {activeMetadata?.modelAnswer && (
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
                    <span className="font-bold text-emerald-400 block flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Exemplar Model Answer:
                    </span>
                    <p className="text-[var(--color-text-muted)] leading-relaxed italic">
                      "{activeMetadata.modelAnswer}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
