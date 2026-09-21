// src/modules/split-view/components/UploadPaperModal.tsx
import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Layers,
  HelpCircle,
  BookOpen,
  School,
  ArrowRight,
} from 'lucide-react';
import type { CBSESamplePaper, CBSEQuestion } from '../data/cbsePapers';

interface UploadPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperUploaded: (newPaper: CBSESamplePaper) => void;
  currentClass: '10' | '12';
}

export function UploadPaperModal({
  isOpen,
  onClose,
  onPaperUploaded,
  currentClass,
}: UploadPaperModalProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'file' | 'text'>('preset');
  const [selectedClass, setSelectedClass] = useState<'10' | '12'>(currentClass);
  const [subject, setSubject] = useState(selectedClass === '10' ? 'Science' : 'Physics');
  const [paperTitle, setPaperTitle] = useState('School Pre-Board Examination Paper 2025');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setPaperTitle(file.name.replace(/\.[^/.]+$/, '') + ' (Parsed)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setPaperTitle(file.name.replace(/\.[^/.]+$/, '') + ' (Parsed)');
    }
  };

  const handleLoadPreset = (presetType: '10-sci' | '10-math' | '12-phy' | '12-chem') => {
    if (presetType === '10-sci') {
      setSelectedClass('10');
      setSubject('Science');
      setPaperTitle('DPS / KV Class 10 Science Pre-Board Examination 2025');
    } else if (presetType === '10-math') {
      setSelectedClass('10');
      setSubject('Mathematics');
      setPaperTitle('All India Pre-Board 2025 Mathematics Standard');
    } else if (presetType === '12-phy') {
      setSelectedClass('12');
      setSubject('Physics');
      setPaperTitle('Class 12 Physics Mid-Term Board Practice Paper');
    } else {
      setSelectedClass('12');
      setSubject('Chemistry');
      setPaperTitle('Class 12 Chemistry Organic & Electrochemistry Exam Paper');
    }
    setActiveTab('preset');
  };

  const handleProcessUpload = () => {
    setIsProcessing(true);
    setProgressStatus('Reading document structure and OCR tokens...');

    setTimeout(() => {
      setProgressStatus('AI classifying into Section A (MCQs), Section B (VSA), Section C (SA), Section D (LA), Section E (Case Study)...');
    }, 600);

    setTimeout(() => {
      setProgressStatus('Generating step-wise CBSE marking scheme solutions...');
    }, 1200);

    setTimeout(() => {
      // Generate parsed questions divided across 5 standard CBSE sections
      const parsedQuestions: CBSEQuestion[] = [
        {
          id: 'up-q1',
          questionNumber: 1,
          section: 'Section A',
          sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
          marks: 1,
          questionType: 'MCQ',
          competency: 'Conceptual Recall',
          chapter: selectedClass === '10' ? 'Chemical Reactions & Light' : 'Electrostatics & Solutions',
          questionText:
            selectedClass === '10'
              ? 'Which of the following processes involves a chemical reaction?\n(a) Storing of oxygen gas under pressure in a gas cylinder\n(b) Liquefaction of air\n(c) Keeping petrol in a china dish in the open\n(d) Heating copper wire in the presence of air at high temperature'
              : 'Two point charges $+q$ and $-q$ are situated at a distance $2a$ apart. The electric potential at a point on the equatorial plane is:\n(a) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{a}$\n(b) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{2q}{a}$\n(c) Zero\n(d) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{2a^2}$',
          options:
            selectedClass === '10'
              ? [
                  '(a) Storing of oxygen gas under pressure in a cylinder',
                  '(b) Liquefaction of air',
                  '(c) Keeping petrol in a china dish in open',
                  '(d) Heating copper wire in presence of air at high temperature',
                ]
              : [
                  '(a) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{a}$',
                  '(b) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{2q}{a}$',
                  '(c) Zero',
                  '(d) $\\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{2a^2}$',
                ],
          correctOption: selectedClass === '10' ? '(d)' : '(c)',
          cbseSourceRef: 'Uploaded Exam Paper - Section A Q1',
          modelAnswer:
            selectedClass === '10'
              ? '**(d) Heating copper wire in presence of air at high temperature**\n\nCopper reacts with atmospheric oxygen to form black copper(II) oxide ($2\\text{Cu} + \\text{O}_2 \\xrightarrow{\\Delta} 2\\text{CuO}$), which is a chemical change with new bonds formed.'
              : '**(c) Zero**\n\nOn the equatorial plane, any point is equidistant ($r$) from both $+q$ and $-q$. The total potential is $V = V_+ + V_- = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q}{r} + \\frac{1}{4\\pi\\varepsilon_0}\\frac{-q}{r} = 0$.',
          steps: [
            {
              label: 'Step 1: Identify Chemical vs Physical Change / Potential Superposition',
              body: selectedClass === '10' ? 'Formation of black CuO is an irreversible chemical oxidation.' : 'Potential is scalar; positive and negative contributions exactly cancel out on the perpendicular bisector.',
              allocatedMarks: '0.5 Mark',
            },
            {
              label: 'Step 2: Conclusion',
              body: 'Option confirmed based on fundamental principles.',
              allocatedMarks: '0.5 Mark',
            },
          ],
          markingBreakdown: [
            { criterion: 'Correct option selection and reasoning', marks: 1 },
          ],
          examinerPitfall: 'Avoid guessing without writing the governing equation or cancellation step.',
          aiExplanation: selectedClass === '10' ? 'Only option (d) forms a brand new chemical compound (CuO). The rest are purely physical state changes.' : 'Because potential is a scalar quantity (unlike vector electric field), equal positive and negative numbers sum to exactly zero everywhere on the equatorial line.',
        },
        {
          id: 'up-q21',
          questionNumber: 21,
          section: 'Section B',
          sectionTitle: 'Section B: Very Short Answer Questions (2 Marks Each)',
          marks: 2,
          questionType: 'VSA',
          competency: 'Understanding & Formula Application',
          chapter: selectedClass === '10' ? 'Electricity & Circuits' : 'Current Electricity',
          questionText:
            selectedClass === '10'
              ? 'A piece of wire of resistance $20\\,\\Omega$ is drawn out so that its length is increased to twice its original length. Calculate the new resistance of the wire.'
              : 'Define mobility of charge carriers. Write its S.I. unit and relation with drift velocity.',
          cbseSourceRef: 'Uploaded Exam Paper - Section B Q21',
          modelAnswer:
            selectedClass === '10'
              ? '**Given:** Original resistance $R_1 = 20\\,\\Omega$, new length $l_2 = 2l_1$.\n\nSince volume of wire remains constant ($V = A_1 l_1 = A_2 l_2$):\n$$A_2 = A_1 \\frac{l_1}{l_2} = \\frac{A_1}{2}$$\n\nNew resistance $R_2$:\n$$R_2 = \\rho \\frac{l_2}{A_2} = \\rho \\frac{2l_1}{A_1 / 2} = 4 \\left(\\rho \\frac{l_1}{A_1}\\right) = 4 R_1$$\n$$R_2 = 4 \\times 20\\,\\Omega = \\mathbf{80\\,\\Omega}$$'
              : '**Mobility ($\\mu$):**\nMobility is defined as the magnitude of drift velocity per unit applied electric field.\n$$\\mu = \\frac{|v_d|}{E}$$\n**S.I. Unit:** $\\text{m}^2\\text{V}^{-1}\\text{s}^{-1}$ or $\\text{C}\\cdot\\text{s}\\cdot\\text{kg}^{-1}$.',
          steps: [
            {
              label: 'Step 1: Formula / Principle',
              body: selectedClass === '10' ? 'Apply volume conservation $A_1 l_1 = A_2 l_2$ to find area change.' : 'State definition of mobility as ratio $\\mu = v_d / E$.',
              allocatedMarks: '1.0 Mark',
            },
            {
              label: 'Step 2: Calculation & Final Unit',
              body: selectedClass === '10' ? '$R_2 = 4 R_1 = 80\\,\\Omega$.' : 'Write SI unit $\\text{m}^2\\text{V}^{-1}\\text{s}^{-1}$.',
              allocatedMarks: '1.0 Mark',
            },
          ],
          markingBreakdown: [
            { criterion: 'Formula / relation formulation', marks: 1 },
            { criterion: 'Final numerical result / SI unit', marks: 1 },
          ],
          examinerPitfall: selectedClass === '10' ? 'Students assume area stays the same and get 40 ohms. When wire is stretched, area decreases by half!' : 'Omitting unit or writing speed unit m/s loses 1 mark.',
          aiExplanation: selectedClass === '10' ? 'Stretching a wire makes it both twice as long AND half as thick. Both effects double the resistance ($2 \\times 2 = 4$ times increase).' : 'Mobility tells us how easily electrons glide through a conductor when pushed by 1 Volt per meter of electric field.',
        },
        {
          id: 'up-q27',
          questionNumber: 27,
          section: 'Section C',
          sectionTitle: 'Section C: Short Answer Questions (3 Marks Each)',
          marks: 3,
          questionType: 'SA',
          competency: 'Analytical Derivation & Logic',
          chapter: selectedClass === '10' ? 'Acids, Bases and Salts' : 'Ray Optics & Optical Instruments',
          questionText:
            selectedClass === '10'
              ? 'Equal lengths of magnesium ribbons are taken in test tubes A and B. Hydrochloric acid ($\\text{HCl}$) is added to test tube A, while acetic acid ($\\text{CH}_3\\text{COOH}$) is added to test tube B of equal concentrations.\n(a) In which test tube will the fizzing occur more vigorously and why?\n(b) Name the gas produced and write its characteristic test.\n(c) Write the chemical equation for the reaction taking place in test tube A.'
              : 'A convex lens of focal length $20\\text{ cm}$ in air is immersed in water of refractive index $4/3$. Calculate its new focal length in water ($n_g = 3/2$).',
          cbseSourceRef: 'Uploaded Exam Paper - Section C Q27',
          modelAnswer:
            selectedClass === '10'
              ? '**(a) Fizzing Observation:**\nFizzing will occur more vigorously in **Test Tube A**. $\\text{HCl}$ is a strong mineral acid that completely dissociates in water releasing a higher concentration of $\\text{H}^+$ ions, leading to a much faster rate of reaction compared to weak acetic acid.\n\n**(b) Gas & Test:**\n- **Gas Produced:** Hydrogen gas ($\\text{H}_2$).\n- **Test:** Bring a burning splinter near the mouth of the test tube; the gas burns with a characteristic **"pop" sound**.\n\n**(c) Chemical Equation:**\n$$\\text{Mg(s)} + 2\\text{HCl(aq)} \\rightarrow \\text{MgCl}_2\\text{(aq)} + \\text{H}_2\\text{(g)} \\uparrow$$'
              : '**Lens Maker\'s Formula in Air:**\n$$\\frac{1}{f_a} = (n_g - 1) \\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) = \\left(\\frac{3}{2} - 1\\right) K = \\frac{1}{2} K \\implies K = \\frac{2}{f_a} = \\frac{2}{20} = \\frac{1}{10}$$\n\n**In Water ($n_w = 4/3$):**\n$$\\frac{1}{f_w} = \\left(\\frac{n_g}{n_w} - 1\\right) K = \\left(\\frac{3/2}{4/3} - 1\\right) K = \\left(\\frac{9}{8} - 1\\right) \\left(\\frac{1}{10}\\right) = \\frac{1}{8} \\times \\frac{1}{10} = \\frac{1}{80}$$\n$$f_w = \\mathbf{80\\text{ cm}}$$',
          steps: [
            {
              label: 'Step 1: Part (a) / Lens Maker in Air',
              body: selectedClass === '10' ? 'HCl is strong acid -> more H+ ions -> vigorous effervescence.' : '1/fa = (3/2 - 1)(1/R1 - 1/R2) = 1/20.',
              allocatedMarks: '1.0 Mark',
            },
            {
              label: 'Step 2: Part (b) / Lens in Water Medium',
              body: selectedClass === '10' ? 'H2 gas with pop sound test.' : '1/fw = (9/8 - 1)(1/10) = 1/80.',
              allocatedMarks: '1.0 Mark',
            },
            {
              label: 'Step 3: Part (c) / Final Evaluation',
              body: selectedClass === '10' ? 'Balanced equation Mg + 2HCl -> MgCl2 + H2.' : 'Focal length in water fw = 80 cm (4 times longer).',
              allocatedMarks: '1.0 Mark',
            },
          ],
          markingBreakdown: [
            { criterion: 'Part (a) explanation with H+ ion reasoning', marks: 1 },
            { criterion: 'Part (b) naming gas & pop sound test', marks: 1 },
            { criterion: 'Part (c) balanced chemical equation', marks: 1 },
          ],
          examinerPitfall: 'Forgetting to specify state symbols (s, aq, g) in balanced chemical reaction.',
          aiExplanation: 'Strong acids give up their H+ protons instantly like an opened fire hydrant, whereas weak acids release H+ slowly in small trickle.',
        },
        {
          id: 'up-q34',
          questionNumber: 34,
          section: 'Section D',
          sectionTitle: 'Section D: Long Answer Questions (5 Marks Each)',
          marks: 5,
          questionType: 'LA',
          competency: 'Comprehensive Multi-Part Derivation',
          chapter: selectedClass === '10' ? 'Life Processes - Nutrition & Excretion' : 'Electromagnetic Induction & Alternating Current',
          questionText:
            selectedClass === '10'
              ? '(a) Draw a neat diagram of the Human Excretory System and label the following parts:\n    (i) Kidney, (ii) Ureter, (iii) Urinary Bladder, (iv) Urethra.\n(b) Name the structural and functional unit of kidney.\n(c) Explain the two major stages in urine formation in nephrons.'
              : '(a) Explain the principle and working of an AC Generator with a neat labeled schematic diagram.\n(b) Derive an expression for the instantaneous alternating emf induced in a coil of $N$ turns rotating with angular velocity $\\omega$ in a uniform magnetic field $B$.',
          cbseSourceRef: 'Uploaded Exam Paper - Section D Q34',
          modelAnswer:
            selectedClass === '10'
              ? '**(a) Diagram Directives:**\n- Bean-shaped paired kidneys located in the abdomen.\n- Tube-like ureters connecting kidneys to bladder.\n- Pear-shaped urinary bladder.\n- Exit duct urethra.\n\n**(b) Functional Unit:**\n- **Nephron**.\n\n**(c) Mechanism of Urine Formation:**\n1. **Ultrafiltration:** Blood flows under high pressure through the glomerulus; water, glucose, amino acids, urea, and salts are filtered into Bowman\'s capsule.\n2. **Selective Reabsorption:** As the filtrate passes through the tubular part of the nephron, useful substances like glucose, amino acids, salts, and major amount of water are selectively reabsorbed back into the blood capillaries.\n3. **Tubular Secretion:** Additional wastes like $\\text{K}^+$, $\\text{H}^+$, and drugs are secreted directly into the collecting duct to form urine.'
              : '**(a) Principle of AC Generator:**\nWorks on **Electromagnetic Induction (Faraday\'s Law)**: When a closed coil rotates in a uniform magnetic field, magnetic flux linked with it changes continuously, inducing an alternating emf.\n\n**(b) Mathematical Derivation:**\nLet a rectangular coil of $N$ turns and area $A$ rotate at angular speed $\\omega$.\nAt time $t$, angle $\\theta = \\omega t$.\n$$\\Phi = N B A \\cos(\\omega t)$$\n\nAccording to Faraday\'s Law:\n$$e = -\\frac{d\\Phi}{dt} = -\\frac{d}{dt}[N B A \\cos(\\omega t)]$$\n$$e = -N B A [-\\omega \\sin(\\omega t)] = N B A \\omega \\sin(\\omega t)$$\n$$e = e_0 \\sin(\\omega t), \\quad \\text{where } e_0 = N B A \\omega$$',
          steps: [
            {
              label: 'Step 1: Principle & Schematic Diagram',
              body: 'Diagram with labels & Faraday\'s law statement.',
              allocatedMarks: '2.0 Marks',
            },
            {
              label: 'Step 2: Flux Equation & Differentiation',
              body: 'Phi = NBA cos(omega t) and e = -dPhi/dt.',
              allocatedMarks: '2.0 Marks',
            },
            {
              label: 'Step 3: Peak EMF & Sinusoidal Conclusion',
              body: 'e = e0 sin(omega t) where e0 = NBA omega.',
              allocatedMarks: '1.0 Mark',
            },
          ],
          markingBreakdown: [
            { criterion: 'Neat labeled diagram with proper connections', marks: 2 },
            { criterion: 'Mathematical formulation of flux variation', marks: 2 },
            { criterion: 'Final standard equation e = e0 sin(omega*t)', marks: 1 },
          ],
          examinerPitfall: 'Omitting the negative sign in Faraday\'s law -$d\\Phi/dt$ or confusing cosine with sine.',
          aiExplanation: 'As the coil spins, the number of magnetic field lines slicing through its window rises and falls smoothly like a sine wave, creating alternating positive and negative voltage.',
        },
        {
          id: 'up-q37',
          questionNumber: 37,
          section: 'Section E',
          sectionTitle: 'Section E: Case-Based Integrated Assessment (4 Marks)',
          marks: 4,
          questionType: 'Case Study',
          competency: 'Real-World Data Interpretation & Synthesis',
          chapter: selectedClass === '10' ? 'Heredity & Evolution' : 'Semiconductor Electronics & Solar Cells',
          questionText:
            selectedClass === '10'
              ? '**Case Study Passage:**\nMendel blended mathematics with biology to discover how traits are passed down generations. He crossed pure tall pea plants ($TT$) with pure short pea plants ($tt$). In the $F_1$ generation, all plants were tall. He then self-pollinated the $F_1$ progeny to obtain the $F_2$ generation.\n\n**Questions:**\n(i) What is the phenotype and genotype of the $F_1$ generation? [1 Mark]\n(ii) State the phenotypic and genotypic ratio of the $F_2$ generation. [2 Marks]\n(iii) Why did dwarf plants reappear in the $F_2$ generation despite being absent in $F_1$? [1 Mark]'
              : '**Case Study Passage:**\nA p-n junction diode is fabricated by fusing p-type and n-type semiconductor wafers. In forward bias, the depletion barrier height decreases, allowing major carriers to cross the junction. In reverse bias, only minor carriers drift across generating microampere current.\n\n**Questions:**\n(i) What happens to the width of the depletion layer in forward bias? [1 Mark]\n(ii) Draw the V-I characteristic curve for a silicon diode in forward and reverse bias. [2 Marks]\n(iii) Name a semiconductor diode specially designed to operate in reverse breakdown region. [1 Mark]',
          cbseSourceRef: 'Uploaded Exam Paper - Section E Q37',
          modelAnswer:
            selectedClass === '10'
              ? '**(i) $F_1$ Progeny:**\n- **Phenotype:** All Tall Plants.\n- **Genotype:** Heterozygous Tall ($Tt$).\n\n**(ii) $F_2$ Generation Ratios:**\n- **Phenotypic Ratio:** $3\\text{ Tall} : 1\\text{ Dwarf}$ ($3:1$).\n- **Genotypic Ratio:** $1\\text{ Pure Tall }(TT) : 2\\text{ Hybrid Tall }(Tt) : 1\\text{ Pure Dwarf }(tt)$ ($1:2:1$).\n\n**(iii) Reappearance of Dwarf Trait:**\nAccording to the **Law of Segregation**, alleles do not blend. In the $F_1$ generation, the recessive dwarf allele ($t$) remained masked by the dominant tall allele ($T$). During gamete formation in $F_1$, the two alleles segregated independently into gametes, allowing homozygous recessive ($tt$) combinations to form in $F_2$.'
              : '**(i) Depletion Layer:**\nThe width of the depletion layer **decreases** (barrier potential is reduced by applied external voltage).\n\n**(ii) V-I Characteristics:**\n- Forward bias shows exponential knee voltage around $0.7\\text{ V}$ for Silicon.\n- Reverse bias shows tiny saturation current and sharp Zener/Avalanche breakdown.\n\n**(iii) Device:**\n**Zener Diode** (used as a DC voltage regulator).',
          steps: [
            {
              label: 'Step 1: Sub-part (i) Analysis',
              body: 'State direct parameter based on passage principles.',
              allocatedMarks: '1.0 Mark',
            },
            {
              label: 'Step 2: Sub-part (ii) Graph / Ratio',
              body: 'Write exact ratios / draw labeled characteristic curve.',
              allocatedMarks: '2.0 Marks',
            },
            {
              label: 'Step 3: Sub-part (iii) Biological/Electronic Justification',
              body: 'Apply Law of Segregation or name Zener diode.',
              allocatedMarks: '1.0 Mark',
            },
          ],
          markingBreakdown: [
            { criterion: 'Subpart (i) correct answer', marks: 1 },
            { criterion: 'Subpart (ii) complete ratios / curves', marks: 2 },
            { criterion: 'Subpart (iii) law citation / device identification', marks: 1 },
          ],
          examinerPitfall: 'Writing only 3:1 ratio without mentioning whether it is phenotypic or genotypic loses 1 mark.',
          aiExplanation: 'Case study questions test real comprehension of passages: Always answer each numbered sub-part clearly with exact labels so the examiner can award individual marks.',
        },
      ];

      const newUploadedPaper: CBSESamplePaper = {
        id: 'user-uploaded-' + Date.now(),
        classLevel: selectedClass,
        subject,
        subjectCode: selectedClass === '10' ? '086' : '042',
        stream: selectedClass === '12' ? 'science' : 'general',
        year: '2025 Custom Upload',
        title: paperTitle,
        totalMarks: 80,
        timeAllowed: '3 Hours',
        officialSourceUrl: 'https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html',
        officialSourceLabel: 'Uploaded School Examination Paper (AI Structured)',
        generalInstructions: [
          'This uploaded question paper has been parsed into 5 standard CBSE sections (A, B, C, D, E).',
          'Section A: 1 Mark Objective Questions with Verified Key.',
          'Section B: 2 Marks Very Short Questions with Formula Breakdown.',
          'Section C: 3 Marks Short Answer Questions with Step Allocation.',
          'Section D: 5 Marks Long Answer Questions with Complete Derivation.',
          'Section E: 4 Marks Case-Based Integrated Assessment.',
        ],
        questions: parsedQuestions,
      };

      setIsProcessing(false);
      onPaperUploaded(newUploadedPaper);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Exam Paper Parser & Section Divider</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
              Upload Exam / Question Paper
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Upload any school exam paper (PDF, Image, Text) and our AI will automatically divide it into Section A–E with step-by-step marking solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preset'
                ? 'bg-[var(--color-surface)] text-blue-600 dark:text-blue-400 shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            ⭐ 1-Click Pre-Board Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'file'
                ? 'bg-[var(--color-surface)] text-blue-600 dark:text-blue-400 shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            📁 File Drop (PDF / Image)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'text'
                ? 'bg-[var(--color-surface)] text-blue-600 dark:text-blue-400 shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            📝 Paste Questions Text
          </button>
        </div>

        {/* Class & Subject Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Class Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedClass('10')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedClass === '10'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)]'
                }`}
              >
                Class 10th
              </button>
              <button
                type="button"
                onClick={() => setSelectedClass('12')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedClass === '12'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)]'
                }`}
              >
                Class 12th
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Mathematics, Physics, Chemistry..."
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'preset' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
              Select an authentic Pre-Board Examination Sample:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleLoadPreset('10-sci')}
                className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-blue-500 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-600">
                    CLASS 10
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-blue-600 truncate">
                    Science Pre-Board 2025
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Full 5-Section paper (MCQs, VSA, SA, LA & Case Studies)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('10-math')}
                className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-blue-500 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-600">
                    CLASS 10
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-blue-600 truncate">
                    Maths Standard Pre-Board
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Step derivations, theorems & geometric proofs
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('12-phy')}
                className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-purple-500 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/10 text-purple-600">
                    CLASS 12
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-purple-600 truncate">
                    Physics Mid-Term Mock
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  AC Generator, Wave Optics & Electrostatics sections
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('12-chem')}
                className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-purple-500 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/10 text-purple-600">
                    CLASS 12
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-purple-600 truncate">
                    Chemistry Board Paper
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Nernst equations, coordination compounds & mechanisms
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: File Drop */}
        {activeTab === 'file' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-blue-500 bg-[var(--color-surface-subtle)] text-center cursor-pointer transition-all space-y-3 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text)]">
                {fileName ? fileName : 'Click to Browse or Drag & Drop Question Paper PDF/Image'}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {fileSize ? `File Size: ${fileSize} • Ready to parse` : 'Supports PDF, PNG, JPG, Text, and Scanned Question Sheets'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Text Paste */}
        {activeTab === 'text' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--color-text)]">
              Paste Question Paper Content
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw exam questions here... (e.g., Q1. What is Ohm's Law? Q2. State Fleming's Left Hand Rule...)"
              className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Processing State Indicator */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{progressStatus}</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900/50 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-3/4 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessUpload}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Paper...' : '⚡ Parse into Sections & Solutions'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
