// src/modules/split-view/data/cbsePapers.ts
// Official CBSE Board Sample Question Papers (SQP) & Marking Schemes (cbseacademic.nic.in)
// Filtered specifically for Class 10th and Class 12th students.

export interface CBSEQuestion {
  id: string;
  questionNumber: number;
  section: 'Section A' | 'Section B' | 'Section C' | 'Section D' | 'Section E';
  sectionTitle: string;
  marks: number;
  questionType: 'MCQ' | 'VSA' | 'SA' | 'LA' | 'Case Study';
  competency: string;
  chapter: string;
  questionText: string;
  latex?: string;
  options?: string[];
  correctOption?: string;
  cbseSourceRef: string;
  // Solution details
  modelAnswer: string;
  steps: {
    label: string;
    body: string;
    allocatedMarks?: string;
  }[];
  markingBreakdown: {
    criterion: string;
    marks: number;
  }[];
  keyFormulaOrLaw?: string;
  examinerPitfall: string;
  aiExplanation: string;
  diagramGuidance?: {
    required: boolean;
    description: string;
    labelsToInclude: string[];
  };
}

export interface CBSESamplePaper {
  id: string;
  classLevel: '10' | '12';
  subject: string;
  subjectCode: string;
  stream?: 'science' | 'commerce' | 'arts' | 'general';
  year: string;
  title: string;
  totalMarks: number;
  timeAllowed: string;
  generalInstructions: string[];
  officialSourceUrl: string;
  officialSourceLabel: string;
  questions: CBSEQuestion[];
}

export const CBSE_PAPERS_DATABASE: CBSESamplePaper[] = [
  // =========================================================================
  // ── 1. CLASS 10: SCIENCE (Subject Code 086) ──────────────────────────────
  // =========================================================================
  {
    id: 'cbse-10-science-2025',
    classLevel: '10',
    subject: 'Science',
    subjectCode: '086',
    stream: 'general',
    year: '2024-25 / 2025-26 SQP',
    title: 'CBSE Class 10 Science Official Sample Question Paper',
    totalMarks: 80,
    timeAllowed: '3 Hours',
    officialSourceUrl: 'https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html',
    officialSourceLabel: 'Official CBSE Academic Portal (cbseacademic.nic.in)',
    generalInstructions: [
      'This question paper consists of 39 questions in 5 sections.',
      'Section A consists of 20 objective type questions carrying 1 mark each.',
      'Section B consists of 6 Very Short questions carrying 2 marks each. Answers should be in the range of 30 to 50 words.',
      'Section C consists of 7 Short Answer type questions carrying 3 marks each. Answers should be in the range of 50 to 80 words.',
      'Section D consists of 3 Long Answer type questions carrying 5 marks each. Answer should be in the range of 80 to 120 words.',
      'Section E consists of 3 source-based/case-based units of assessment of 4 marks each with sub-parts.',
    ],
    questions: [
      {
        id: 'c10-sci-q1',
        questionNumber: 1,
        section: 'Section A',
        sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
        marks: 1,
        questionType: 'MCQ',
        competency: 'Conceptual Recall & Chemical Reactions',
        chapter: 'Chemical Reactions and Equations',
        questionText:
          'When aqueous solutions of Potassium Iodide and Lead Nitrate are mixed, an insoluble substance separates out. The chemical reaction that takes place is an example of:',
        options: [
          '(a) Combination reaction',
          '(b) Decomposition reaction',
          '(c) Double displacement and precipitation reaction',
          '(d) Redox reaction only',
        ],
        correctOption: '(c)',
        cbseSourceRef: 'CBSE SQP 2024-25 Science Code 086, Q1',
        modelAnswer:
          '**(c) Double displacement and precipitation reaction**\n\nWhen potassium iodide ($KI$) reacts with lead nitrate ($Pb(NO_3)_2$), an exchange of ions occurs forming potassium nitrate ($KNO_3$) and a brilliant yellow precipitate of lead iodide ($PbI_2$).\n\n$$\\text{Pb(NO}_3)_2\\text{(aq)} + 2\\text{KI(aq)} \\rightarrow \\text{PbI}_2\\text{(s)} \\downarrow + 2\\text{KNO}_3\\text{(aq)}$$',
        steps: [
          {
            label: 'Step 1: Identify Chemical Species & Reactants',
            body: 'Reactants are soluble salts: Lead nitrate $\\text{Pb(NO}_3)_2$ and Potassium iodide $\\text{KI}$.',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Recognize Reaction Classification',
            body: 'Ions exchange places ($\text{Pb}^{2+}$ pairs with $\text{I}^-$, and $\text{K}^+$ pairs with $\text{NO}_3^-$) creating insoluble yellow $\\text{PbI}_2$ precipitate. This is Double Displacement & Precipitation.',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Selecting option (c) or naming Double displacement & Precipitation', marks: 1 },
        ],
        keyFormulaOrLaw: 'Double Displacement: AB + CD -> AD + CB (with precipitate formation)',
        examinerPitfall:
          'Students often write only "Displacement reaction" instead of "Double displacement". Single displacement involves a free element displacing an ion, which is incorrect here.',
        aiExplanation:
          'Think of double displacement like partner swapping in a dance: Lead swaps nitrate for iodide, while Potassium swaps iodide for nitrate. Lead Iodide cannot dissolve in water, so it falls out as a bright yellow solid (precipitate).',
      },
      {
        id: 'c10-sci-q2',
        questionNumber: 2,
        section: 'Section A',
        sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
        marks: 1,
        questionType: 'MCQ',
        competency: 'Analysis & Optics',
        chapter: 'Light - Reflection and Refraction',
        questionText:
          'A student determines the focal length of a concave mirror by focusing the image of a distant tree on a screen. If the screen is placed at a distance of $20\\text{ cm}$ from the pole of the mirror, the radius of curvature of the mirror is:',
        options: ['(a) 10 cm', '(b) 20 cm', '(c) 40 cm', '(d) 80 cm'],
        correctOption: '(c)',
        cbseSourceRef: 'CBSE SQP 2024-25 Science Code 086, Q6',
        modelAnswer:
          '**(c) 40 cm**\n\nFor a distant object (at infinity), light rays converge at the principal focus ($F$). Therefore, focal length $f = 20\\text{ cm}$.\n\nThe radius of curvature $R$ is related to focal length by:\n$$R = 2f = 2 \\times 20\\text{ cm} = 40\\text{ cm}$$',
        steps: [
          {
            label: 'Step 1: Infer Focal Length from Distant Object Setup',
            body: 'Image of a distant object (at $\\infty$) forms at principal focus $F$. Thus focal length $f = 20\\text{ cm}$.',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Apply Radius of Curvature Formula',
            body: '$$R = 2f = 2(20) = 40\\text{ cm}$$',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Correct option (c) / numerical value 40 cm', marks: 1 },
        ],
        keyFormulaOrLaw: 'R = 2f \\quad \\text{(Radius of curvature is twice the focal length)}',
        examinerPitfall:
          'Common error: Confusing $R = 2f$ with $f = 2R$ and calculating $10\\text{ cm}$ (option a). Always remember the center of curvature is further away than the focus.',
        aiExplanation:
          'When light comes from very far away (like a distant tree), all rays arrive parallel to the principal axis and meet right at the focus. Since the screen is $20\\text{ cm}$ away, the focus is $20\\text{ cm}$. Radius of curvature is always double the focal distance ($2 \\times 20 = 40\\text{ cm}$).',
      },
      {
        id: 'c10-sci-q21',
        questionNumber: 21,
        section: 'Section B',
        sectionTitle: 'Section B: Very Short Answer Questions (2 Marks Each)',
        marks: 2,
        questionType: 'VSA',
        competency: 'Application & Chemical Equations',
        chapter: 'Acids, Bases and Salts',
        questionText:
          'A compound "X" of sodium is used as an antacid in medicine. On heating, compound "X" gives a gas "Y" that turns lime water milky.\n(a) Identify "X" and "Y".\n(b) Write a balanced chemical equation for the heating of compound "X".',
        cbseSourceRef: 'CBSE SQP 2024-25 Science Code 086, Q21',
        modelAnswer:
          '**(a) Identification:**\n- Compound "X": **Sodium Hydrogen Carbonate / Baking Soda** ($\\text{NaHCO}_3$)\n- Gas "Y": **Carbon Dioxide** ($\\text{CO}_2$)\n\n**(b) Balanced Chemical Equation on Heating:**\n$$2\\text{NaHCO}_3\\text{(s)} \\xrightarrow{\\Delta} \\text{Na}_2\\text{CO}_3\\text{(s)} + \\text{H}_2\\text{O(l)} + \\text{CO}_2\\text{(g)} \\uparrow$$',
        steps: [
          {
            label: 'Step 1: Identify compound X and evolved gas Y',
            body: 'Compound X = $\\text{NaHCO}_3$ (Sodium hydrogen carbonate), Gas Y = $\\text{CO}_2$ (Carbon dioxide).',
            allocatedMarks: '1.0 Mark (0.5 + 0.5)',
          },
          {
            label: 'Step 2: Write balanced chemical equation with thermal decomposition symbol',
            body: '$2\\text{NaHCO}_3 \\xrightarrow{\\Delta} \\text{Na}_2\\text{CO}_3 + \\text{H}_2\\text{O} + \\text{CO}_2$',
            allocatedMarks: '1.0 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Identification of X as NaHCO3 and Y as CO2', marks: 1 },
          { criterion: 'Correctly balanced thermal decomposition equation', marks: 1 },
        ],
        keyFormulaOrLaw: '2\\text{NaHCO}_3 \\xrightarrow{\\Delta} \\text{Na}_2\\text{CO}_3 + \\text{H}_2\\text{O} + \\text{CO}_2',
        examinerPitfall:
          'Writing $\\text{Na}_2\\text{CO}_3$ as compound X instead of $\\text{NaHCO}_3$. Washing soda is not used as an antacid; baking soda (sodium hydrogen carbonate) is mildly basic and safe for digestion.',
        aiExplanation:
          'Antacids need to be mild bases to neutralize stomach excess $\\text{HCl}$. Baking soda ($\\text{NaHCO}_3$) fits this perfectly. When heated, it decomposes releasing $\\text{CO}_2$, which forms white precipitate $\\text{CaCO}_3$ with lime water.',
      },
      {
        id: 'c10-sci-q27',
        questionNumber: 27,
        section: 'Section C',
        sectionTitle: 'Section C: Short Answer Questions (3 Marks Each)',
        marks: 3,
        questionType: 'SA',
        competency: 'Numerical Derivation & Circuit Laws',
        chapter: 'Electricity',
        questionText:
          'Three resistors of resistances $R_1 = 4\\,\\Omega$, $R_2 = 6\\,\\Omega$, and $R_3 = 12\\,\\Omega$ are connected in parallel across a $6\\text{ V}$ battery of negligible internal resistance.\n(a) Calculate the equivalent resistance of the combination.\n(b) Find the total current drawn from the battery.\n(c) Determine the current flowing through the $4\\,\\Omega$ resistor.',
        cbseSourceRef: 'CBSE SQP 2024-25 Science Code 086, Q27',
        modelAnswer:
          '**(a) Equivalent Resistance ($R_p$):**\n$$\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} = \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12}$$\n$$\\frac{1}{R_p} = \\frac{3 + 2 + 1}{12} = \\frac{6}{12} = \\frac{1}{2}\\,\\Omega^{-1} \\implies R_p = 2\\,\\Omega$$\n\n**(b) Total Current ($I_{total}$):**\n$$I_{total} = \\frac{V}{R_p} = \\frac{6\\text{ V}}{2\\,\\Omega} = 3\\text{ A}$$\n\n**(c) Current through $4\\,\\Omega$ Resistor ($I_1$):**\nIn parallel circuit, voltage across each branch is equal ($V = 6\\text{ V}$):\n$$I_1 = \\frac{V}{R_1} = \\frac{6\\text{ V}}{4\\,\\Omega} = 1.5\\text{ A}$$',
        steps: [
          {
            label: 'Step 1: Parallel Equivalent Resistance Formula & Calculation',
            body: '$$\\frac{1}{R_p} = \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = \\frac{6}{12} \\implies R_p = 2\\,\\Omega$$',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 2: Total Circuit Current via Ohm\'s Law',
            body: '$$I = \\frac{V}{R_p} = \\frac{6}{2} = 3\\text{ A}$$',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 3: Branch Current in 4 Ohm Resistor',
            body: '$$I_1 = \\frac{V}{R_1} = \\frac{6}{4} = 1.5\\text{ A}$$',
            allocatedMarks: '1.0 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Calculation of Rp = 2 ohms with proper formula', marks: 1 },
          { criterion: 'Total current I = 3 A with SI unit', marks: 1 },
          { criterion: 'Branch current I1 = 1.5 A with SI unit', marks: 1 },
        ],
        keyFormulaOrLaw: '\\frac{1}{R_p} = \\sum \\frac{1}{R_i}, \\quad I = \\frac{V}{R}',
        examinerPitfall:
          'Students frequently forget to invert $\\frac{1}{R_p} = \\frac{1}{2}$ and leave $R_p = 0.5\\,\\Omega$. Also, omitting amperes (A) and ohms ($\\Omega$) loses half a mark per part.',
        aiExplanation:
          'In parallel circuits, all branches feel the full $6\\text{ V}$ battery potential. Because the electrons have 3 alternative pathways, the total equivalent resistance ($2\\,\\Omega$) is smaller than the smallest individual branch resistance ($4\\,\\Omega$).',
      },
    ],
  },

  // =========================================================================
  // ── 2. CLASS 10: MATHEMATICS STANDARD (Subject Code 041) ─────────────────
  // =========================================================================
  {
    id: 'cbse-10-maths-2025',
    classLevel: '10',
    subject: 'Mathematics (Standard)',
    subjectCode: '041',
    stream: 'general',
    year: '2024-25 / 2025-26 SQP',
    title: 'CBSE Class 10 Mathematics Standard Official Sample Question Paper',
    totalMarks: 80,
    timeAllowed: '3 Hours',
    officialSourceUrl: 'https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html',
    officialSourceLabel: 'Official CBSE Academic Portal (cbseacademic.nic.in)',
    generalInstructions: [
      'This question paper contains 38 questions in 5 Sections A, B, C, D, and E.',
      'Section A comprises 20 MCQs of 1 mark each (including 2 Assertion-Reason questions).',
      'Section B comprises 5 Short Answer Type-I (SA-I) questions of 2 marks each.',
      'Section C comprises 6 Short Answer Type-II (SA-II) questions of 3 marks each.',
      'Section D comprises 4 Long Answer (LA) questions of 5 marks each.',
      'Section E comprises 3 Case-Based integrated units of assessment (4 marks each).',
    ],
    questions: [
      {
        id: 'c10-mth-q1',
        questionNumber: 1,
        section: 'Section A',
        sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
        marks: 1,
        questionType: 'MCQ',
        competency: 'Number Systems & Fundamental Theorem of Arithmetic',
        chapter: 'Real Numbers',
        questionText:
          'If two positive integers $a$ and $b$ are written as $a = x^3 y^2$ and $b = x y^3$, where $x$ and $y$ are prime numbers, then $\\text{HCF}(a, b)$ is:',
        options: ['(a) x y', '(b) x y^2', '(c) x^3 y^3', '(d) x^2 y^2'],
        correctOption: '(b)',
        cbseSourceRef: 'CBSE SQP 2024-25 Mathematics Standard Code 041, Q1',
        modelAnswer:
          '**(b) $x y^2$**\n\nGiven:\n$$a = x^3 y^2$$\n$$b = x^1 y^3$$\n\n$\\text{HCF}$ of two numbers is the product of the smallest power of each common prime factor involved in the numbers.\n$$\\text{HCF}(a, b) = x^{\\min(3, 1)} \\cdot y^{\\min(2, 3)} = x^1 \\cdot y^2 = x y^2$$',
        steps: [
          {
            label: 'Step 1: State Rule for HCF of Prime Factorized Integers',
            body: 'HCF is the product of lowest exponents of common prime bases.',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Compute Exponents',
            body: 'Lowest power of $x$ is $1$; lowest power of $y$ is $2$. Thus $\\text{HCF} = x y^2$.',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Selecting option (b) or writing xy^2', marks: 1 },
        ],
        keyFormulaOrLaw: '\\text{HCF}(a, b) = \\prod p_i^{\\min(a_i, b_i)}',
        examinerPitfall:
          'Confusing HCF with LCM. LCM takes the maximum powers ($x^3 y^3$), while HCF strictly takes the minimum powers ($x y^2$).',
        aiExplanation:
          'HCF wants what is common to both without exceeding either. For $x$, one has $x^3$ and the other has $x^1$, so only $x^1$ is common. For $y$, one has $y^2$ and the other has $y^3$, so $y^2$ is common. Result is $x y^2$.',
      },
      {
        id: 'c10-mth-q26',
        questionNumber: 26,
        section: 'Section C',
        sectionTitle: 'Section C: Short Answer Questions (3 Marks Each)',
        marks: 3,
        questionType: 'SA',
        competency: 'Proof & Logical Deduction',
        chapter: 'Real Numbers',
        questionText:
          'Prove that $\\sqrt{5}$ is an irrational number.',
        cbseSourceRef: 'CBSE SQP 2024-25 Mathematics Standard Code 041, Q26',
        modelAnswer:
          '**Proof by Contradiction:**\n\n1. Let us assume, to the contrary, that $\\sqrt{5}$ is a rational number.\n2. Therefore, we can find coprime positive integers $a$ and $b$ ($b \\neq 0$) such that:\n$$\\sqrt{5} = \\frac{a}{b} \\implies a = \\sqrt{5}b$$\n\n3. Squaring both sides:\n$$a^2 = 5b^2 \\quad \\text{--- (Equation 1)}$$\nSince $5$ divides $5b^2$, $5$ divides $a^2$. By Fundamental Theorem of Arithmetic, **$5$ divides $a$**.\n\n4. Let $a = 5c$ for some integer $c$. Substituting into Equation 1:\n$$(5c)^2 = 5b^2 \\implies 25c^2 = 5b^2 \\implies b^2 = 5c^2$$\nSince $5$ divides $5c^2$, $5$ divides $b^2$, which implies **$5$ divides $b$**.\n\n5. From steps 3 and 4, $5$ is a common factor of both $a$ and $b$. But this contradicts the fact that $a$ and $b$ are coprime (have no common factor other than $1$).\n\n6. This contradiction has arisen because of our incorrect assumption that $\\sqrt{5}$ is rational. Hence, **$\\sqrt{5}$ is irrational.**',
        steps: [
          {
            label: 'Step 1: Assumption of Rationality & Coprime Definition',
            body: 'Assume $\\sqrt{5} = a/b$ where $\\gcd(a, b) = 1$.',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Squaring & Showing 5 divides a',
            body: '$a^2 = 5b^2 \\implies 5 \\mid a^2 \\implies 5 \\mid a$.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 3: Substitution a = 5c & Showing 5 divides b',
            body: '$b^2 = 5c^2 \\implies 5 \\mid b^2 \\implies 5 \\mid b$.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 4: Stating Contradiction & Concluding Irrationality',
            body: '$a$ and $b$ share common factor 5, contradicting coprimality. Hence $\\sqrt{5}$ is irrational.',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Initial hypothesis and squaring equation', marks: 0.5 },
          { criterion: 'Proving 5 is a divisor of a', marks: 1.0 },
          { criterion: 'Proving 5 is a divisor of b', marks: 1.0 },
          { criterion: 'Valid contradiction statement and final conclusion', marks: 0.5 },
        ],
        keyFormulaOrLaw: 'Theorem: If p is prime and p | a^2, then p | a.',
        examinerPitfall:
          'Failing to explicitly state that $a$ and $b$ are "coprime integers with $b \\neq 0$" at the beginning costs 0.5 mark. Also, forgetting to cite the theorem "if $5 \\mid a^2$, then $5 \\mid a$".',
        aiExplanation:
          'Contradiction is a classic legal/logical proof: You assume the opposite (that $\\sqrt{5}$ can be written as a simplified fraction $a/b$). Then algebraic steps force both $a$ and $b$ to be multiples of 5, meaning the fraction was never in simplest form. The only explanation is that no such fraction exists!',
      },
    ],
  },

  // =========================================================================
  // ── 3. CLASS 12: PHYSICS (Subject Code 042) ──────────────────────────────
  // =========================================================================
  {
    id: 'cbse-12-physics-2025',
    classLevel: '12',
    subject: 'Physics',
    subjectCode: '042',
    stream: 'science',
    year: '2024-25 / 2025-26 SQP',
    title: 'CBSE Class 12 Physics Official Sample Question Paper',
    totalMarks: 70,
    timeAllowed: '3 Hours',
    officialSourceUrl: 'https://cbseacademic.nic.in/SQP_CLASSXII_2024-25.html',
    officialSourceLabel: 'Official CBSE Academic Portal (cbseacademic.nic.in)',
    generalInstructions: [
      'There are 33 questions in all. All questions are compulsory.',
      'This question paper has five sections: Section A, Section B, Section C, Section D and Section E.',
      'Section A contains 16 questions: 12 MCQs and 4 Assertion-Reasoning of 1 mark each.',
      'Section B contains 5 questions of 2 marks each.',
      'Section C contains 7 questions of 3 marks each.',
      'Section D contains 2 case study-based questions of 4 marks each.',
      'Section E contains 3 long answer questions of 5 marks each.',
    ],
    questions: [
      {
        id: 'c12-phy-q1',
        questionNumber: 1,
        section: 'Section A',
        sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
        marks: 1,
        questionType: 'MCQ',
        competency: 'Conceptual & Electrostatics',
        chapter: 'Electric Charges and Fields',
        questionText:
          'An electric dipole of dipole moment $\\vec{p}$ is placed in a uniform electric field $\\vec{E}$. The torque acting on the dipole and the potential energy of the dipole are respectively given by:',
        options: [
          '(a) \\tau = \\vec{p} \\cdot \\vec{E}, \\quad U = \\vec{p} \\times \\vec{E}',
          '(b) \\tau = \\vec{p} \\times \\vec{E}, \\quad U = -\\vec{p} \\cdot \\vec{E}',
          '(c) \\tau = -\\vec{p} \\times \\vec{E}, \\quad U = \\vec{p} \\cdot \\vec{E}',
          '(d) \\tau = \\vec{p} \\times \\vec{E}, \\quad U = \\vec{p} \\cdot \\vec{E}',
        ],
        correctOption: '(b)',
        cbseSourceRef: 'CBSE SQP 2024-25 Physics Code 042, Q1',
        modelAnswer:
          '**(b) $\\vec{\\tau} = \\vec{p} \\times \\vec{E}, \\quad U = -\\vec{p} \\cdot \\vec{E}$**\n\n- Torque on an electric dipole in uniform field: $\\vec{\\tau} = \\vec{p} \\times \\vec{E}$ (magnitude $\\tau = p E \\sin\\theta$, vector cross product).\n- Electrostatic Potential Energy stored in dipole: $U = -\\vec{p} \\cdot \\vec{E} = -p E \\cos\\theta$ (scalar dot product).',
        steps: [
          {
            label: 'Step 1: Torque Vector Relation',
            body: 'Torque is a pseudo-vector perpendicular to $\\vec{p}$ and $\\vec{E}$, hence cross product $\\vec{\\tau} = \\vec{p} \\times \\vec{E}$.',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Potential Energy Formula',
            body: 'Work done $W = -\\int \\tau d\\theta = -pE\\cos\\theta = -\\vec{p} \\cdot \\vec{E}$.',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Selecting option (b) with proper cross and negative dot product', marks: 1 },
        ],
        keyFormulaOrLaw: '\\vec{\\tau} = \\vec{p} \\times \\vec{E}, \\quad U = -\\vec{p} \\cdot \\vec{E}',
        examinerPitfall:
          'Forgetting the negative sign in potential energy $U = -\\vec{p} \\cdot \\vec{E}$. At $\\theta = 0^\\circ$ (stable equilibrium), potential energy is minimum ($-pE$).',
        aiExplanation:
          'Torque rotates the dipole to align with the field, so it depends on sine (cross product). Potential energy is lowest when aligned and highest when anti-parallel ($180^\\circ$), which is why it uses a negative cosine (dot product).',
      },
      {
        id: 'c12-phy-q28',
        questionNumber: 28,
        section: 'Section C',
        sectionTitle: 'Section C: Short Answer Questions (3 Marks Each)',
        marks: 3,
        questionType: 'SA',
        competency: 'Wave Optics & Derivation',
        chapter: 'Wave Optics',
        questionText:
          'State Huygens\' Principle. Using Huygens\' wave theory, derive Snell\'s Law of Refraction ($n_1 \\sin i = n_2 \\sin r$) when a plane wavefront travels from a rarer medium of refractive index $n_1$ to a denser medium of refractive index $n_2$.',
        cbseSourceRef: 'CBSE SQP 2024-25 Physics Code 042, Q28',
        modelAnswer:
          '**Huygens\' Principle Statement:**\n1. Every point on a given wavefront acts as a fresh source of secondary spherical wavelets spreading in all directions with the speed of the wave in that medium.\n2. The forward envelope (tangential surface) to these secondary wavelets at any later time gives the new position of the wavefront.\n\n**Derivation of Snell\'s Law:**\n1. Let $AB$ be a plane wavefront incident at angle $i$ on the interface $PP\'$ separating Medium 1 (speed $v_1$, refractive index $n_1$) and Medium 2 (speed $v_2$, refractive index $n_2$).\n2. Let $\\tau$ be the time taken by the wave to travel from point $B$ to $C$ on the interface. Therefore, $BC = v_1 \\tau$.\n3. During this same time $\\tau$, secondary wavelets from point $A$ spread in Medium 2 over distance $AE = v_2 \\tau$.\n4. Draw tangent $CE$ from $C$ to the wavelet sphere at $E$. $CE$ represents the refracted wavefront.\n\nIn right-angled triangle $\\Delta ABC$:\n$$\\sin i = \\frac{BC}{AC} = \\frac{v_1 \\tau}{AC} \\quad \\text{--- (1)}$$\n\nIn right-angled triangle $\\Delta AEC$:\n$$\\sin r = \\frac{AE}{AC} = \\frac{v_2 \\tau}{AC} \\quad \\text{--- (2)}$$\n\nDividing equation (1) by equation (2):\n$$\\frac{\\sin i}{\\sin r} = \\frac{v_1 \\tau / AC}{v_2 \\tau / AC} = \\frac{v_1}{v_2}$$\n\nSince refractive index $n = c/v \\implies v_1 / v_2 = n_2 / n_1$:\n$$\\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1} \\implies n_1 \\sin i = n_2 \\sin r$$\n**Hence Snell\'s Law is proved.**',
        steps: [
          {
            label: 'Step 1: Statement of Huygens\' Principle',
            body: 'Define primary wavefront points as secondary sources and forward envelope as new wavefront.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 2: Geometrical Construction & Time Equations',
            body: '$BC = v_1 \\tau$ and $AE = v_2 \\tau$ in right triangles $\\Delta ABC$ and $\\Delta AEC$.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 3: Ratio and Snell\'s Law Deduction',
            body: '$\\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2} = \\frac{n_2}{n_1} \\implies n_1 \\sin i = n_2 \\sin r$.',
            allocatedMarks: '1.0 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Accurate two-point statement of Huygens principle', marks: 1.0 },
          { criterion: 'Ray & wavefront geometry setup with sin i and sin r ratios', marks: 1.0 },
          { criterion: 'Final step relating wave speeds to refractive indices', marks: 1.0 },
        ],
        keyFormulaOrLaw: '\\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2} = \\frac{n_2}{n_1}',
        examinerPitfall:
          'Drawing ray arrows without indicating the perpendicular wavefronts $AB$ and $CE$. In wave optics, wavefronts are normal to rays; omitting the 90° symbol at $B$ and $E$ loses 0.5 mark.',
        aiExplanation:
          'When one edge of the wavefront enters the slower (denser) medium first, it slows down while the other end is still rushing through the faster medium. This differential speed bends the wavefront towards the normal, proving Snell\'s Law geometrically!',
        diagramGuidance: {
          required: true,
          description: 'Plane incident wavefront AB on interface, reflected/refracted wavelet arcs of radius v2*tau, refracted wavefront CE.',
          labelsToInclude: ['Incident wavefront AB', 'Angle i', 'Refracted wavefront CE', 'Angle r', 'Interface PP\''],
        },
      },
    ],
  },

  // =========================================================================
  // ── 4. CLASS 12: CHEMISTRY (Subject Code 043) ────────────────────────────
  // =========================================================================
  {
    id: 'cbse-12-chemistry-2025',
    classLevel: '12',
    subject: 'Chemistry',
    subjectCode: '043',
    stream: 'science',
    year: '2024-25 / 2025-26 SQP',
    title: 'CBSE Class 12 Chemistry Official Sample Question Paper',
    totalMarks: 70,
    timeAllowed: '3 Hours',
    officialSourceUrl: 'https://cbseacademic.nic.in/SQP_CLASSXII_2024-25.html',
    officialSourceLabel: 'Official CBSE Academic Portal (cbseacademic.nic.in)',
    generalInstructions: [
      'There are 33 questions in this question paper with internal choice.',
      'SECTION A consists of 16 multiple-choice questions carrying 1 mark each.',
      'SECTION B consists of 5 short answer questions carrying 2 marks each.',
      'SECTION C consists of 7 short answer questions carrying 3 marks each.',
      'SECTION D consists of 2 case-based questions carrying 4 marks each.',
      'SECTION E consists of 3 long answer questions carrying 5 marks each.',
    ],
    questions: [
      {
        id: 'c12-chem-q1',
        questionNumber: 1,
        section: 'Section A',
        sectionTitle: 'Section A: Multiple Choice Questions (1 Mark Each)',
        marks: 1,
        questionType: 'MCQ',
        competency: 'Coordination Compounds & IUPAC Nomenclature',
        chapter: 'Coordination Compounds',
        questionText:
          'The IUPAC name of the coordination compound $[\\text{Co}(\\text{NH}_3)_5(\\text{CO}_3)]\\text{Cl}$ is:',
        options: [
          '(a) Pentaamminecarbonatocobalt(III) chloride',
          '(b) Pentaamminecarbonatocobalt(II) chloride',
          '(c) Carbonatopentaamminecobalt(III) chloride',
          '(d) Pentaamminechlorocobalt(III) carbonate',
        ],
        correctOption: '(a)',
        cbseSourceRef: 'CBSE SQP 2024-25 Chemistry Code 043, Q1',
        modelAnswer:
          '**(a) Pentaamminecarbonatocobalt(III) chloride**\n\n- Ligands in alphabetical order: "ammine" ($\\text{NH}_3$) before "carbonato" ($\\text{CO}_3^{2-}$).\n- 5 ammines = *pentaammine*, 1 carbonato = *carbonato*.\n- Oxidation state of Co: $x + 5(0) + (-2) + (-1) = 0 \\implies x = +3$.\n- Hence, **Pentaamminecarbonatocobalt(III) chloride**.',
        steps: [
          {
            label: 'Step 1: Calculate Central Metal Oxidation State',
            body: '$x + 5(0) - 2 - 1 = 0 \\implies x = +3$, Roman numeral (III).',
            allocatedMarks: '0.5 Mark',
          },
          {
            label: 'Step 2: Apply Alphabetical Ligand Naming',
            body: 'Ammine (A) precedes Carbonato (C). Cationic complex retains metal name Cobalt.',
            allocatedMarks: '0.5 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Selecting option (a) with correct oxidation state (III)', marks: 1 },
        ],
        keyFormulaOrLaw: 'IUPAC Rule: [Ligands in alphabetical order] + Metal(Oxidation State in Roman) + Anion',
        examinerPitfall:
          'Spelling "ammine" with a single \'m\' (amine is for organic, ammine with double \'m\' is for coordination $\\text{NH}_3$).',
        aiExplanation:
          'Always name ligands alphabetically first (ammine starts with A, carbonato with C). Then determine Cobalt\'s charge: carbonate has -2 and chloride has -1, so Cobalt must be +3 to keep the molecule neutral.',
      },
      {
        id: 'c12-chem-q25',
        questionNumber: 25,
        section: 'Section C',
        sectionTitle: 'Section C: Short Answer Questions (3 Marks Each)',
        marks: 3,
        questionType: 'SA',
        competency: 'Electrochemistry & Nernst Equation Calculation',
        chapter: 'Electrochemistry',
        questionText:
          'Calculate the electromotive force (emf) of the following cell at $298\\text{ K}$:\n$$\\text{Mg(s)} | \\text{Mg}^{2+}(0.1\\text{ M}) || \\text{Cu}^{2+}(0.01\\text{ M}) | \\text{Cu(s)}$$\nGiven: $E^\\circ_{\\text{Mg}^{2+}/\\text{Mg}} = -2.37\\text{ V}$, $E^\\circ_{\\text{Cu}^{2+}/\\text{Cu}} = +0.34\\text{ V}$. (Take $\\frac{2.303 RT}{F} = 0.059\\text{ V}$)',
        cbseSourceRef: 'CBSE SQP 2024-25 Chemistry Code 043, Q25',
        modelAnswer:
          '**1. Standard Cell Potential ($E^\\circ_{\\text{cell}}$):**\n$$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$$\n$$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{Cu}^{2+}/\\text{Cu}} - E^\\circ_{\\text{Mg}^{2+}/\\text{Mg}} = 0.34\\text{ V} - (-2.37\\text{ V}) = +2.71\\text{ V}$$\n\n**2. Overall Cell Reaction & Electrons Exchanged ($n$):**\n$$\\text{Mg(s)} + \\text{Cu}^{2+}\\text{(aq)} \\rightarrow \\text{Mg}^{2+}\\text{(aq)} + \\text{Cu(s)} \\quad (n = 2)$$\n\n**3. Apply Nernst Equation:**\n$$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.059}{n} \\log \\frac{[\\text{Mg}^{2+}]}{[\\text{Cu}^{2+}]}$$\n$$E_{\\text{cell}} = 2.71 - \\frac{0.059}{2} \\log \\left( \\frac{0.1}{0.01} \\right)$$\n$$E_{\\text{cell}} = 2.71 - 0.0295 \\times \\log(10)$$\nSince $\\log(10) = 1$:\n$$E_{\\text{cell}} = 2.71 - 0.0295 = \\mathbf{2.6805\\text{ V}} \\approx \\mathbf{2.68\\text{ V}}$$',
        steps: [
          {
            label: 'Step 1: Calculate Standard EMF E°cell',
            body: '$E^\\circ_{\\text{cell}} = 0.34 - (-2.37) = 2.71\\text{ V}$.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 2: Formulate Nernst Equation with n=2',
            body: '$E_{\\text{cell}} = 2.71 - \\frac{0.059}{2} \\log\\left(\\frac{0.1}{0.01}\\right)$.',
            allocatedMarks: '1.0 Mark',
          },
          {
            label: 'Step 3: Solve Logarithm & Evaluate Final Voltage',
            body: '$E_{\\text{cell}} = 2.71 - 0.0295(1) = 2.68\\text{ V}$.',
            allocatedMarks: '1.0 Mark',
          },
        ],
        markingBreakdown: [
          { criterion: 'Calculating E°cell = 2.71 V', marks: 1.0 },
          { criterion: 'Writing Nernst Equation correctly with n = 2', marks: 1.0 },
          { criterion: 'Correct final answer 2.68 V with units', marks: 1.0 },
        ],
        keyFormulaOrLaw: 'E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log Q',
        examinerPitfall:
          'Inverting the reaction quotient $Q$ (putting $[\text{Cu}^{2+}]/[\text{Mg}^{2+}]$ instead of $[\text{Mg}^{2+}]/[\text{Cu}^{2+}]$). Remember $Q = [\\text{Anode ion}] / [\\text{Cathode ion}]$.',
        aiExplanation:
          'Nernst equation adjusts the ideal voltage for real-world ion concentrations. Magnesium oxidizes (gives electrons) at the anode, and Copper ions reduce at the cathode. As $\\text{Mg}^{2+}$ concentration is 10 times higher than $\\text{Cu}^{2+}$, the cell potential drops slightly from $2.71\\text{ V}$ down to $2.68\\text{ V}$.',
      },
    ],
  },
];
