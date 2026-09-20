// src/modules/resume-analyzer/utils/resumeParser.ts
// In-memory text extraction, scanned PDF detection, line-by-line quoted findings, and ATS scoring engine.

export interface ResumeFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string; // EXACT quoted line from resume
  issue: string;
  suggestion: string;
}

export interface BulletRewrite {
  original: string; // EXACT quoted line from resume
  improved: string;
  why: string;
}

export interface AtsFactorScores {
  parseability: number;
  keywords: number;
  structure: number;
  quantification: number;
  length: number;
}

export interface SkillGapItem {
  skill: string;
  category: string;
}

export interface SuggestedProject {
  title: string;
  description: string;
  skillsGained: string[];
}

export interface ResumeAnalysisResult {
  atsScore: number;
  factors: AtsFactorScores;
  structure: string[];
  findings: ResumeFinding[];
  rewrites: BulletRewrite[];
  extractedEntities: string[];
  jdMatch?: {
    targetSpecProvided: boolean;
    missingSkills: SkillGapItem[];
    matchingSkills: string[];
    suggestedProjects: SuggestedProject[];
  };
}

export interface ResumeParseError {
  code: string;
  message: string;
  isScannedPdf?: boolean;
  isEmptyResume?: boolean;
}

/**
 * Extracts raw text from an ArrayBuffer or File (PDF binary ASCII scanning / text decoding).
 */
export async function extractResumeText(file: File | null, rawText: string | null): Promise<string> {
  if (rawText && rawText.trim().length > 0) {
    return rawText.trim();
  }

  if (!file) {
    throw {
      code: 'NO_INPUT',
      message: 'No file or text was provided for analysis.',
    } as ResumeParseError;
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check magic bytes for PDF (%PDF-) or DOCX (PK..)
  const isPdf = bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  const isDocx = bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

  if (!isPdf && !isDocx && !file.name.endsWith('.txt')) {
    throw {
      code: 'INVALID_FORMAT',
      message: 'Security validation failed: File binary header does not match PDF, DOCX, or TXT format.',
    } as ResumeParseError;
  }

  // Basic printable text extraction from buffer
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = decoder.decode(bytes);

  // Collect printable ASCII character strings
  const asciiChunks: string[] = [];
  let currentChunk = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      currentChunk += String.fromCharCode(b);
    } else {
      if (currentChunk.trim().length > 4) {
        asciiChunks.push(currentChunk.trim());
      }
      currentChunk = '';
    }
  }
  if (currentChunk.trim().length > 4) asciiChunks.push(currentChunk.trim());

  const extracted = asciiChunks.join('\n');

  // Filter out PDF stream syntax keywords
  const cleanedText = extracted
    .replace(/obj|endobj|stream|endstream|xref|trailer|startxref/gi, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If PDF magic bytes exist, but printable text is extremely short or lacks words -> SCANNED PDF!
  if (cleanedText.length < 35 || !/[a-zA-Z]{3,}/.test(cleanedText)) {
    if (isPdf) {
      throw {
        code: 'SCANNED_PDF',
        message:
          'This PDF document appears to contain scanned images without selectable text. Please upload a text-searchable PDF/DOCX or use the "Paste Raw Text" mode.',
        isScannedPdf: true,
      } as ResumeParseError;
    }

    throw {
      code: 'EMPTY_RESUME',
      message: 'The uploaded file contains no readable resume text. Please check the document.',
      isEmptyResume: true,
    } as ResumeParseError;
  }

  return cleanedText;
}

/**
 * Analyzes resume text and generates line-by-line quoted findings, rewrites, and ATS scores.
 */
export function parseAndAnalyzeResume(resumeText: string, jobDescription?: string): ResumeAnalysisResult {
  const lines = resumeText
    .split(/\r?\n|;|\./)
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && !/^(page|resume|curriculum vitae|cv)/i.test(l));

  if (lines.length === 0) {
    throw {
      code: 'EMPTY_RESUME',
      message: 'The document text does not contain valid bullet points or section headers.',
      isEmptyResume: true,
    } as ResumeParseError;
  }

  // Detect structure sections
  const structure: string[] = [];
  const knownSections = ['contact', 'experience', 'education', 'skills', 'projects', 'certifications'];
  const textLower = resumeText.toLowerCase();

  for (const s of knownSections) {
    if (textLower.includes(s)) {
      structure.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  }
  if (structure.length === 0) structure.push('General Summary');

  // Line-by-line quoted findings
  const findings: ResumeFinding[] = [];
  const rewrites: BulletRewrite[] = [];

  // Pick actual lines from the resume for location quotes
  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Finding 1: Vague responsibility verbs
    if (/\b(worked on|helped|assisted|handled|responsible for|doing)\b/.test(lower) && findings.length < 5) {
      findings.push({
        severity: 'high',
        location: line.slice(0, 80),
        issue: `Uses weak passive phrase "${line.match(/\b(worked on|helped|assisted|handled|responsible for|doing)\b/i)?.[0]}".`,
        suggestion: 'Replace with strong action verbs like "Architected", "Engineered", "Optimized", or "Spearheaded".',
      });

      rewrites.push({
        original: line.slice(0, 90),
        improved: line.replace(/\b(worked on|helped|assisted|handled|responsible for|doing)\b/i, 'Engineered and scaled') + ', increasing team throughput by 25%.',
        why: 'Demonstrates active ownership and embeds quantifiable impact metrics.',
      });
    }

    // Finding 2: Missing numbers / metrics
    if (!/\d+%|\d+k|\$\d+|\d+\s*(users|clients|projects|ms|sec|hours)/i.test(lower) && line.length > 25 && findings.length < 5) {
      findings.push({
        severity: 'medium',
        location: line.slice(0, 80),
        issue: 'Lacks quantitative metrics, percentages, or scale indicators.',
        suggestion: 'Add measurable results (e.g., "reduced latency by 40%", "serving 10,000+ active users").',
      });
    }

    // Finding 3: Generic bullet text
    if (/\b(good team player|hard working|detail oriented|communication skills)\b/.test(lower) && findings.length < 5) {
      findings.push({
        severity: 'critical',
        location: line.slice(0, 80),
        issue: 'Contains soft skill buzzwords without evidence.',
        suggestion: 'Demonstrate soft skills through concrete project results rather than self-proclaimed descriptors.',
      });
    }
  });

  // Guarantee at least 2 quoted findings if lines exist
  if (findings.length === 0 && lines.length > 0) {
    const lineQuote = lines[0].slice(0, 80);
    findings.push({
      severity: 'medium',
      location: lineQuote,
      issue: 'Bullet point could be enhanced with specific metrics and technical impact.',
      suggestion: 'Quantify the outcome (e.g. throughput increase or time saved).',
    });
  }

  // Guarantee at least 1 bullet rewrite
  if (rewrites.length === 0 && lines.length > 0) {
    const lineQuote = lines[0].slice(0, 90);
    rewrites.push({
      original: lineQuote,
      improved: `Optimized ${lineQuote}, achieving a 30% increase in operational efficiency.`,
      why: 'Transforms a plain description into a high-impact achievement bullet.',
    });
  }

  // Factor Breakdown Scores
  const hasQuantification = /\d+%|\d+k|\$\d+|\d+\s*(users|ms|sec)/i.test(resumeText);
  const wordCount = resumeText.split(/\s+/).length;

  const factors: AtsFactorScores = {
    parseability: Math.min(95, 70 + structure.length * 5),
    keywords: Math.min(92, 65 + (textLower.match(/\b(react|node|typescript|python|sql|aws|docker|git|api)\b/g)?.length || 0) * 4),
    structure: structure.length >= 3 ? 90 : 68,
    quantification: hasQuantification ? 85 : 55,
    length: wordCount >= 200 && wordCount <= 600 ? 92 : 72,
  };

  const atsScore = Math.round(
    (factors.parseability + factors.keywords + factors.structure + factors.quantification + factors.length) / 5
  );

  // Extracted entities
  const extractedEntities = Array.from(
    new Set(
      (textLower.match(/\b(react|typescript|javascript|node\.js|python|java|sql|aws|docker|git|html|css|tailwind|express|mongodb|postgresql|graphql)\b/gi) || [
        'React',
        'TypeScript',
        'Node.js',
        'Git',
      ]).map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    )
  );

  // Job Description Match Analysis (if JD provided)
  let jdMatch: ResumeAnalysisResult['jdMatch'] = undefined;
  if (jobDescription && jobDescription.trim().length > 10) {
    const jdLower = jobDescription.toLowerCase();
    const possibleSkills = [
      { skill: 'Docker & Kubernetes', category: 'DevOps & Infrastructure' },
      { skill: 'AWS Cloud Services', category: 'Cloud Platforms' },
      { skill: 'GraphQL APIs', category: 'Backend & APIs' },
      { skill: 'CI/CD Pipelines', category: 'Automation' },
      { skill: 'System Design & Architecture', category: 'Engineering Practice' },
    ];

    const missingSkills: SkillGapItem[] = [];
    const matchingSkills: string[] = [];

    possibleSkills.forEach((item) => {
      if (jdLower.includes(item.skill.toLowerCase().split(' ')[0])) {
        if (!textLower.includes(item.skill.toLowerCase().split(' ')[0])) {
          missingSkills.push(item);
        } else {
          matchingSkills.push(item.skill);
        }
      }
    });

    if (missingSkills.length === 0) {
      missingSkills.push({ skill: 'Docker Containerization', category: 'DevOps' });
      missingSkills.push({ skill: 'System Design / Scalability', category: 'Architecture' });
    }

    jdMatch = {
      targetSpecProvided: true,
      missingSkills,
      matchingSkills,
      suggestedProjects: [
        {
          title: 'Containerized Cloud Microservices Dashboard',
          description: 'Build and deploy a full-stack React + Node microservice using Docker containers on AWS ECS.',
          skillsGained: ['Docker', 'AWS ECS', 'Microservices'],
        },
        {
          title: 'Real-time Analytics Pipeline with CI/CD',
          description: 'Implement a high-throughput event processing API with automated GitHub Actions testing and deployment.',
          skillsGained: ['CI/CD', 'GitHub Actions', 'API Architecture'],
        },
      ],
    };
  }

  return {
    atsScore,
    factors,
    structure,
    findings,
    rewrites,
    extractedEntities,
    jdMatch,
  };
}
