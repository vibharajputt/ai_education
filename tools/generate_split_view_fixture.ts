import fs from 'node:fs';
import path from 'node:path';

const sampleExplanations = [
  {
    type: 'solution',
    body: 'For a convex lens forming a real image equal to the size of the object, the object is placed at **2F1** (distance $2f = 50\\text{ cm} \\implies f = 25\\text{ cm}$). Power of the lens $P = \\frac{1}{f(\\text{in m})} = \\frac{1}{0.25} = +4.0\\text{ D}$.',
    steps: [
      { label: 'Step 1: Position of Needle', body: 'Since magnification $m = -1$ (equal size, real), $v = 50\\text{ cm}$ and $u = -50\\text{ cm}$. Needle is placed $50\\text{ cm}$ in front of the lens.' },
      { label: 'Step 2: Focal Length', body: 'Using lens formula $\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u} = \\frac{1}{50} - \\left(-\\frac{1}{50}\\right) = \\frac{2}{50} \\implies f = 25\\text{ cm} = 0.25\\text{ m}$.' },
      { label: 'Step 3: Power Calculation', body: '$P = \\frac{1}{f(\\text{in m})} = \\frac{1}{0.25} = +4.0\\text{ Dioptres}$.' }
    ],
    keyPoints: ['Real image of same size is formed at 2F2 when object is at 2F1.', 'Power is positive for convex lens.'],
    markingBreakdown: [
      { criterion: 'Stating correct position of needle at 50 cm in front of lens', marks: 1 },
      { criterion: 'Correct calculation of focal length f = 25 cm', marks: 1 },
      { criterion: 'Correct calculation of power +4.0 D with unit', marks: 1 }
    ],
    diagramNote: 'Ray diagram showing two rays starting from top of object passing through optical center O and principal focus F2, meeting at 2F2.',
    commonMistakes: ['Forgetting to convert focal length from cm to meters before calculating power.', 'Omitting the + sign for convex lens power.'],
    requiredKeywords: ['2F1', 'optical center', 'focal length', 'Dioptres', 'real image'],
    examinerNote: 'CBSE examiners strictly deduct 0.5 marks if unit "D" or sign "+" is missing in the final power statement.',
    summary: 'Needle placed at 50 cm; Focal length f = 25 cm; Power P = +4.0 D.'
  },
  {
    type: 'solution',
    body: 'According to Ohm\'s Law, current $I$ flowing through a conductor is directly proportional to potential difference $V$ across its ends ($V = IR$). The slope of $V-I$ graph gives resistance $R$.',
    steps: [
      { label: 'Step 1: Statement of Ohm Law', body: 'State $V \\propto I$ at constant temperature.' },
      { label: 'Step 2: Mathematical Expression', body: '$V = IR$, where $R$ is constant resistance.' }
    ],
    keyPoints: ['Temperature must remain constant.', 'V-I graph is a straight line passing through origin.'],
    markingBreakdown: [
      { criterion: 'State Ohm Law with constant temperature condition', marks: 1 },
      { criterion: 'Write V = IR and define symbols', marks: 1 }
    ],
    diagramNote: 'Circuit diagram with ammeter in series, voltmeter in parallel, battery, rheostat, and key.',
    commonMistakes: ['Forgetting to mention "at constant temperature".'],
    requiredKeywords: ['proportional', 'constant temperature', 'resistance', 'voltmeter'],
    examinerNote: 'Omitting "constant temperature" leads to direct 1 mark deduction in CBSE marking schemes.',
    summary: 'Current is proportional to voltage at constant temperature; V = IR.'
  }
];

export function generateSplitViewPaperFixture() {
  const items: any[] = [];
  const explanationsMap: Record<string, any> = {};

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
  const chapters = [
    'Light Reflection and Refraction', 'Electricity', 'Magnetic Effects',
    'Chemical Reactions', 'Acids, Bases and Salts', 'Life Processes',
    'Real Numbers', 'Polynomials', 'Quadratic Equations', 'Triangles', 'Trigonometry'
  ];

  for (let i = 1; i <= 40; i++) {
    const itemId = `q-sv-${String(i).padStart(3, '0')}`;
    const subject = subjects[(i - 1) % subjects.length];
    const chapter = chapters[(i - 1) % chapters.length];
    const year = 2015 + (i % 10);
    const marks = i % 5 === 0 ? 5 : i % 3 === 0 ? 3 : 2;
    const repeatCount = (i % 7) + 2;

    const item = {
      id: itemId,
      kind: 'question',
      track: 'school',
      subject,
      chapter,
      concepts: [`Core Concept ${i}`],
      body: `Question ${i}: [CBSE ${year} Board] State and derive the fundamental principle of ${chapter}. Calculate the required quantitative value when parameters are given.`,
      latex: i % 2 === 0 ? `P = \\frac{V^2}{R} = I^2 R, \\quad E = P \\times t` : undefined,
      images: [],
      tags: ['cbse', 'class10', subject.toLowerCase()],
      difficulty: i % 4 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
      marks,
      questionType: marks === 5 ? 'long' : 'short',
      year,
      metadata: {
        repeatCount,
        siblingYears: [2016, 2018, 2020, 2022, 2024].slice(0, repeatCount),
      }
    };

    items.push(item);

    // Every item has a verified explanation fixture
    const expTemplate = sampleExplanations[(i - 1) % sampleExplanations.length];
    explanationsMap[itemId] = {
      itemId,
      ...expTemplate,
      summary: `Verified solution for Question ${i} (${marks} Marks).`
    };
  }

  const collection = {
    id: 'split-view-paper-col',
    title: 'Class 10 CBSE Exemplar Board Exam Paper',
    description: '40-Question complete paper with verified explanations, mark-wise answer coach, and keyword checklists.',
    scopeLabel: '40 Questions across Class 10 STEM — CBSE Board Paper',
    filters: {
      subject: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
      difficulty: ['easy', 'medium', 'hard']
    }
  };

  return { collection, items, explanationsMap };
}

const fixtureData = generateSplitViewPaperFixture();

const paths = [
  path.resolve(process.cwd(), 'content', 'split-view-paper.json'),
  path.resolve(process.cwd(), 'public', 'content', 'split-view-paper.json'),
];

for (const p of paths) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ collection: fixtureData.collection, items: fixtureData.items }, null, 2), 'utf-8');
}

// Write explanations map to content/explanations.json
const expFile = path.resolve(process.cwd(), 'content', 'explanations.json');
let existingExps: any[] = [];
if (fs.existsSync(expFile)) {
  try { existingExps = JSON.parse(fs.readFileSync(expFile, 'utf-8')); } catch { existingExps = []; }
}
const updatedExps = [...existingExps, ...Object.values(fixtureData.explanationsMap)];
fs.writeFileSync(expFile, JSON.stringify(updatedExps, null, 2), 'utf-8');
console.log('✅ Generated 40-question split-view paper fixture.');
