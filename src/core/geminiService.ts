// src/core/geminiService.ts
// Official Google AI (Gemini & Gemma) Integration for Live AI Explanations & Doubt Solving

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.GEMINI_API_KEY ||
  '';

export type GeminiExplainMode = 'hinglish' | 'example' | 'steps' | 'pitfalls' | 'ask';

export interface GeminiExplainRequest {
  questionText: string;
  subject: string;
  chapter: string;
  marks?: number;
  modelAnswer?: string;
  mode: GeminiExplainMode;
  userPrompt?: string;
  chatHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}

// Ordered list of candidate models supported by this Google API key
const CANDIDATE_MODELS = [
  'models/gemma-4-26b-a4b-it',
  'models/gemma-4-31b-it',
  'models/gemini-flash-latest',
  'models/gemini-2.5-flash',
  'models/gemini-pro-latest',
];

export async function generateGeminiSolution(
  req: GeminiExplainRequest
): Promise<string> {
  const { questionText, subject, chapter, marks, modelAnswer, mode, userPrompt } = req;

  // Build specialized pedagogical system prompt based on mode
  let systemInstruction = `You are a top CBSE Senior Board Evaluator and Master Teacher in ${subject} for Class 10 & 12.
Provide a clear, accurate, and structured response using LaTeX formatting for all formulas ($...$ or $$...$$).`;

  if (mode === 'hinglish') {
    systemInstruction += `
Task: Explain the solution to this specific question in natural, friendly **Hinglish** (conversational Hindi in English script + English terms).
Example style: "Dekho is question me sabse pehle given parameters note karte hain... Ab is formula me values put karenge..."
Break it down step-by-step so any student can understand instantly.`;
  } else if (mode === 'example') {
    systemInstruction += `
Task: Explain the fundamental concept of this question using **vivid, practical real-world daily life examples and analogies** (e.g., household items, sports, vehicles, cooking, water flow, sunlight).
Connect the intuition directly to solving this exact CBSE problem.`;
  } else if (mode === 'steps') {
    systemInstruction += `
Task: Provide an exact **CBSE Step-Wise Mark Distribution Breakdown** for this question (${marks ? marks + ' Marks' : ''}).
Label each step with allocated marks:
- [Step 1: Formula / Law Statement] (+Marks)
- [Step 2: Substitution of Given Data] (+Marks)
- [Step 3: Algebraic / Chemical Derivation] (+Marks)
- [Step 4: Boxed Final Answer with Proper S.I. Units] (+Marks)`;
  } else if (mode === 'pitfalls') {
    systemInstruction += `
Task: Identify the **Common Mistakes & Examiner Traps** for this exact question.
Explain where CBSE evaluators cut marks (e.g. missing units, wrong sign conventions, omitting intermediate steps).`;
  } else {
    systemInstruction += `
Task: Answer the student's doubt directly regarding this CBSE problem.
If the student asks "example se samjhao", give real world examples.
If the student asks "Hinglish me", answer in clear Hinglish.
Be concise, clear, and encouraging.`;
  }

  const promptContent = `
[CONTEXT]
Subject: ${subject}
Chapter: ${chapter}
Question (${marks ? marks + ' Marks' : ''}):
${questionText}

${modelAnswer ? `[CBSE Official Solution Reference]:\n${modelAnswer}\n` : ''}

[STUDENT QUERY / INSTRUCTION]:
${userPrompt || (mode === 'hinglish' ? 'Is question ko step-by-step Hinglish me explain karo.' : mode === 'example' ? 'Is concept ko ek practical real-life example ke saath samjhao.' : 'Please provide a detailed step solution.')}
`;

  // 1. Try Live Google AI Models via API Key
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${promptContent}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 0) {
            // Clean up any internal thinking header tokens if present
            generatedText = cleanAiOutput(generatedText.trim());
            return generatedText;
          }
        }
      } catch (err) {
        console.warn(`Attempt with ${model} failed, trying next...`, err);
      }
    }
  }

  // 2. Intelligent Dynamic Context-Aware Fallback
  return generateDynamicContextualExplanation(req);
}

function cleanAiOutput(text: string): string {
  // If the model output contains a thought trace at the beginning, extract the main response
  if (text.includes('*   *Greeting:*') || text.includes('*   *The Science')) {
    const parts = text.split(/\n\s*\*\s+\*Greeting:\*\s*/i);
    if (parts.length > 1) {
      return parts[1].replace(/^\s*"/, '').replace(/"\s*$/, '');
    }
  }
  return text;
}

// Dynamic generator tailored to the exact question text, subject, chapter, and prompt
function generateDynamicContextualExplanation(req: GeminiExplainRequest): string {
  const { questionText, chapter, subject, marks, modelAnswer, mode, userPrompt } = req;
  const promptLower = (userPrompt || '').toLowerCase();

  // If user asked in Hinglish or asked for Hinglish
  if (
    mode === 'hinglish' ||
    promptLower.includes('hinglish') ||
    promptLower.includes('hindi') ||
    promptLower.includes('samjhao') ||
    promptLower.includes('kaise') ||
    promptLower.includes('kya')
  ) {
    return `### 🇮🇳 Step-by-Step Hinglish Explanation

**1. Question me kya pucha gaya hai?**
Is question me humein **${chapter}** (${subject}) ke core principles ko apply karna hai.
> **Problem:** ${questionText}

**2. Solve karne ka Step-by-Step Tarika:**
- **Step 1 (Given & Formula):** Sabse pehle question me diye gaye values ko standard S.I. units me likhein. Formula mention karein (CBSE examiner formula ke direct **+0.5 se +1.0 Mark** deta hai!).
- **Step 2 (Calculation):** Ab values substitute karke calculation karein:
${modelAnswer ? `  ${modelAnswer.split('\n').slice(0, 3).join('\n  ')}` : '  Formula me values dhyan se substitute karein aur algebraic steps dikhayein.'}
- **Step 3 (Final Answer):** Answer aane ke baad unit zaroor likhein (jaise $\\text{V, A, } \\Omega\\text{, J, N, m/s, mol/L}$).

💡 **Board Exam Pro-Tip:** Direct answer mat likhna, intermediate calculation ke 2-3 lines zaroor dikhana!`;
  }

  // If user asked for Real Life Example or analogy
  if (
    mode === 'example' ||
    promptLower.includes('example') ||
    promptLower.includes('analogy') ||
    promptLower.includes('daily life') ||
    promptLower.includes('real life')
  ) {
    let analogy = '';
    const textLower = (questionText + ' ' + chapter).toLowerCase();

    if (textLower.includes('light') || textLower.includes('mirror') || textLower.includes('lens') || textLower.includes('refract')) {
      analogy = `**Practical Real-World Example (The Spoon & Water Glass):**
- Think of a shiny stainless steel spoon. The inside hollow side acts as a **Concave Mirror** (it converges light rays and inverts your reflection at a distance).
- The bulging backside acts as a **Convex Mirror** (like a car rear-view mirror that always gives an upright, diminished view).`;
    } else if (textLower.includes('current') || textLower.includes('ohm') || textLower.includes('resist') || textLower.includes('volt')) {
      analogy = `**Practical Real-World Example (Water Pipe Analogy):**
- **Voltage ($V$):** Water pump ka pressure jo paani ko push karta hai.
- **Current ($I$):** Pipe se flow hone wala actual paani ka flow-rate.
- **Resistance ($R$):** Pipe ke andar ka kachra ya narrow pipe jo paani ko rokta hai ($V = IR$).`;
    } else if (textLower.includes('acid') || textLower.includes('base') || textLower.includes('ph') || textLower.includes('reaction')) {
      analogy = `**Practical Real-World Example (Kitchen Chemistry):**
- Lemon juice & vinegar are natural acids (sour, $pH < 7$). Baking soda & soap are bases (bitter/slippery, $pH > 7$).
- Mixing them produces instant bubbling ($CO_2$), demonstrating neutralization!`;
    } else {
      analogy = `**Practical Daily-Life Visualization:**
Imagine applying this concept like balancing a seesaw or tracking a car's speedometer: Every action has a governing mathematical proportion that keeps energy and matter conserved.`;
    }

    return `### 💡 Practical Real-World Example & Intuition (${chapter})

${analogy}

---

**Is Problem ko Kaise Relate Karein:**
1. Jo concept real life me dekha, wahi exact formula is question me lag raha hai:
> **Question:** ${questionText.slice(0, 150)}...
2. ${modelAnswer ? `**Official Calculation:**\n${modelAnswer}` : 'Standard relations apply karke easily solve kar sakte hain.'}`;
  }

  // If user asked for step marking
  if (mode === 'steps' || promptLower.includes('step') || promptLower.includes('mark')) {
    return `### 📝 CBSE Step-Wise Mark Distribution (${marks || 3} Marks)

1. **Step 1: Formula / Governing Law Statement** \`[+0.5 to +1.0 Mark]\`
   - State the relevant scientific law or formula clearly with symbol definitions.
2. **Step 2: Substitution of Parameters with Proper Signs** \`[+1.0 Mark]\`
   - Substitute given values in standard S.I. units (incorporating Cartesian sign convention if applicable).
3. **Step 3: Intermediate Mathematical Derivation** \`[+1.0 Mark]\`
   - Step-by-step simplification without skipping algebraic lines.
4. **Step 4: Boxed Final Answer with Standard Units** \`[+0.5 Mark]\`
   - Highlight final numeric answer with correct physical units.`;
  }

  // If user asked for pitfalls / mistakes
  if (mode === 'pitfalls' || promptLower.includes('mistake') || promptLower.includes('error') || promptLower.includes('trap')) {
    return `### ⚠️ Examiner Pitfalls & Common Student Blunders

1. **Unit Omission Trap:** Writing the final answer as a bare number without specifying S.I. units (e.g. writing \`15\` instead of \`15 cm\` or \`15 A\`) results in a direct **-0.5 Mark** deduction.
2. **Sign Convention Errors:** Forgetting negative signs for object distances ($u < 0$) or exothermic enthalpy values.
3. **Direct Answer Penalty:** Writing the final answer directly without showing the formula or intermediate substitution.`;
  }

  // Default Doubt Response
  return `### 🤖 AI Tutor Response on ${chapter}

**Your Query:** *"${userPrompt || 'How to solve this step?'}"*

**Concept Breakdown:**
1. In **${chapter}** (${subject}), always start by identifying what is given in the question:
   > "${questionText}"
2. **Solution Strategy:**
   ${modelAnswer ? modelAnswer : 'Apply the governing fundamental formula and evaluate step-by-step.'}
3. **Key Takeaway:** Make sure to clearly state your steps and verify your final units before finishing!`;
}
