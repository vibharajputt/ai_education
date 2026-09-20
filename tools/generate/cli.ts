import { LLMGateway } from '../llm/gateway.js';
import { generateExplanations } from './gen_explain.js';
import { generateSets } from './gen_set.js';
import { generateArtifactAnalyses } from './gen_analyze.js';
import { generateStudyPlans } from './gen_plan.js';
import { generateProfileSummaries } from './gen_profile.js';

function printHelp() {
  console.log(`
Offline Content Generation CLI
==============================
Usage: pnpm gen <target> [--force] [--limit n]

Available Targets:
  explain   : Generate solutions, step-by-step explanations, and marking schemes
  set       : Generate balanced worksheets and question sets
  analyze   : Generate artifact analyses (resumes, syllabi, question papers)
  plan      : Generate personalized study plans and prep schedules
  profile   : Generate SWOT analyses and progress profile summaries
  all       : Run all content generators in sequence

Options:
  --force   : Bypass disk cache and force re-generation
  --limit n : Limit maximum number of items generated per target
  --help    : Show this help message and exit

Examples:
  pnpm gen explain --limit 2
  pnpm gen all --force
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const target = args[0].toLowerCase();

  const force = args.includes('--force');
  let limit: number | undefined;

  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }

  const gateway = new LLMGateway();

  // Register fallback mock handlers if no API keys are present in process.env
  gateway.registerMockHandler('default', async (prompt: string) => {
    // Generate deterministic mock JSON based on keywords in prompt
    if (prompt.includes('Class Level') || prompt.includes('QUESTION')) {
      return JSON.stringify({
        body: 'This is a mock step-by-step solution for the question.',
        steps: [
          { label: 'Step 1: Formula', body: 'Use relevant physics equation.' },
          { label: 'Step 2: Calculation', body: 'Substitute values and compute.' },
        ],
        keyPoints: ['Check units', 'State final answer clearly'],
        markingBreakdown: [{ point: 'Correct formula and working', marks: 3 }],
        diagramNote: 'Diagram showing ray path optional.',
        commonMistakes: ['Forgetting to convert units to SI'],
        formulasUsed: ['v = u + at'],
        insufficient_context: false,
      });
    }

    if (prompt.includes('Target Constraints')) {
      return JSON.stringify({
        orderedItemIds: ['q-phy-01', 'q-phy-02', 'q-phy-03'],
        rationale: 'Balanced practice covering speed, acceleration, and momentum.',
        coverageReport: {
          totalCount: 3,
          totalMarks: 10,
          difficultyBreakdown: { easy: 1, medium: 1, hard: 1 },
          chapterBreakdown: { Motion: 2, 'Laws of Motion': 1 },
        },
      });
    }

    if (prompt.includes('ARTIFACT TEXT')) {
      return JSON.stringify({
        structure: ['Contact Info', 'Experience', 'Projects', 'Skills'],
        findings: [
          {
            severity: 'high',
            location: 'Helped team fix bugs.',
            issue: 'Vague responsibility description without metrics.',
            suggestion: 'Specify the types of bugs resolved and performance impact achieved.',
          },
        ],
        scores: { impact: 65, clarity: 70, technical: 60 },
        extractedEntities: ['JavaScript', 'HTML', 'CSS', 'Acme Corp'],
        rewrites: [
          {
            original: 'Helped team fix bugs.',
            improved: 'Resolved 20+ critical frontend bugs, reducing user drop-off by 15%.',
            why: 'Adds concrete metrics and business impact.',
          },
        ],
      });
    }

    if (prompt.includes('Study Goal')) {
      return JSON.stringify({
        days: [
          {
            date: 'Day 1',
            blocks: [
              { topic: 'Electrostatics', minutes: 120, activity: 'Concept review', itemIds: [] },
              { topic: 'Current Electricity', minutes: 120, activity: 'Problem solving', itemIds: [] },
            ],
          },
          {
            date: 'Day 2',
            blocks: [
              { topic: 'Magnetic Effects of Current', minutes: 120, activity: 'Derivations', itemIds: [] },
              { topic: 'Optics', minutes: 120, activity: 'Ray diagrams practice', itemIds: [] },
            ],
          },
        ],
        assumptions: ['4 hours of dedicated study per day'],
        riskNotes: ['Complex optics ray diagrams require extra visual revision'],
        dropped: [],
      });
    }

    if (prompt.includes('PRE-COMPUTED STATISTICS')) {
      return JSON.stringify({
        summary: 'Student demonstrates exceptional strength in Mathematics (90%) but needs targeted practice in Chemistry (70%).',
        strengths: ['Mathematics problem-solving accuracy (90%)', '12-day active study streak'],
        weaknesses: ['Chemistry conceptual accuracy (70%)'],
        opportunities: ['High leverage growth in Organic Chemistry mechanisms'],
        threats: ['Time loss on chemistry calculations'],
        nextActions: ['Complete 2 focused Chemistry worksheets this week'],
      });
    }

    return JSON.stringify({ message: 'Default mock response' });
  });

  const options = { force, limit };

  console.log(`Starting generation target: [${target}] (force=${force}, limit=${limit ?? 'unlimited'})\n`);

  switch (target) {
    case 'explain':
    case 'explanations':
      await generateExplanations(gateway, options);
      break;
    case 'set':
    case 'sets':
    case 'worksheets':
      await generateSets(gateway, options);
      break;
    case 'analyze':
    case 'artifact':
    case 'artifact_analyses':
      await generateArtifactAnalyses(gateway, options);
      break;
    case 'plan':
    case 'plans':
    case 'study_plans':
      await generateStudyPlans(gateway, options);
      break;
    case 'profile':
    case 'profiles':
    case 'profile_summaries':
      await generateProfileSummaries(gateway, options);
      break;
    case 'all':
      await generateExplanations(gateway, options);
      await generateSets(gateway, options);
      await generateArtifactAnalyses(gateway, options);
      await generateStudyPlans(gateway, options);
      await generateProfileSummaries(gateway, options);
      break;
    default:
      console.error(`Unknown target: "${target}".`);
      printHelp();
      process.exit(1);
  }

  // Print Telemetry and Coverage Report
  const report = gateway.getReport();
  console.log('\n========================================');
  console.log('      CONTENT GENERATION REPORT        ');
  console.log('========================================');
  console.log(`Total LLM Calls:   ${report.calls}`);
  console.log(`Cache Hits:       ${report.cacheHits}`);
  console.log(`Provider Failures: ${report.failures}`);
  console.log(`Wall Time:         ${(report.wallTimeMs / 1000).toFixed(2)}s`);
  console.log('Provider Mix:');
  for (const [provider, count] of Object.entries(report.providerMix)) {
    if (count > 0) {
      console.log(`  - ${provider}: ${count}`);
    }
  }
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
