// src/modules/career-path/services/roadmapData.ts

export type DomainId =
  | 'swe-fullstack'
  | 'ai-ml-data'
  | 'devops-cloud'
  | 'core-ece'
  | 'mech-auto'
  | 'civil-infra'
  | 'product-pm'
  | 'gate-psu'
  | 'ui-ux-design';

export type AcademicBranch =
  | 'cse-it'
  | 'ece-eee'
  | 'mechanical'
  | 'civil'
  | 'biotech-chem'
  | 'bca-mca'
  | 'non-tech-other';

export type AcademicYear = '1st-year' | '2nd-year' | '3rd-year' | '4th-year' | 'graduated';

export type CareerGoalType =
  | 'tier1-faang'
  | 'growth-startups'
  | 'core-industry'
  | 'remote-global'
  | 'higher-studies'
  | 'govt-psu';

export interface MilestoneItem {
  id: string;
  title: string;
  duration: string;
  description: string;
  skills: string[];
  resources: { name: string; url?: string; type: 'Course' | 'Doc' | 'YouTube' | 'Book' | 'Practice' }[];
  proTip: string;
  deliverable: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  tagline: string;
  durationEstimate: string;
  gradient: string;
  badge: string;
  milestones: MilestoneItem[];
}

export interface CapstoneProject {
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Recruiter-Magnet';
  description: string;
  techStack: string[];
  keyFeatures: string[];
  resumeBulletExample: string;
}

export interface RoleRoadmap {
  id: string;
  domainId: DomainId;
  title: string;
  tagline: string;
  salaryBands: {
    entry: string;
    mid: string;
    senior: string;
  };
  popularCompanies: string[];
  marketDemand: 'Ultra High' | 'High' | 'Moderate' | 'Growing Exponentially';
  difficultyLevel: 'Beginner Friendly' | 'Moderate' | 'Challenging' | 'Intensive';
  estimatedMonths: number;
  phases: RoadmapPhase[];
  capstoneProjects: CapstoneProject[];
  certifications: { name: string; issuer: string; valueScore: number }[];
  keyTools: string[];
  pitfallsToAvoid: string[];
  nextModuleSuggestions: { title: string; route: string; desc: string }[];
}

export interface DomainOption {
  id: DomainId;
  title: string;
  subtitle: string;
  iconName: string;
  gradient: string;
  bgLight: string;
  recommendedFor: string[];
  defaultRole: string;
}

export const DOMAINS: DomainOption[] = [
  {
    id: 'swe-fullstack',
    title: 'Software & Cloud Engineering',
    subtitle: 'Full Stack, Backend Systems, Distributed Architecture, Frontend',
    iconName: 'Code',
    gradient: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
    recommendedFor: ['CSE/IT', 'BCA/MCA', 'ECE with Coding Interest', 'Self-Taught'],
    defaultRole: 'Full Stack & Distributed Systems Engineer',
  },
  {
    id: 'ai-ml-data',
    title: 'AI, Data Science & GenAI',
    subtitle: 'Machine Learning, Deep Learning, LLMs, NLP, Data Engineering & Analytics',
    iconName: 'Brain',
    gradient: 'from-purple-600 to-pink-600',
    bgLight: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
    recommendedFor: ['CSE/Data Science', 'Math/Stats', 'ECE/EE', 'AI Enthusiasts'],
    defaultRole: 'Machine Learning & Generative AI Engineer',
  },
  {
    id: 'devops-cloud',
    title: 'DevOps, Cloud SRE & Security',
    subtitle: 'AWS/GCP, Kubernetes, CI/CD, Infrastructure as Code, CyberSec',
    iconName: 'Cloud',
    gradient: 'from-teal-600 to-cyan-600',
    bgLight: 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300',
    recommendedFor: ['IT/Networks', 'SysAdmins', 'Cloud Developers', 'DevOps Aspirants'],
    defaultRole: 'Cloud DevOps & Site Reliability Engineer',
  },
  {
    id: 'core-ece',
    title: 'Core ECE, Embedded & VLSI',
    subtitle: 'Microcontrollers, ARM/RISC-V, RTL/Verilog, IoT, Semiconductor & Firmware',
    iconName: 'Cpu',
    gradient: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    recommendedFor: ['ECE', 'EEE', 'Instrumentation', 'Hardware Tinkers'],
    defaultRole: 'Embedded Firmware & VLSI Systems Engineer',
  },
  {
    id: 'mech-auto',
    title: 'Mechanical, EV & Robotics',
    subtitle: 'CAD/CAM/CAE, EV Powertrain, Thermal/CFD, Industrial Robotics Automation',
    iconName: 'Wrench',
    gradient: 'from-rose-600 to-red-600',
    bgLight: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
    recommendedFor: ['Mechanical', 'Automobile', 'Mechatronics', 'Production'],
    defaultRole: 'Robotics & EV Design Engineer',
  },
  {
    id: 'civil-infra',
    title: 'Civil & Smart Infrastructure',
    subtitle: 'Structural Design, BIM (Revit), GIS, Transportation & Construction Tech',
    iconName: 'Building2',
    gradient: 'from-emerald-600 to-green-600',
    bgLight: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    recommendedFor: ['Civil', 'Architecture', 'Urban Planning', 'Construction'],
    defaultRole: 'BIM & Structural Design Engineer',
  },
  {
    id: 'product-pm',
    title: 'Product Management & Consulting',
    subtitle: 'Tech PM, Business Analytics, Scrum, Product Strategy, Growth Consulting',
    iconName: 'Briefcase',
    gradient: 'from-violet-600 to-indigo-600',
    bgLight: 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300',
    recommendedFor: ['All Branches', 'MBA Aspirants', 'Tech Leads', 'Product Enthusiasts'],
    defaultRole: 'Associate Product Manager (APM)',
  },
  {
    id: 'gate-psu',
    title: 'GATE, PSU & Higher Studies',
    subtitle: 'PSU Recruitment (IOCL, NTPC, ONGC, ISRO), IIT M.Tech & MS Abroad',
    iconName: 'GraduationCap',
    gradient: 'from-sky-600 to-blue-700',
    bgLight: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300',
    recommendedFor: ['All Engineering Branches', 'Govt/Research Aspirants'],
    defaultRole: 'GATE Ranker & PSU Officer Track',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design & Creative Tech',
    subtitle: 'Figma, Design Systems, UX Research, Interaction Design & Prototyping',
    iconName: 'Palette',
    gradient: 'from-fuchsia-600 to-pink-600',
    bgLight: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300',
    recommendedFor: ['Creative Thinkers', 'Frontend Devs', 'All Branches'],
    defaultRole: 'Product UI/UX & Interaction Designer',
  },
];

export const BRANCHES = [
  { id: 'cse-it', label: 'Computer Science / IT / AI / DS' },
  { id: 'ece-eee', label: 'Electronics & Communication / EEE' },
  { id: 'mechanical', label: 'Mechanical & Automobile Engg' },
  { id: 'civil', label: 'Civil & Environmental Engg' },
  { id: 'biotech-chem', label: 'Chemical / Biotech / Material' },
  { id: 'bca-mca', label: 'BCA / MCA / B.Sc Computer Science' },
  { id: 'non-tech-other', label: 'Other Degree / Non-Tech to Tech Career Pivot' },
];

export const YEARS = [
  { id: '1st-year', label: '1st Year (Freshman - Foundation Phase)' },
  { id: '2nd-year', label: '2nd Year (Sophomore - Core Skill Building)' },
  { id: '3rd-year', label: '3rd Year (Junior - Projects, Internships & DSA)' },
  { id: '4th-year', label: '4th Year (Senior - Placement Drives & Off-Campus)' },
  { id: 'graduated', label: 'Graduated / Working Professional Pivot' },
];

export const GOALS = [
  { id: 'tier1-faang', label: 'Top Tier Product Companies (FAANG / Tier-1 MNCs, 18-50 LPA)', icon: 'Sparkles' },
  { id: 'growth-startups', label: 'High-Growth Tech Startups (Fast Learning, Stock Options, 10-25 LPA)', icon: 'Rocket' },
  { id: 'core-industry', label: 'Core Engineering Giants (L&T, Tata, Texas Instruments, Intel)', icon: 'Factory' },
  { id: 'remote-global', label: 'Remote Global Roles (US/Europe Clients, Dollar Pay)', icon: 'Globe' },
  { id: 'higher-studies', label: 'Higher Studies & Research (IIT M.Tech, MS Abroad, PhD)', icon: 'BookOpen' },
  { id: 'govt-psu', label: 'Govt Officer / PSU Recruitment (ISRO, BARC, IOCL, NTPC)', icon: 'Award' },
];

// --- Comprehensive Roadmaps Database ---

export const ROADMAP_DATABASE: Record<DomainId, RoleRoadmap> = {
  'swe-fullstack': {
    id: 'swe-fullstack',
    domainId: 'swe-fullstack',
    title: 'Full Stack & Distributed Cloud Systems Engineer',
    tagline: 'Master modern frontend, scalable backend APIs, distributed databases, and cloud deployment.',
    salaryBands: {
      entry: '₹8 - 18 LPA',
      mid: '₹20 - 38 LPA',
      senior: '₹40 - 75+ LPA',
    },
    popularCompanies: ['Google', 'Microsoft', 'Uber', 'Swiggy', 'Zomato', 'Amazon', 'Atlassian', 'Stripe'],
    marketDemand: 'Ultra High',
    difficultyLevel: 'Moderate',
    estimatedMonths: 9,
    keyTools: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'AWS', 'Kafka', 'GraphQL'],
    pitfallsToAvoid: [
      'Tutorial Hell: Watching hours of video tutorials without building end-to-end deployed projects.',
      'Ignoring DSA: Full Stack alone won\'t clear Tier-1 rounds without strong problem-solving skills.',
      'Shallow DB knowledge: Sticking only to basic MongoDB and not mastering SQL, indexing, and transactions.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Foundation & Core Programming',
        tagline: 'Strong command over programming language, Data Structures & Git workflow.',
        durationEstimate: 'Weeks 1 - 6',
        gradient: 'from-blue-600 to-cyan-600',
        badge: 'Core Foundation',
        milestones: [
          {
            id: 'fs-1',
            title: 'Master Modern JavaScript & TypeScript',
            duration: '2 Weeks',
            description: 'Deep dive into ES6+, closures, async/await, event loop, TypeScript static typing, generics, and strict mode.',
            skills: ['JavaScript ESNext', 'TypeScript', 'Async Programming', 'OOP & Functional Patterns'],
            resources: [
              { name: 'TypeScript Handbook (Official)', type: 'Doc' },
              { name: 'JavaScript.info Complete Guide', type: 'Doc' },
              { name: 'Total TypeScript by Matt Pocock', type: 'Course' },
            ],
            proTip: 'Configure tsconfig with "strict": true right from day one to avoid bad untyped habits.',
            deliverable: 'Build a CLI utility in pure TypeScript and publish to npm.',
          },
          {
            id: 'fs-2',
            title: 'Data Structures & Algorithmic Problem Solving',
            duration: '4 Weeks',
            description: 'Arrays, HashMaps, Two Pointers, Sliding Window, Linked Lists, Trees, Graphs, and DP foundations in LeetCode.',
            skills: ['DSA', 'Time/Space Complexity', 'Binary Search', 'Recursion & Backtracking'],
            resources: [
              { name: 'NeetCode 150 Roadmap', type: 'Practice' },
              { name: 'Striver SDE Sheet (TakeUForward)', type: 'Practice' },
            ],
            proTip: 'Solve at least 2 LeetCode Mediums daily. Focus on identifying problem patterns, not memorizing code.',
            deliverable: 'Complete 75 curated DSA problems across all standard data structures.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Modern Frontend & Reactive UI Systems',
        tagline: 'Build ultra-responsive, accessible, and fast web client applications.',
        durationEstimate: 'Weeks 7 - 14',
        gradient: 'from-indigo-600 to-purple-600',
        badge: 'Frontend Mastery',
        milestones: [
          {
            id: 'fs-3',
            title: 'React 18+, Component Architecture & State Management',
            duration: '4 Weeks',
            description: 'Hooks (useMemo, useCallback, useRef, custom hooks), Context API, Zustand/Redux Toolkit, React Query (TanStack Query) for server state.',
            skills: ['React.js', 'State Machines', 'Tailwind CSS', 'TanStack Query', 'Optimistic UI'],
            resources: [
              { name: 'React.dev Official Documentation', type: 'Doc' },
              { name: 'Epic React by Kent C. Dodds', type: 'Course' },
            ],
            proTip: 'Always separate server caching state (React Query) from client interaction state (Zustand).',
            deliverable: 'Interactive Kanban/Trello clone with drag-and-drop, persistent state, and optimistic updates.',
          },
          {
            id: 'fs-4',
            title: 'Next.js 14/15 App Router & Web Performance',
            duration: '3 Weeks',
            description: 'Server Components (RSC), Streaming SSR, Route Handlers, SEO optimization, Core Web Vitals, and Edge caching.',
            skills: ['Next.js App Router', 'Server Actions', 'SSR/SSG', 'Web Vitals', 'Vercel Deployment'],
            resources: [
              { name: 'Next.js Learn Interactive Course', type: 'Course' },
              { name: 'Web.dev Performance Guides', type: 'Doc' },
            ],
            proTip: 'Understand when to use "use client" vs keeping components on the server for zero bundle footprint.',
            deliverable: 'A high-speed e-commerce catalog with search filters, dynamic metadata, and 98+ Lighthouse score.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Scalable Backend APIs & Distributed Data',
        tagline: 'Design resilient microservices, transactional databases, and caching layers.',
        durationEstimate: 'Weeks 15 - 24',
        gradient: 'from-teal-600 to-emerald-600',
        badge: 'Backend & Data',
        milestones: [
          {
            id: 'fs-5',
            title: 'Node.js/Express/Fastify, REST & GraphQL APIs',
            duration: '4 Weeks',
            description: 'Middleware pipelines, input validation (Zod), JWT/OAuth2 authentication, RBAC, rate limiting, and structured logging.',
            skills: ['Node.js', 'Express / Fastify', 'Zod Validation', 'OAuth2 / JWT', 'API Security'],
            resources: [
              { name: 'Node.js Design Patterns (Book)', type: 'Book' },
              { name: 'OWASP Top 10 API Security Checklist', type: 'Doc' },
            ],
            proTip: 'Never store plain text passwords (use Argon2/Bcrypt) and always sanitize user inputs against SQLi & XSS.',
            deliverable: 'Production-ready authentication and multi-tenant billing backend service with Swagger docs.',
          },
          {
            id: 'fs-6',
            title: 'Relational DBs (PostgreSQL), Indexing & Caching (Redis)',
            duration: '4 Weeks',
            description: 'PostgreSQL schema design, EXPLAIN ANALYZE query plans, B-Tree & GIN indexes, connection pooling (PgBouncer), Prisma/Drizzle ORM, and Redis distributed caching.',
            skills: ['PostgreSQL', 'Redis', 'Drizzle/Prisma ORM', 'Database Indexing', 'Transactions & ACID'],
            resources: [
              { name: 'Use The Index, Luke! (SQL Indexing Guide)', type: 'Doc' },
              { name: 'Hussein Nasser Database Engineering Playlist', type: 'YouTube' },
            ],
            proTip: 'Learn how to read EXPLAIN ANALYZE output before claiming you know SQL on your resume.',
            deliverable: 'High-throughput URL shortener with Redis analytics counter and PostgreSQL read replicas.',
          },
        ],
      },
      {
        phaseNumber: 4,
        title: 'Distributed Systems, Cloud & DevOps',
        tagline: 'Containerize, orchestrate, monitor, and deploy on modern cloud infrastructure.',
        durationEstimate: 'Weeks 25 - 32',
        gradient: 'from-amber-600 to-orange-600',
        badge: 'Production Systems',
        milestones: [
          {
            id: 'fs-7',
            title: 'Docker, CI/CD Pipelines & Cloud Deployment (AWS)',
            duration: '4 Weeks',
            description: 'Multi-stage Docker builds, GitHub Actions CI/CD workflows, AWS EC2, S3, RDS, ECS/EKS, CloudFront CDN, and NGINX reverse proxying.',
            skills: ['Docker', 'GitHub Actions', 'AWS (S3, RDS, EC2)', 'NGINX', 'SSL/TLS & DNS'],
            resources: [
              { name: 'Docker for Developers (Docker Docs)', type: 'Doc' },
              { name: 'AWS Cloud Practitioner & SAA Guides', type: 'Course' },
            ],
            proTip: 'Keep Docker images small (<100MB) using multi-stage builds and Alpine/Distroless images.',
            deliverable: 'Fully automated CI/CD pipeline deploying a containerized microservice on AWS with custom domain and SSL.',
          },
          {
            id: 'fs-8',
            title: 'System Design & High-Load Architecture',
            duration: '4 Weeks',
            description: 'Load balancing, Message Queues (Kafka / RabbitMQ), CDN caching strategies, Horizontal scaling, Cap Theorem, Rate limiting algorithms (Token Bucket).',
            skills: ['System Design', 'Kafka', 'Horizontal Scaling', 'CAP Theorem', 'Microservices'],
            resources: [
              { name: 'Designing Data-Intensive Applications (DDIA by Martin Kleppmann)', type: 'Book' },
              { name: 'System Design Primer (GitHub)', type: 'Doc' },
            ],
            proTip: 'Practice drawing block diagrams and calculating back-of-the-envelope estimations (QPS, storage, bandwidth).',
            deliverable: 'Design blueprint and prototype for a Real-Time Collaborative Workspace (like Notion/Figma multiplayer).',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'Real-Time Collaborative Document Suite (Multiplayer Canvas)',
        level: 'Recruiter-Magnet',
        description: 'Google Docs/Figma style collaborative workspace using WebSockets, CRDTs (Yjs), Redis pub/sub, PostgreSQL, and rich text editor.',
        techStack: ['Next.js 14', 'TypeScript', 'Node.js', 'Socket.io', 'Yjs CRDT', 'Redis', 'PostgreSQL', 'Docker'],
        keyFeatures: [
          'Sub-50ms latency conflict-free simultaneous editing across 100+ concurrent clients.',
          'Granular workspace RBAC permissions, live cursor presence, and version history snapshots.',
          'Export to PDF/Markdown and AI auto-summarizer integration.',
        ],
        resumeBulletExample: 'Engineered a real-time collaborative workspace utilizing CRDTs & Redis Pub/Sub, achieving <45ms synchronization latency for 500+ concurrent sessions.',
      },
      {
        title: 'High-Throughput E-Commerce & Flash-Sale Booking Engine',
        level: 'Advanced',
        description: 'Microservices architecture with distributed lock (Redlock), transactional outbox pattern, Stripe webhooks, and Kafka order queues.',
        techStack: ['Fastify', 'TypeScript', 'Kafka', 'PostgreSQL', 'Redis', 'Docker', 'AWS ECS'],
        keyFeatures: [
          'Handles 10,000+ simultaneous seat/item reservations without race conditions or overselling.',
          'Event-driven email/SMS notifications and asynchronous PDF invoice generation.',
          'Distributed tracing with OpenTelemetry and Prometheus/Grafana monitoring dashboard.',
        ],
        resumeBulletExample: 'Architected event-driven checkout system using Kafka & distributed Redis locks, eliminating race conditions under simulated 10k QPS flash-sale traffic.',
      },
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect – Associate (SAA-C03)', issuer: 'Amazon Web Services', valueScore: 95 },
      { name: 'Meta Full-Stack Professional Certificate', issuer: 'Meta / Coursera', valueScore: 82 },
      { name: 'MongoDB Certified Developer Associate', issuer: 'MongoDB Inc.', valueScore: 78 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Test your full-stack coding & system design round readiness.' },
      { title: 'ATS Resume Analyzer', route: '/college/resume-analyzer', desc: 'Scan your resume against Tier-1 SDE job descriptions.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Identify blindspots in DSA and System Design.' },
    ],
  },

  'ai-ml-data': {
    id: 'ai-ml-data',
    domainId: 'ai-ml-data',
    title: 'Machine Learning, Deep Learning & Generative AI Specialist',
    tagline: 'From foundational math and PyTorch to LLM fine-tuning, RAG pipelines, and production MLOps.',
    salaryBands: {
      entry: '₹10 - 22 LPA',
      mid: '₹24 - 45 LPA',
      senior: '₹50 - 90+ LPA',
    },
    popularCompanies: ['OpenAI', 'Google DeepMind', 'Microsoft AI', 'NVIDIA', 'Adobe', 'Fractal Analytics', 'Amazon AWS'],
    marketDemand: 'Growing Exponentially',
    difficultyLevel: 'Challenging',
    estimatedMonths: 10,
    keyTools: ['Python', 'PyTorch', 'Hugging Face', 'LangChain / LlamaIndex', 'vLLM', 'Docker', 'MLflow', 'FastAPI', 'Vector DBs (Qdrant/Pinecone)'],
    pitfallsToAvoid: [
      'Skipping Linear Algebra & Probability math foundations: leads to struggling with research papers and debugging gradient issues.',
      'Only doing basic Kaggle Titanic/Iris datasets without building deployed GenAI / RAG applications.',
      'Ignoring MLOps: 90% of ML models never make it to production without Docker, latency optimization, and CI/CD.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Mathematical Rigor & Python for Data Science',
        tagline: 'Linear Algebra, Multivariate Calculus, Probability, NumPy & Pandas.',
        durationEstimate: 'Weeks 1 - 6',
        gradient: 'from-purple-600 to-indigo-600',
        badge: 'Math & Foundations',
        milestones: [
          {
            id: 'ml-1',
            title: 'Applied Mathematics for Machine Learning',
            duration: '3 Weeks',
            description: 'Matrices, Eigenvalues, SVD, Gradients, Jacobians, Bayes Theorem, Probability Distributions, and Maximum Likelihood Estimation.',
            skills: ['Linear Algebra', 'Calculus', 'Probability & Statistics', 'Vector Calculus'],
            resources: [
              { name: '3Blue1Brown - Essence of Linear Algebra', type: 'YouTube' },
              { name: 'Mathematics for Machine Learning (Deisenroth)', type: 'Book' },
              { name: 'StatQuest with Josh Starmer', type: 'YouTube' },
            ],
            proTip: 'Understand why matrix multiplication dimensions matter and how gradient descent actually calculates weight updates.',
            deliverable: 'Implement Linear Regression and Logistic Regression from scratch in pure NumPy with gradient descent.',
          },
          {
            id: 'ml-2',
            title: 'Scientific Python Stack & Exploratory Data Analysis',
            duration: '3 Weeks',
            description: 'NumPy vectorized operations, Pandas DataFrames, Matplotlib/Seaborn visualizations, outlier treatment, and feature engineering.',
            skills: ['NumPy', 'Pandas', 'Data Cleaning', 'Feature Engineering', 'Seaborn'],
            resources: [
              { name: 'Python for Data Analysis by Wes McKinney', type: 'Book' },
              { name: 'Kaggle Micro-courses (Pandas, Data Cleaning)', type: 'Practice' },
            ],
            proTip: 'Avoid using for-loops on DataFrames; always use vectorized operations (.apply / numpy broadcasting).',
            deliverable: 'Perform comprehensive EDA on a messy 100k+ row financial dataset with actionable visual insights.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Classical Machine Learning & Deep Learning (PyTorch)',
        tagline: 'Supervised/Unsupervised algorithms, Neural Networks, CNNs, and Transformers.',
        durationEstimate: 'Weeks 7 - 16',
        gradient: 'from-pink-600 to-rose-600',
        badge: 'Deep Learning Core',
        milestones: [
          {
            id: 'ml-3',
            title: 'Scikit-Learn & Tree-based Ensembles (XGBoost, LightGBM)',
            duration: '4 Weeks',
            description: 'Decision Trees, Random Forests, Gradient Boosted Trees (XGBoost, CatBoost), Cross-validation, Hyperparameter tuning (Optuna), and Model Evaluation metrics (ROC-AUC, F1, PR-Curve).',
            skills: ['Scikit-Learn', 'XGBoost', 'Optuna Tuning', 'Precision/Recall Tradeoffs'],
            resources: [
              { name: 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow (Aurélien Géron)', type: 'Book' },
              { name: 'Fast.ai Practical Deep Learning for Coders', type: 'Course' },
            ],
            proTip: 'Always stratify your train-test splits on imbalanced classification datasets.',
            deliverable: 'High-performing customer churn prediction model with Optuna hyperparameter optimization.',
          },
          {
            id: 'ml-4',
            title: 'PyTorch Deep Learning & Transformer Architectures',
            duration: '5 Weeks',
            description: 'Tensors, Autograd, Custom PyTorch Datasets & Dataloaders, Training Loops, Backpropagation, CNNs for Vision, and Self-Attention Transformer mechanics.',
            skills: ['PyTorch', 'Neural Networks', 'Self-Attention Mechanisms', 'Vision Transformers', 'Transfer Learning'],
            resources: [
              { name: 'DeepLearning.AI Deep Learning Specialization (Andrew Ng)', type: 'Course' },
              { name: 'Andrej Karpathy - Building micrograd & GPT from scratch', type: 'YouTube' },
            ],
            proTip: 'Code Karpathy\'s "makemore" and mini-GPT to truly understand Query, Key, Value attention matrices.',
            deliverable: 'Train a character-level Transformer language model from scratch in PyTorch.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Generative AI, Large Language Models & RAG Systems',
        tagline: 'Hugging Face, Prompt Engineering, LangChain, Vector Databases & Fine-Tuning.',
        durationEstimate: 'Weeks 17 - 26',
        gradient: 'from-violet-600 to-purple-600',
        badge: 'GenAI & LLMs',
        milestones: [
          {
            id: 'ml-5',
            title: 'Retrieval-Augmented Generation (RAG) & Vector Databases',
            duration: '4 Weeks',
            description: 'Chunking strategies (Recursive, Semantic), Embedding models, Hybrid search (BM25 + Dense vector), Vector DBs (Qdrant, ChromaDB, Pinecone), Reranking (Cohere), and Hallucination mitigation.',
            skills: ['RAG Architectures', 'LangChain / LlamaIndex', 'Vector DBs', 'Semantic Search', 'RAGAS Evaluation'],
            resources: [
              { name: 'LangChain & LlamaIndex Official Documentation', type: 'Doc' },
              { name: 'Pinecone Vector Database Architecture Guide', type: 'Doc' },
            ],
            proTip: 'RAG quality depends 80% on clean data chunking and metadata filtering, not on just picking the largest LLM.',
            deliverable: 'Enterprise multi-document Q&A assistant with citation links and RAGAS accuracy score > 0.88.',
          },
          {
            id: 'ml-6',
            title: 'LLM Fine-Tuning (PEFT / LoRA / QLoRA) & Hugging Face',
            duration: '4 Weeks',
            description: 'Quantization (4-bit, 8-bit / bitsandbytes), Low-Rank Adaptation (LoRA, QLoRA), SFT (Supervised Fine Tuning), DPO/RLHF, and Hugging Face TRL library.',
            skills: ['Hugging Face Transformers', 'PEFT / LoRA', 'QLoRA Quantization', 'Model Evaluation'],
            resources: [
              { name: 'Hugging Face NLP & Audio/Vision Courses', type: 'Course' },
              { name: 'Unsloth Fast Fine-Tuning Tutorials', type: 'Doc' },
            ],
            proTip: 'Use Unsloth or Axolotl for 2x faster memory-efficient training on free Google Colab/Kaggle GPUs.',
            deliverable: 'Fine-tune a Llama-3 / Mistral model on a medical/legal QA dataset and evaluate benchmark perplexity.',
          },
        ],
      },
      {
        phaseNumber: 4,
        title: 'Production MLOps, Model Serving & Scalability',
        tagline: 'FastAPI model wrappers, vLLM / Triton inference, Docker, CI/CD, and Monitoring.',
        durationEstimate: 'Weeks 27 - 34',
        gradient: 'from-cyan-600 to-blue-600',
        badge: 'Production MLOps',
        milestones: [
          {
            id: 'ml-7',
            title: 'High-Throughput Model Serving (FastAPI, vLLM, TensorRT-LLM)',
            duration: '4 Weeks',
            description: 'Asynchronous streaming API endpoints, PagedAttention with vLLM, batching requests, GPU memory optimization, and Docker containerization.',
            skills: ['FastAPI', 'vLLM', 'Docker', 'Async Python', 'GPU Profiling'],
            resources: [
              { name: 'Full Stack Deep Learning (FSDL) Course', type: 'Course' },
              { name: 'vLLM Architecture & Performance Benchmarks', type: 'Doc' },
            ],
            proTip: 'Always test inference latency under concurrent load using Locust/wrk before deploying to production.',
            deliverable: 'Deploy a self-hosted open-source LLM endpoint on GPU cloud with token streaming and rate limiting.',
          },
          {
            id: 'ml-8',
            title: 'MLOps Lifecycle, MLflow, CI/CD & Data Drift Monitoring',
            duration: '4 Weeks',
            description: 'Experiment tracking with MLflow/Weights & Biases, DVC (Data Version Control), Automated testing for ML pipelines, and Evidently AI for data/concept drift detection.',
            skills: ['MLflow', 'W&B', 'DVC', 'Evidently AI', 'CI/CD for ML'],
            resources: [
              { name: 'Made With ML by Goku Mohandas', type: 'Course' },
              { name: 'Evidently AI Documentation', type: 'Doc' },
            ],
            proTip: 'Log all hyperparameters, dataset hashes, and evaluation metrics for every single model artifact generated.',
            deliverable: 'End-to-end automated MLOps pipeline that triggers model retraining when data drift exceeds threshold.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'Enterprise Multimodal RAG with Graph Search & Citations',
        level: 'Recruiter-Magnet',
        description: 'Context-aware financial analyst assistant capable of parsing PDFs, tables, charts, and generating executive reports with exact source citations.',
        techStack: ['Python 3.11', 'LlamaIndex', 'Qdrant Vector DB', 'FastAPI', 'Unstructured.io', 'Docker', 'React Frontend'],
        keyFeatures: [
          'Hybrid BM25 + dense semantic vector search with Cohere Reranker.',
          'Table-aware OCR extraction and visual chart reasoning via GPT-4o / Claude 3.5 Sonnet.',
          'Comprehensive hallucination guardrails via NeMo Guardrails.',
        ],
        resumeBulletExample: 'Built enterprise-grade Multimodal RAG engine with hybrid search & reranking, boosting retrieval recall to 94% across 10,000+ financial filings.',
      },
      {
        title: 'Domain-Specific Legal/Medical Assistant (Fine-Tuned Llama-3)',
        level: 'Advanced',
        description: 'QLoRA fine-tuned open-source model optimized for complex statutory interpretation, contract clause analysis, and risk scoring.',
        techStack: ['PyTorch', 'Hugging Face TRL', 'QLoRA', 'vLLM', 'FastAPI', 'Weights & Biases'],
        keyFeatures: [
          'Trained on 50,000+ domain legal clauses with custom instruction formatting.',
          'Achieved 38% reduction in hallucinations compared to base instruction model.',
          'Served via vLLM with PagedAttention achieving 120 tokens/second throughput.',
        ],
        resumeBulletExample: 'Fine-tuned 8B parameter LLM using QLoRA & DPO; deployed with vLLM achieving 120 tokens/sec throughput with 91% domain accuracy.',
      },
    ],
    certifications: [
      { name: 'DeepLearning.AI Deep Learning & LLM Specializations', issuer: 'DeepLearning.AI / Andrew Ng', valueScore: 94 },
      { name: 'AWS Certified Machine Learning – Specialty (MLS-C01)', issuer: 'Amazon Web Services', valueScore: 92 },
      { name: 'TensorFlow Developer Certificate / PyTorch Specialist', issuer: 'Google / Linux Foundation', valueScore: 85 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Practice AI/ML questions and live coding scenarios.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Identify weaknesses in PyTorch, Math and LLM architectures.' },
      { title: 'ATS Resume Analyzer', route: '/college/resume-analyzer', desc: 'Highlight your AI portfolio projects to top recruiters.' },
    ],
  },

  'devops-cloud': {
    id: 'devops-cloud',
    domainId: 'devops-cloud',
    title: 'Cloud Architect, DevOps & Site Reliability Engineer (SRE)',
    tagline: 'Master Kubernetes, Terraform IaC, AWS/GCP architecture, GitOps CI/CD, and Observability.',
    salaryBands: {
      entry: '₹8 - 16 LPA',
      mid: '₹18 - 35 LPA',
      senior: '₹38 - 70+ LPA',
    },
    popularCompanies: ['Red Hat', 'Amazon AWS', 'Microsoft Azure', 'Google Cloud', 'Cisco', 'Salesforce', 'JPMorgan'],
    marketDemand: 'Ultra High',
    difficultyLevel: 'Moderate',
    estimatedMonths: 8,
    keyTools: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'GitHub Actions / ArgoCD', 'Prometheus & Grafana', 'AWS'],
    pitfallsToAvoid: [
      'Weak Linux & Networking basics: trying to learn Kubernetes without mastering DNS, subnets, iptables, and bash.',
      'ClickOps: configuring cloud services manually in the AWS console instead of writing Terraform code.',
      'Neglecting Security: leaving open S3 buckets, hardcoding API keys, and not scanning Docker images for CVEs.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Linux Systems, Networking & Shell Automation',
        tagline: 'Deep dive into POSIX Linux internals, TCP/IP, DNS, and Bash scripting.',
        durationEstimate: 'Weeks 1 - 5',
        gradient: 'from-teal-600 to-cyan-600',
        badge: 'Linux & Core Net',
        milestones: [
          {
            id: 'dev-1',
            title: 'Linux Power User & System Administration',
            duration: '3 Weeks',
            description: 'Processes (ps, top, systemd), permissions (chmod, chown, sudoers), storage (LVM, mount), SSH key management, and Bash automation.',
            skills: ['Linux Kernel Basics', 'Bash Scripting', 'systemd', 'SSH Hardening'],
            resources: [
              { name: 'Linux Command Line by William Shotts', type: 'Book' },
              { name: 'OverTheWire Bandit WarGames', type: 'Practice' },
            ],
            proTip: 'Practice writing robust bash scripts with "set -euo pipefail" to catch unhandled errors immediately.',
            deliverable: 'Automated server bootstrapping script that configures firewall, creates non-root users, and sets up log rotation.',
          },
          {
            id: 'dev-2',
            title: 'Computer Networking for Cloud Engineers',
            duration: '2 Weeks',
            description: 'OSI Model, TCP/IP 3-way handshake, DNS resolution path, CIDR subnetting, NAT, Load Balancers, TLS/SSL certificates, and HTTP/2 & 3.',
            skills: ['TCP/IP', 'Subnetting & CIDR', 'DNS & Route 53', 'TLS/SSL', 'Wireshark'],
            resources: [
              { name: 'Networking for System Administrators by Michael W Lucas', type: 'Book' },
              { name: 'Computer Networking - Kurose & Ross', type: 'Book' },
            ],
            proTip: 'Know how to troubleshoot connectivity using curl -v, dig, traceroute, and netstat/ss.',
            deliverable: 'Simulate a multi-tier VPC network topology with public/private subnets, NAT Gateway, and security groups.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Containers & Kubernetes Orchestration',
        tagline: 'Docker containerization and production Kubernetes clusters.',
        durationEstimate: 'Weeks 6 - 15',
        gradient: 'from-blue-600 to-teal-600',
        badge: 'K8s & Containers',
        milestones: [
          {
            id: 'dev-3',
            title: 'Production Docker Containers & Security',
            duration: '4 Weeks',
            description: 'Namespaces & cgroups, multi-stage builds, rootless containers, volume persistence, Docker Compose networks, and Trivy vulnerability scanning.',
            skills: ['Docker', 'Container Security', 'Multi-Stage Builds', 'Trivy Scanning'],
            resources: [
              { name: 'Docker Deep Dive by Nigel Poulton', type: 'Book' },
              { name: 'Play with Docker Classroom', type: 'Practice' },
            ],
            proTip: 'Never run containers as root user in production; always create a dedicated non-root user in your Dockerfile.',
            deliverable: 'Multi-service web application bundled via Docker Compose with secure distroless images and healthchecks.',
          },
          {
            id: 'dev-4',
            title: 'Kubernetes (K8s) Cluster Orchestration',
            duration: '6 Weeks',
            description: 'Pods, Deployments, Services (ClusterIP, NodePort, LoadBalancer), Ingress Controllers, ConfigMaps, Secrets, Persistent Volumes, StatefulSets, HPA, and Helm Charts.',
            skills: ['Kubernetes', 'Helm', 'Ingress NGINX', 'Horizontal Pod Autoscaler', 'Kubeconfig'],
            resources: [
              { name: 'Kubernetes Up & Running (Kelsey Hightower)', type: 'Book' },
              { name: 'Mumshad Mannambeth CKA Course (KodeKloud)', type: 'Course' },
            ],
            proTip: 'Master kubectl imperative commands and aliases (k for kubectl) to speed up CKA exam preparation.',
            deliverable: 'Deploy a high-availability 3-node microservice on Kubernetes with Ingress, TLS, automated HPA scaling, and Helm chart.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Infrastructure as Code (Terraform) & Cloud Architecture',
        tagline: 'Provision entire cloud environments with code on AWS / Azure.',
        durationEstimate: 'Weeks 16 - 24',
        gradient: 'from-cyan-600 to-indigo-600',
        badge: 'IaC & AWS',
        milestones: [
          {
            id: 'dev-5',
            title: 'Terraform IaC & Cloud State Management',
            duration: '4 Weeks',
            description: 'HCL syntax, Providers, Variables, Outputs, Remote State locking with S3 & DynamoDB, Terraform Modules, Workspaces, and Drift detection.',
            skills: ['Terraform', 'HCL', 'State Locking', 'Modular IaC', 'TFLint'],
            resources: [
              { name: 'Terraform: Up & Running by Yevgeniy Brikman', type: 'Book' },
              { name: 'HashiCorp Certified Terraform Associate Official Guide', type: 'Course' },
            ],
            proTip: 'Never store plain secrets in Terraform code; integrate HashiCorp Vault or AWS Secrets Manager.',
            deliverable: 'Create reusable Terraform modules that provision a complete AWS VPC, EKS cluster, and RDS database.',
          },
          {
            id: 'dev-6',
            title: 'AWS Cloud Core Architecture',
            duration: '5 Weeks',
            description: 'IAM Least-Privilege policies, EC2 auto-scaling groups, S3 life-cycle rules, CloudFront CDN, Route53 DNS, AWS Lambda serverless, and CloudWatch alarms.',
            skills: ['AWS IAM', 'VPC Peering', 'Auto Scaling', 'CloudWatch', 'Cost Optimization'],
            resources: [
              { name: 'Stephane Maarek AWS Solutions Architect Associate', type: 'Course' },
              { name: 'AWS Well-Architected Framework Whitepapers', type: 'Doc' },
            ],
            proTip: 'Enforce MFA on root AWS accounts and use IAM roles instead of long-lived access keys.',
            deliverable: 'Architecture diagram and Terraform code for a fault-tolerant multi-AZ web app on AWS.',
          },
        ],
      },
      {
        phaseNumber: 4,
        title: 'GitOps CI/CD & Observability (SRE)',
        tagline: 'Zero-downtime deployments (Canary/Blue-Green) & Monitoring.',
        durationEstimate: 'Weeks 25 - 32',
        gradient: 'from-purple-600 to-teal-600',
        badge: 'GitOps & SRE',
        milestones: [
          {
            id: 'dev-7',
            title: 'GitOps Continuous Delivery (GitHub Actions & ArgoCD)',
            duration: '4 Weeks',
            description: 'Automated testing workflows, semantic versioning, container image tagging, ArgoCD declarative GitOps synchronization, and Canary rollouts with Argo Rollouts.',
            skills: ['GitHub Actions', 'ArgoCD', 'GitOps', 'Blue-Green Deployments', 'Canary Releases'],
            resources: [
              { name: 'GitOps and ArgoCD Complete Guide', type: 'Doc' },
              { name: 'GitHub Actions Official Documentation', type: 'Doc' },
            ],
            proTip: 'Separate application code repositories from Kubernetes manifest deployment repositories for clean GitOps.',
            deliverable: 'Set up an automated GitOps pipeline where pushing to main automatically syncs and deploys via ArgoCD to K8s.',
          },
          {
            id: 'dev-8',
            title: 'Observability: Prometheus, Grafana, OpenTelemetry & ELK',
            duration: '4 Weeks',
            description: 'The 4 Golden Signals of SRE (Latency, Traffic, Errors, Saturation), Prometheus metrics scraping, PromQL queries, Grafana dashboards, Loki/ELK log aggregation, and PagerDuty alerts.',
            skills: ['Prometheus', 'Grafana', 'PromQL', 'Loki / Fluentbit', 'SLOs & SLAs'],
            resources: [
              { name: 'Google Site Reliability Engineering (SRE) Book', type: 'Book' },
              { name: 'Prometheus & Grafana Deep Dive', type: 'Course' },
            ],
            proTip: 'Define realistic Service Level Objectives (SLOs) and Error Budgets rather than trying to achieve 100% impossible uptime.',
            deliverable: 'Live Grafana SRE monitoring dashboard monitoring cluster CPU, memory, error rates, and 99th percentile response latency.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'Production Multi-Region Cloud Infrastructure with GitOps & ArgoCD',
        level: 'Recruiter-Magnet',
        description: 'Complete end-to-end cloud platform built with Terraform, AWS EKS, ArgoCD, Prometheus/Grafana stack, and automated Canary rollouts.',
        techStack: ['Terraform', 'AWS EKS', 'ArgoCD', 'Kubernetes', 'Prometheus', 'Grafana', 'GitHub Actions'],
        keyFeatures: [
          'Zero-touch GitOps deployment: code commits automatically trigger builds, image scans, and ArgoCD progressive rollouts.',
          'Automated canary deployment with auto-rollback if error rate exceeds 1%.',
          'Production-grade security scanning (Trivy + Checkov) and cost estimation via Infracost.',
        ],
        resumeBulletExample: 'Engineered GitOps CI/CD platform with Terraform & ArgoCD on AWS EKS, cutting deployment cycle time by 70% with automated canary rollbacks.',
      },
    ],
    certifications: [
      { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation (CNCF)', valueScore: 98 },
      { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', valueScore: 95 },
      { name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp', valueScore: 90 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Practice DevOps, Linux, and Cloud scenarios.' },
      { title: 'ATS Resume Analyzer', route: '/college/resume-analyzer', desc: 'Optimize your resume for Cloud & DevOps keywords.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Identify gaps in Networking and Kubernetes.' },
    ],
  },

  'core-ece': {
    id: 'core-ece',
    domainId: 'core-ece',
    title: 'Embedded Systems, Firmware & VLSI Design Engineer',
    tagline: 'C/C++ firmware, ARM Cortex-M, RTOS, Verilog/SystemVerilog, and hardware protocols.',
    salaryBands: {
      entry: '₹7 - 16 LPA',
      mid: '₹18 - 36 LPA',
      senior: '₹38 - 65+ LPA',
    },
    popularCompanies: ['Qualcomm', 'Texas Instruments', 'Intel', 'NVIDIA', 'NXP Semiconductors', 'STMicroelectronics', 'AMD'],
    marketDemand: 'High',
    difficultyLevel: 'Challenging',
    estimatedMonths: 10,
    keyTools: ['Embedded C', 'C++', 'ARM Cortex-M', 'FreeRTOS', 'Verilog / VHDL', 'STM32CubeIDE', 'Logic Analyzer', 'I2C/SPI/UART'],
    pitfallsToAvoid: [
      'Sticking only to Arduino libraries: industry requires bare-metal register-level programming and CMSIS.',
      'Ignoring Memory Layout: not understanding Stack, Heap, Flash, SRAM, and pointer arithmetic in C.',
      'Skipping RTOS: building blocking delay loops instead of tasks, semaphores, and message queues.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Master Embedded C & Low-Level Hardware Architecture',
        tagline: 'Bitwise manipulation, pointers, register mapping, and microcontroller architecture.',
        durationEstimate: 'Weeks 1 - 6',
        gradient: 'from-amber-600 to-orange-600',
        badge: 'Embedded C Core',
        milestones: [
          {
            id: 'ece-1',
            title: 'Advanced C for Embedded Systems',
            duration: '3 Weeks',
            description: 'Pointers, function pointers, volatile keyword, bit masking, memory alignment, structs, unions, and circular buffers.',
            skills: ['Embedded C', 'Pointers & Memory', 'Bit Manipulation', 'Volatile & Const Qualifiers'],
            resources: [
              { name: 'Making Embedded Systems by Elecia White', type: 'Book' },
              { name: 'Fastbit Embedded C Programming (Udemy)', type: 'Course' },
            ],
            proTip: 'Always understand why the "volatile" keyword prevents the compiler from optimizing out hardware register reads.',
            deliverable: 'Implement a memory-safe dynamic ring buffer (FIFO) with unit tests for embedded logging.',
          },
          {
            id: 'ece-2',
            title: 'Microcontroller Architecture & Bare-Metal Programming',
            duration: '3 Weeks',
            description: 'ARM Cortex-M core registers, Memory Map, Vector Interrupt Table (NVIC), SysTick timer, and Clock Trees (PLL).',
            skills: ['ARM Cortex-M', 'Bare-Metal C', 'Interrupts & ISRs', 'Clock Configuration'],
            resources: [
              { name: 'The Definitive Guide to ARM Cortex-M3 and Cortex-M4 (Joseph Yiu)', type: 'Book' },
              { name: 'STM32 Reference Manual (RM0090)', type: 'Doc' },
            ],
            proTip: 'Write GPIO and Timer drivers from scratch by directly manipulating register addresses without using HAL.',
            deliverable: 'Bare-metal STM32 driver for GPIO, Timer PWM, and external hardware push-button interrupts.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Communication Protocols & Driver Development',
        tagline: 'Master UART, SPI, I2C, CAN Bus, and DMA controllers.',
        durationEstimate: 'Weeks 7 - 15',
        gradient: 'from-orange-600 to-red-600',
        badge: 'Hardware Protocols',
        milestones: [
          {
            id: 'ece-3',
            title: 'Bus Protocols: UART, SPI & I2C Drivers',
            duration: '4 Weeks',
            description: 'Clock polarity/phase (CPOL/CPHA), I2C ACK/NACK arbitration, baud rate generators, and interrupt/DMA driven transfers.',
            skills: ['UART', 'SPI', 'I2C', 'DMA Controllers', 'Logic Analyzer Debugging'],
            resources: [
              { name: 'Embedded Systems Protocols Guide', type: 'Doc' },
              { name: 'Saleae Logic Analyzer Tutorials', type: 'Doc' },
            ],
            proTip: 'Use a \$10 Saleae clone USB logic analyzer to visually verify your I2C clock and data packet frames.',
            deliverable: 'Full-duplex SPI driver interfacing with an OLED display and I2C driver for an MPU6050 accelerometer.',
          },
          {
            id: 'ece-4',
            title: 'Automotive & Industrial Protocols (CAN Bus, Modbus)',
            duration: '4 Weeks',
            description: 'CAN 2.0A/B frame format, bit stuffing, identifier arbitration, differential signaling, transceivers (MCP2551), and CANopen basics.',
            skills: ['CAN Bus', 'Automotive Protocols', 'Differential Signaling', 'Fault Confinement'],
            resources: [
              { name: 'A Comprehensible Guide to Controller Area Network (Wilfried Voss)', type: 'Book' },
            ],
            proTip: 'CAN bus is the #1 protocol tested in Tier-1 automotive embedded interviews (Bosch, Continental, Tata Motors).',
            deliverable: 'Two STM32 nodes communicating telemetric sensor data across a CAN bus network with error handling.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Real-Time Operating Systems (FreeRTOS) & Multitasking',
        tagline: 'Tasks, priorities, semaphores, mutexes, message queues, and memory management.',
        durationEstimate: 'Weeks 16 - 24',
        gradient: 'from-amber-700 to-yellow-600',
        badge: 'RTOS & Multitasking',
        milestones: [
          {
            id: 'ece-5',
            title: 'FreeRTOS Core Mechanics & Task Scheduling',
            duration: '4 Weeks',
            description: 'Preemptive vs cooperative scheduling, task states, context switching, idle task, tick interrupts, and memory heap schemes (heap_4).',
            skills: ['FreeRTOS', 'Task Scheduling', 'Context Switching', 'RTOS Memory Allocation'],
            resources: [
              { name: 'Mastering the FreeRTOS Real Time Kernel (Official FreeRTOS Book)', type: 'Book' },
              { name: 'DigiKey FreeRTOS Video Tutorial Series', type: 'YouTube' },
            ],
            proTip: 'Never use blocking delay functions inside RTOS tasks; always use vTaskDelay or task notifications.',
            deliverable: 'Multi-tasking embedded logger with separate acquisition, processing, and UI display tasks.',
          },
          {
            id: 'ece-6',
            title: 'Inter-Task Communication & Synchronization',
            duration: '4 Weeks',
            description: 'Semaphores (Binary & Counting), Mutexes with Priority Inheritance, Priority Inversion problem, Queues, Event Groups, and Task Notifications.',
            skills: ['Mutexes & Semaphores', 'Priority Inversion', 'RTOS Message Queues', 'Deadlock Prevention'],
            resources: [
              { name: 'Better Embedded System Software (Philip Koopman)', type: 'Book' },
            ],
            proTip: 'Understand the Mars Pathfinder priority inversion bug and how priority inheritance fixes it.',
            deliverable: 'Autonomous Smart Vehicle Controller using FreeRTOS with ultrasonic collision avoidance task running at highest priority.',
          },
        ],
      },
      {
        phaseNumber: 4,
        title: 'Digital VLSI & FPGA Design (Verilog / SystemVerilog)',
        tagline: 'Combinational/Sequential logic, RTL design, FSMs, and FPGA synthesis.',
        durationEstimate: 'Weeks 25 - 34',
        gradient: 'from-red-600 to-amber-700',
        badge: 'VLSI & FPGA',
        milestones: [
          {
            id: 'ece-7',
            title: 'Verilog RTL Design & Digital Synthesis',
            duration: '5 Weeks',
            description: 'Blocking vs non-blocking assignments (<= vs =), Finite State Machines (Moore & Mealy), Setup & Hold time constraints, and Metastability.',
            skills: ['Verilog HDL', 'RTL Design', 'Timing Analysis (STA)', 'FSM Design', 'ModelSim / Vivado'],
            resources: [
              { name: 'HDLBits Interactive Verilog Practice', type: 'Practice' },
              { name: 'Verilog HDL by Samir Palnitkar', type: 'Book' },
            ],
            proTip: 'Always use non-blocking (<=) for sequential logic (clocked always blocks) to avoid simulation-synthesis mismatches.',
            deliverable: 'Design and simulate an 8-bit RISC processor ALU and register file with ModelSim testbenches.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'FreeRTOS-Powered Smart IoT Gateway with CAN & BLE Telemetry',
        level: 'Recruiter-Magnet',
        description: 'Multi-threaded firmware on STM32 + ESP32 collecting CAN telemetry, running edge filtering, and publishing to cloud over MQTT/TLS.',
        techStack: ['Embedded C', 'STM32', 'FreeRTOS', 'CAN Bus', 'MQTT / TLS', 'ESP32 BLE', 'I2C/SPI'],
        keyFeatures: [
          'Preemptive real-time task scheduling with sub-5ms latency for emergency brake triggers.',
          'Secure OTA (Over-The-Air) firmware update capability with dual-bank flash rollback.',
          'Low-power sleep mode reducing quiescent current draw to under 15 microamps.',
        ],
        resumeBulletExample: 'Engineered FreeRTOS telemetry firmware for STM32 with CAN & BLE, cutting sensor jitter by 60% and enabling secure dual-bank OTA updates.',
      },
    ],
    certifications: [
      { name: 'ARM Accredited Engineer (AAE)', issuer: 'ARM Limited', valueScore: 92 },
      { name: 'Certified FreeRTOS Professional', issuer: 'Amazon FreeRTOS / ST', valueScore: 88 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Simulate Core ECE, C pointers, and Embedded questions.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Identify blindspots in Verilog, C, and RTOS.' },
    ],
  },

  'product-pm': {
    id: 'product-pm',
    domainId: 'product-pm',
    title: 'Associate Product Manager (APM) & Tech Consultant',
    tagline: 'Product discovery, user research, wireframing, PRDs, metrics (AARRR), and agile execution.',
    salaryBands: {
      entry: '₹10 - 24 LPA',
      mid: '₹25 - 45 LPA',
      senior: '₹50 - 85+ LPA',
    },
    popularCompanies: ['Google APM', 'Microsoft', 'Flipkart', 'Cred', 'Swiggy', 'Razorpay', 'McKinsey', 'Bain'],
    marketDemand: 'High',
    difficultyLevel: 'Moderate',
    estimatedMonths: 6,
    keyTools: ['Figma', 'Mixpanel', 'Jira / Linear', 'SQL', 'Notion PRD Templates', 'Postman', 'Amplitude'],
    pitfallsToAvoid: [
      'Focusing purely on ideas instead of user problems and business metrics.',
      'Weak SQL skills: modern PMs must be able to query their own product data without waiting on data analysts.',
      'Building feature bloat without validating PMF (Product-Market Fit) through user interviews.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Product Thinking, User Research & Problem Discovery',
        tagline: 'Empathy maps, user personas, Jobs-to-be-Done (JTBD), and customer interviews.',
        durationEstimate: 'Weeks 1 - 4',
        gradient: 'from-violet-600 to-indigo-600',
        badge: 'Discovery Core',
        milestones: [
          {
            id: 'pm-1',
            title: 'Mastering Product Sense & JTBD Framework',
            duration: '2 Weeks',
            description: 'Jobs-to-be-done framework, user journey mapping, pain point identification, and competitor benchmarking.',
            skills: ['Product Sense', 'JTBD Framework', 'User Interviews', 'Market Sizing / Guesstimates'],
            resources: [
              { name: 'The Lean Product Playbook by Dan Olsen', type: 'Book' },
              { name: 'Inspired by Marty Cagan', type: 'Book' },
              { name: 'Lenny\'s Newsletter & Podcast', type: 'Course' },
            ],
            proTip: 'Fall in love with the problem, not your solution. Ask "Why?" 5 times during customer interviews.',
            deliverable: 'Comprehensive User Research Report & Empathy Map on an underserved campus problem.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Product Requirements Documents (PRD) & Wireframing',
        tagline: 'Write crystal-clear specs, user stories, acceptance criteria, and Figma prototypes.',
        durationEstimate: 'Weeks 5 - 12',
        gradient: 'from-purple-600 to-pink-600',
        badge: 'Execution & PRDs',
        milestones: [
          {
            id: 'pm-2',
            title: 'Writing Industry-Standard PRDs & Specs',
            duration: '4 Weeks',
            description: 'Problem statement, non-goals, user personas, functional specs, edge cases, success metrics, and release phases (MVP vs V2).',
            skills: ['PRD Writing', 'Figma Wireframing', 'User Stories & Acceptance Criteria', 'Agile / Scrum'],
            resources: [
              { name: 'Kevin Yien (Stripe PM) PRD Template', type: 'Doc' },
              { name: 'Decode and Conquer by Lewis C. Lin', type: 'Book' },
            ],
            proTip: 'Always write explicit "Non-Goals" in your PRD to stop scope creep before engineering starts building.',
            deliverable: '10-page production-grade PRD with clickable Figma prototype for a new feature in Spotify/Uber.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Product Analytics, Metrics & Experimentation (A/B Testing)',
        tagline: 'North Star Metric, Pirate Funnel (AARRR), SQL queries, and A/B test design.',
        durationEstimate: 'Weeks 13 - 20',
        gradient: 'from-indigo-600 to-teal-600',
        badge: 'Data & Analytics',
        milestones: [
          {
            id: 'pm-3',
            title: 'SQL for Product Managers & Funnel Analysis',
            duration: '4 Weeks',
            description: 'SELECT queries, JOINs, GROUP BY, Window Functions, cohort retention tables, conversion funnels in Mixpanel/Amplitude, and statistical significance in A/B tests.',
            skills: ['Product SQL', 'Cohort Retention', 'Funnel Optimization', 'A/B Testing & p-values'],
            resources: [
              { name: 'Mode Analytics SQL Tutorial', type: 'Doc' },
              { name: 'Reforge Product Analytics Insights', type: 'Course' },
            ],
            proTip: 'Know the difference between vanity metrics (total signups) and actionable metrics (weekly active users who complete core action).',
            deliverable: 'SQL-driven dashboard breaking down user churn and onboarding drop-off percentages.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'End-to-End Product Teardown & Redesign PRD for a Super-App',
        level: 'Recruiter-Magnet',
        description: 'Comprehensive product teardown of Zomato/Swiggy/Zepto identifying conversion funnel leakages, user friction, complete PRD, Figma prototypes, and ROI estimation.',
        techStack: ['Figma', 'Notion PRD', 'SQL', 'Mixpanel', 'Miro User Flow'],
        keyFeatures: [
          'Detailed analysis of 50+ user interviews revealing cart abandonment drivers.',
          'Interactive high-fidelity Figma prototype demonstrating 1-click checkout flow.',
          'Defined North Star Metric, OKRs, and telemetry instrumentation specification.',
        ],
        resumeBulletExample: 'Authored 12-page Product Teardown & PRD for Swiggy checkout optimization, validated via 40+ user interviews with projected 14% uplift in cart conversion.',
      },
    ],
    certifications: [
      { name: 'Product School Certified Product Manager (CPM)', issuer: 'Product School', valueScore: 90 },
      { name: 'Reforge Product Strategy Certificate', issuer: 'Reforge', valueScore: 92 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Practice PM Product Sense, Guesstimates, and Behavioral rounds.' },
      { title: 'ATS Resume Analyzer', route: '/college/resume-analyzer', desc: 'Format your resume for APM applications.' },
    ],
  },

  'mech-auto': {
    id: 'mech-auto',
    domainId: 'mech-auto',
    title: 'Robotics, EV Powertrain & Mechanical Design Engineer',
    tagline: 'SolidWorks/CATIA 3D modeling, FEA simulation (ANSYS), EV battery systems, and automation.',
    salaryBands: {
      entry: '₹6 - 14 LPA',
      mid: '₹16 - 30 LPA',
      senior: '₹32 - 55+ LPA',
    },
    popularCompanies: ['Tesla', 'Tata Motors', 'Mahindra', 'Ather Energy', 'Ola Electric', 'L&T', 'DRDO / ISRO'],
    marketDemand: 'Growing Exponentially',
    difficultyLevel: 'Challenging',
    estimatedMonths: 8,
    keyTools: ['SolidWorks / CATIA', 'ANSYS Mechanical / Fluent', 'MATLAB & Simulink', 'GD&T', '3D Printing / DFM'],
    pitfallsToAvoid: [
      'Ignoring GD&T (Geometric Dimensioning & Tolerancing): crucial for actual manufacturing drawings.',
      'Only knowing pure CAD: industry expects FEA stress/thermal simulation and basic Python/MATLAB scripting.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Parametric 3D CAD Modeling & GD&T Standards',
        tagline: 'Part modeling, complex surface modeling, sheet metal, and ASME Y14.5 drafting.',
        durationEstimate: 'Weeks 1 - 8',
        gradient: 'from-rose-600 to-red-600',
        badge: 'CAD & GD&T Core',
        milestones: [
          {
            id: 'me-1',
            title: 'Master SolidWorks / CATIA & Surfacing',
            duration: '4 Weeks',
            description: 'Parametric sketches, feature trees, assembly mates, interference detection, and top-down assembly design.',
            skills: ['3D CAD', 'Assembly Modeling', 'Sheet Metal', 'Top-Down Design'],
            resources: [{ name: 'SolidWorks CSWA / CSWP Official Prep', type: 'Course' }],
            proTip: 'Always fully define your sketches (all lines black, zero underdefined entities) to avoid model rebuilding errors.',
            deliverable: 'Complete 3D CAD assembly of a multi-stage planetary gearbox with exploded view drawing.',
          },
          {
            id: 'me-2',
            title: 'GD&T (ASME Y14.5) & Design for Manufacturing (DFM)',
            duration: '4 Weeks',
            description: 'Datum reference frames, position tolerance, form/orientation tolerances, MMC/LMC modifiers, and injection molding/machining limits.',
            skills: ['GD&T', 'Tolerance Stackup', 'DFM / DFA', 'Machining Standards'],
            resources: [{ name: 'GeoTol Pro GD&T Handbook', type: 'Book' }],
            proTip: 'Learn statistical tolerance stackup calculation (RSS vs Worst-Case).',
            deliverable: 'Production manufacturing drawing with complete GD&T callouts and tolerance stackup analysis.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'FEA Stress Analysis, CFD & Thermal Simulation (ANSYS)',
        tagline: 'Structural FEA, thermal dissipation, mesh convergence, and aerodynamics.',
        durationEstimate: 'Weeks 9 - 18',
        gradient: 'from-amber-600 to-red-600',
        badge: 'ANSYS & FEA',
        milestones: [
          {
            id: 'me-3',
            title: 'Structural FEA & Modal Vibration Analysis',
            duration: '5 Weeks',
            description: 'Static structural FEA, boundary conditions, element types (tetrahedral vs hexahedral), mesh independence study, and safety factor calculations.',
            skills: ['ANSYS Mechanical', 'Stress Analysis', 'Modal Vibration', 'Mesh Refinement'],
            resources: [{ name: 'Cornell edX - A Hands-on Introduction to Engineering Simulations', type: 'Course' }],
            proTip: 'Never trust FEA color plots without performing a mesh convergence check.',
            deliverable: 'Finite Element structural analysis report of a lightweight EV suspension upright arm.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Electric Vehicles (EV) Powertrain & Battery Thermal Systems',
        tagline: 'Battery pack sizing, BMS fundamentals, motor types (PMSM/BLDC), and thermal management.',
        durationEstimate: 'Weeks 19 - 28',
        gradient: 'from-red-600 to-purple-600',
        badge: 'EV & Robotics',
        milestones: [
          {
            id: 'me-4',
            title: 'EV Battery Pack & Thermal Management Simulation',
            duration: '5 Weeks',
            description: 'Cell chemistry (LFP vs NMC), series-parallel pack configuration, busbar spot welding design, and liquid cooling cold-plate CFD in ANSYS Fluent.',
            skills: ['EV Battery Sizing', 'CFD Thermal Cooling', 'Simulink EV Modeling', 'BMS Architecture'],
            resources: [{ name: 'NPTEL Electric Vehicles Course (IIT Madras)', type: 'Course' }],
            proTip: 'EV recruiters prioritize candidates who understand thermal runaway prevention and cold-plate fluid dynamics.',
            deliverable: 'Simulink simulation model of an EV driving cycle (WLTP) calculating motor torque, power, and battery discharge.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'Design & FEA Optimization of a High-Performance EV Chassis & Battery Pack',
        level: 'Recruiter-Magnet',
        description: 'Complete CAD & FEA simulation of a tubular spaceframe chassis and 5 kWh modular battery enclosure with integrated liquid cooling.',
        techStack: ['SolidWorks', 'ANSYS Mechanical', 'ANSYS Fluent', 'MATLAB/Simulink', 'GD&T'],
        keyFeatures: [
          'Torsional rigidity optimization achieving 25% weight reduction while maintaining safety factor > 2.2.',
          'CFD flow simulation of battery cooling channels maintaining temperature delta < 3°C across cells.',
          'Complete manufacturing drawings with BOM and tolerance stackup.',
        ],
        resumeBulletExample: 'Designed EV spaceframe chassis & liquid-cooled battery pack in SolidWorks/ANSYS, achieving 25% mass reduction with 2.4 safety factor under 4G bump loads.',
      },
    ],
    certifications: [
      { name: 'Certified SOLIDWORKS Professional (CSWP)', issuer: 'Dassault Systèmes', valueScore: 92 },
      { name: 'ANSYS Certified Mechanical Professional', issuer: 'ANSYS Inc.', valueScore: 88 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Practice Core Mechanical and Design questions.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Identify gaps in FEA, Thermodynamics, and GD&T.' },
    ],
  },

  'civil-infra': {
    id: 'civil-infra',
    domainId: 'civil-infra',
    title: 'BIM, Structural Design & Smart Infrastructure Engineer',
    tagline: 'STAAD.Pro/ETABS structural analysis, Autodesk Revit BIM modeling, and GIS infrastructure.',
    salaryBands: {
      entry: '₹5 - 12 LPA',
      mid: '₹14 - 26 LPA',
      senior: '₹28 - 48+ LPA',
    },
    popularCompanies: ['L&T Construction', 'Tata Consulting Engineers (TCE)', 'Afcons', 'WSP', 'AECOM', 'Shapoorji Pallonji', 'NHAI'],
    marketDemand: 'Moderate',
    difficultyLevel: 'Moderate',
    estimatedMonths: 7,
    keyTools: ['Autodesk Revit (BIM)', 'ETABS / STAAD.Pro', 'AutoCAD', 'Navisworks (Clash Detection)', 'Primavera P6', 'GIS (QGIS)'],
    pitfallsToAvoid: [
      'Sticking only to 2D AutoCAD: modern global EPC firms mandate 3D BIM (Revit) & Navisworks clash coordination.',
      'Relying solely on software output without manual check of IS 456 / IS 1893 seismic code calculations.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Structural Analysis & Indian/Euro Code Standards (IS 456, IS 1893)',
        tagline: 'RCC/Steel design, seismic/wind loads, and ETABS/STAAD modeling.',
        durationEstimate: 'Weeks 1 - 10',
        gradient: 'from-emerald-600 to-green-600',
        badge: 'Structural Core',
        milestones: [
          {
            id: 'ce-1',
            title: 'ETABS / STAAD.Pro RCC Multi-Storey Building Design',
            duration: '5 Weeks',
            description: 'Dead/Live load combinations, Earthquake seismic coefficient (IS 1893), Wind load (IS 875), Slab/Beam/Column reinforcement detailing.',
            skills: ['ETABS', 'STAAD.Pro', 'IS 456 RCC Design', 'Seismic Analysis', 'Shear Wall Design'],
            resources: [{ name: 'NPTEL Structural Dynamics & Earthquake Engineering (IIT Roorkee)', type: 'Course' }],
            proTip: 'Always check the Maximum Story Drift ratio to ensure the structure satisfies lateral stability requirements.',
            deliverable: 'Complete ETABS analysis and detailing report for a G+12 residential RCC frame building.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Building Information Modeling (BIM) & Coordination (Revit)',
        tagline: 'Architectural, Structural, MEP modeling, and Navisworks clash detection.',
        durationEstimate: 'Weeks 11 - 20',
        gradient: 'from-teal-600 to-emerald-600',
        badge: 'BIM & Navisworks',
        milestones: [
          {
            id: 'ce-2',
            title: 'Autodesk Revit Structural & Architectural BIM',
            duration: '5 Weeks',
            description: 'LOD 300/350 modeling, parametric families, rebar modeling, schedule generation, and 4D construction sequencing in Navisworks.',
            skills: ['Autodesk Revit', 'Navisworks Clash Detection', 'LOD Standards', 'BIM Coordination'],
            resources: [{ name: 'Autodesk Certified Professional Revit Prep', type: 'Course' }],
            proTip: 'Clash resolution between Structural beams and MEP HVAC ducts is the most in-demand BIM coordinator skill.',
            deliverable: 'LOD 350 BIM model with zero hard clashes validated in Navisworks report.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'End-to-End Structural Design & BIM Coordination of a Commercial Tower',
        level: 'Recruiter-Magnet',
        description: 'Comprehensive ETABS seismic analysis paired with a coordinated LOD 350 Revit BIM model and Navisworks clash matrix.',
        techStack: ['ETABS', 'Autodesk Revit', 'Navisworks Manage', 'AutoCAD', 'Excel VBA'],
        keyFeatures: [
          'Full compliance with IS 1893 seismic and IS 875 Part 3 wind loading.',
          'Generated automated Bar Bending Schedules (BBS) and bill of quantities (BOQ).',
          'Identified and resolved 40+ structural vs MEP clashes in Navisworks.',
        ],
        resumeBulletExample: 'Designed G+15 commercial structure in ETABS adhering to IS 1893; developed LOD 350 Revit BIM model resolving 42 spatial clashes.',
      },
    ],
    certifications: [
      { name: 'Autodesk Certified Professional: Revit for Structure', issuer: 'Autodesk', valueScore: 92 },
      { name: 'Bentley Certified STAAD.Pro Associate', issuer: 'Bentley Systems', valueScore: 85 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Practice Civil Engineering & Structural questions.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Examine strengths and weaknesses in structural concepts.' },
    ],
  },

  'gate-psu': {
    id: 'gate-psu',
    domainId: 'gate-psu',
    title: 'GATE Topper & PSU Officer Track (ISRO, BARC, IOCL, ONGC)',
    tagline: 'Structured subject-wise mastery, PYQ drill strategies, test series cycles, and PSU interviews.',
    salaryBands: {
      entry: '₹14 - 22 LPA + Perks',
      mid: '₹22 - 35 LPA',
      senior: '₹35 - 50+ LPA',
    },
    popularCompanies: ['ISRO', 'BARC', 'IOCL', 'NTPC', 'ONGC', 'PowerGrid', 'IIT Bombay M.Tech', 'IISc Bangalore'],
    marketDemand: 'High',
    difficultyLevel: 'Intensive',
    estimatedMonths: 10,
    keyTools: ['Virtual Calculator', 'Made Easy / ACE Test Series', '25-Year GATE PYQs', 'Short Notes Formula Booklets'],
    pitfallsToAvoid: [
      'Not practicing on the onscreen Virtual Calculator: losing 10-15 precious minutes in the exam on basic arithmetic.',
      'Studying only theory without timed full-length mock tests (aim for 25+ mock tests before February).',
      'Ignoring General Aptitude & Engineering Mathematics (carries 28 free scoring marks!).',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'High-Weightage Mathematics, Aptitude & Core Subject Mastery',
        tagline: 'Secure the foundation 28 marks in Engg Math + Aptitude, followed by high-yield subjects.',
        durationEstimate: 'Months 1 - 4',
        gradient: 'from-sky-600 to-blue-700',
        badge: 'Subject Foundations',
        milestones: [
          {
            id: 'gt-1',
            title: 'Engineering Mathematics & General Aptitude Mastery',
            duration: '4 Weeks',
            description: 'Linear Algebra, Calculus, Probability, Differential Equations, Verbal Ability, and Numerical Reasoning (Total 28 Marks).',
            skills: ['Engg Mathematics', 'Aptitude Speed', 'Probability & Stats', 'Virtual Calculator Speed'],
            resources: [{ name: 'NPTEL GATE Prep Portal & Made Easy Math Handbook', type: 'Book' }],
            proTip: 'Target minimum 25/28 in Math + Aptitude; this alone sets you ahead of 90% of candidates.',
            deliverable: 'Solve all 2000-2024 Math & Aptitude GATE questions with 90%+ accuracy.',
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Subject-Wise 25-Year PYQ Drill & Micro-Short Notes',
        tagline: 'Solve all Previous Year Questions 3 times and create 2-page formula summary sheets.',
        durationEstimate: 'Months 5 - 8',
        gradient: 'from-blue-700 to-indigo-700',
        badge: 'PYQ Drill & Revision',
        milestones: [
          {
            id: 'gt-2',
            title: 'Comprehensive Subject-Wise PYQ Solving Cycles',
            duration: '8 Weeks',
            description: 'Solve all single-mark and two-mark questions. Categorize mistakes into Conceptual, Calculation, or Misreading errors in a Mistake Notebook.',
            skills: ['PYQ Analysis', 'Mistake Diary Logging', 'Speed & Accuracy'],
            resources: [{ name: 'GateOverflow Discussion Platform', type: 'Practice' }],
            proTip: 'Maintain a physical Mistake Notebook where you rewrite every single question you solved incorrectly.',
            deliverable: 'Complete 3 full revision cycles across all core branch technical subjects.',
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Full-Length Mock Test Series & PSU Interview Preparation',
        tagline: 'Simulate the exact 3-hour exam environment and prepare for technical interview boards.',
        durationEstimate: 'Months 9 - 10',
        gradient: 'from-indigo-700 to-purple-800',
        badge: 'Test Series & PSU Prep',
        milestones: [
          {
            id: 'gt-3',
            title: '25+ Full-Length Mock Exams & Score Stabilization',
            duration: '6 Weeks',
            description: 'Simulate 9am-12pm or 2pm-5pm slots with virtual calculator. Analyze question selection strategy and negative mark reduction.',
            skills: ['Exam Temperament', 'Time Allocation', 'Negative Mark Reduction', 'PSU Technical Interviews'],
            resources: [{ name: 'Made Easy / ACE National Test Series', type: 'Practice' }],
            proTip: 'Never attempt questions with ambiguous 50-50 guesses; in GATE, negative marks ruin your AIR rank.',
            deliverable: 'Consistently achieve 75+ raw marks in national full-length mock exams.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'Master Technical Synthesis & Formula Compendium for GATE / PSU Interviews',
        level: 'Recruiter-Magnet',
        description: 'Comprehensive 80-page handwritten distilled formula booklet, concept derivations, and technical interview defense notes for BARC/ISRO/IOCL panels.',
        techStack: ['GATE PYQs', 'Virtual Calculator', 'Mistake Diary', 'Branch Formula Engine'],
        keyFeatures: [
          'Detailed conceptual derivations of all high-frequency formulas.',
          'Complete analysis of 100+ standard PSU interview technical panel questions.',
          'Time-management strategy matrix for 65 questions across 180 minutes.',
        ],
        resumeBulletExample: 'Achieved Top 1% percentile in National Mock Series through structured error-log iteration and 3-cycle PYQ mastery.',
      },
    ],
    certifications: [
      { name: 'GATE Qualified Scorecard (Target: AIR < 500)', issuer: 'IIT GATE Organising Committee', valueScore: 99 },
    ],
    nextModuleSuggestions: [
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Simulate PSU technical panel & HR viva interviews.' },
      { title: 'SWOT Gap Analysis', route: '/college/weak-topics', desc: 'Pinpoint weak subjects from your mock test scores.' },
      { title: 'PYQ Exam Analyzer', route: '/college/pyq-analyzer', desc: 'Analyze topic-wise frequency distributions.' },
    ],
  },

  'ui-ux-design': {
    id: 'ui-ux-design',
    domainId: 'ui-ux-design',
    title: 'Product UI/UX & Interaction Design Specialist',
    tagline: 'Figma design systems, UX research, wireframing, micro-interactions, and portfolio case studies.',
    salaryBands: {
      entry: '₹7 - 16 LPA',
      mid: '₹18 - 35 LPA',
      senior: '₹36 - 65+ LPA',
    },
    popularCompanies: ['CRED', 'Swiggy', 'Airbnb', 'Figma', 'Microsoft Design', 'Razorpay', 'Urban Company'],
    marketDemand: 'High',
    difficultyLevel: 'Moderate',
    estimatedMonths: 6,
    keyTools: ['Figma', 'FigJam', 'Framer', 'Protopie', 'Maze (User Testing)', 'Design Tokens'],
    pitfallsToAvoid: [
      'Dribbble syndrome: designing visually pretty screens that are impossible to use or code in real life.',
      'Lacking real case study narratives: recruiters care about your design rationale, user testing data, and business impact.',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Visual Design Foundations & Figma Mastery',
        tagline: 'Typography scales, 8pt spatial grid, color theory, Auto-Layout, and components.',
        durationEstimate: 'Weeks 1 - 6',
        gradient: 'from-fuchsia-600 to-pink-600',
        badge: 'Figma & Visuals',
        milestones: [
          {
            id: 'ux-1',
            title: 'Figma Auto-Layout, Variants & Design Systems',
            duration: '3 Weeks',
            description: 'Responsive constraints, nested Auto-Layout, component properties, variant states (hover, pressed, disabled), and WCAG color contrast.',
            skills: ['Figma Auto-Layout', 'Design Systems', 'Typography Hierarchy', 'WCAG Accessibility'],
            resources: [{ name: 'Refactoring UI by Adam Wathan & Steve Schoger', type: 'Book' }],
            proTip: 'Master 8pt spatial grids and never use random padding numbers like 13px or 27px.',
            deliverable: 'Complete multi-component design system with buttons, inputs, modals, and dark/light mode tokens.',
          },
        ],
      },
    ],
    capstoneProjects: [
      {
        title: 'End-to-End Fintech Mobile App UX Case Study & Framer Portfolio',
        level: 'Recruiter-Magnet',
        description: 'Complete zero-to-one product design case study including user research, wireframes, interactive prototype, usability testing, and live Framer site.',
        techStack: ['Figma', 'Framer', 'FigJam', 'Maze', 'Protopie'],
        keyFeatures: [
          'Tested with 15 real users showing 35% reduction in onboarding time.',
          'High-fidelity micro-interactions and animated state transitions.',
          'Live interactive case study published on custom domain.',
        ],
        resumeBulletExample: 'Designed end-to-end investment mobile app in Figma & Framer; conducted usability tests with 15 participants, achieving 92% task completion rate.',
      },
    ],
    certifications: [
      { name: 'Google UX Design Professional Certificate', issuer: 'Google / Coursera', valueScore: 90 },
      { name: 'Nielsen Norman Group (NN/g) UX Master Certified', issuer: 'NN/g', valueScore: 95 },
    ],
    nextModuleSuggestions: [
      { title: 'ATS Resume Analyzer', route: '/college/resume-analyzer', desc: 'Tailor your design portfolio and resume.' },
      { title: 'Tech & HR Interview Simulator', route: '/college/interview-prep', desc: 'Prepare for portfolio walkthrough and design critiques.' },
    ],
  },
};

// --- Dynamic Roadmap Customizer Engine ---
export function generateCustomizedRoadmap(
  domainId: DomainId,
  branchId: string,
  yearId: string,
  goalId: string,
  customGoalText?: string
): RoleRoadmap {
  const base = ROADMAP_DATABASE[domainId] || ROADMAP_DATABASE['swe-fullstack'];
  
  // Clone to avoid mutating static database
  const customized: RoleRoadmap = JSON.parse(JSON.stringify(base));

  if (customGoalText && customGoalText.trim().length > 0) {
    customized.title = `${customGoalText.trim()} (${customized.title})`;
  }

  // Adjust tagline & advice according to academic year
  if (yearId === '1st-year') {
    customized.tagline = `[1st Year Fresh Start Track] Build rock-solid foundational programming, math, and core concepts before advancing. ${customized.tagline}`;
  } else if (yearId === '3rd-year') {
    customized.tagline = `[3rd Year Internship Track] Prioritize high-impact capstone projects, DSA consistency, and resume building for upcoming campus placement drives. ${customized.tagline}`;
  } else if (yearId === '4th-year' || yearId === 'graduated') {
    customized.tagline = `[Fast-Track Placement Sprint] Accelerated milestone trajectory focused on high-yield interview questions, active portfolio deployment, and off-campus referrals. ${customized.tagline}`;
  }

  return customized;
}
