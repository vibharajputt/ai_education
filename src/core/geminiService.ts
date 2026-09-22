// src/core/geminiService.ts
// Client-side Gemini integration — proxies through /api/gemini-explain so
// the API key is NEVER exposed in the browser bundle (AGENTS.md: no secrets
// in client code). import.meta.env is not used here.

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

export async function generateGeminiSolution(
  req: GeminiExplainRequest
): Promise<string> {
  // 1. Try the server-side Gemini proxy — key stays on the server
  try {
    const response = await fetch('/api/gemini-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (response.ok) {
      const data = await response.json() as { text?: string };
      if (data.text && data.text.trim().length > 0) {
        return data.text;
      }
    }
    // Non-2xx or empty body → fall through to offline fallback
    console.warn('[geminiService] Server returned non-OK or empty response, using fallback.');
  } catch (err) {
    // Network failure (server offline) → fall through to offline fallback
    console.warn('[geminiService] Server unreachable, using fallback.', err);
  }

  // 2. Offline dynamic fallback — renders without any API key
  return generateDynamicContextualExplanation(req);
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
- **Step 2 (Calculation):** Ab values substitute karke calculation karein:\n${modelAnswer ? `  ${modelAnswer.split('\n').slice(0, 3).join('\n  ')}` : '  Formula me values dhyan se substitute karein aur algebraic steps dikhayein.'}
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
