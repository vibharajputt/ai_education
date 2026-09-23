// src/modules/interview-prep/services/questionBank.ts
// Comprehensive authentic role-based questions across Technical, Scenario, and HR Behavioral sections.

export type TargetRole =
  | 'sde'
  | 'data-ai'
  | 'devops-cloud'
  | 'core-ece'
  | 'product-pm'
  | 'custom';

export type InterviewRound = 'technical' | 'scenario' | 'behavioral' | 'full';

export interface QuizQuestion {
  id: string;
  section: 'Technical Core' | 'Problem Solving & Scenarios' | 'HR & Behavioral STAR';
  title: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  starGuide?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keyTakeaways: string[];
  idealAnswer?: string;
  evalCriteria: string;
  skillTag: string;
}

export interface RoleConfig {
  id: TargetRole;
  title: string;
  subtitle: string;
  icon: string;
  popularCompanies: string[];
  gradient: string;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'sde',
    title: 'Software Development Engineer (SDE)',
    subtitle: 'Fullstack, Backend & Frontend Roles (DSA, System Design, OOPs & APIs)',
    icon: 'Code2',
    popularCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Uber'],
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'data-ai',
    title: 'Data Science & AI / ML Engineer',
    subtitle: 'Machine Learning, PyTorch, SQL, Statistics & LLM Architectures',
    icon: 'Brain',
    popularCompanies: ['OpenAI', 'Meta', 'NVIDIA', 'Adobe', 'Fractal'],
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud SRE Engineer',
    subtitle: 'Docker, Kubernetes, AWS/GCP, CI/CD Pipelines & Linux Internals',
    icon: 'Cloud',
    popularCompanies: ['Red Hat', 'AWS', 'Atlassian', 'Oracle', 'Cisco'],
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'core-ece',
    title: 'Core Electronics & Embedded Systems',
    subtitle: 'VLSI, Microcontrollers, RTOS, Signals, Verilog & Circuit Design',
    icon: 'Cpu',
    popularCompanies: ['Qualcomm', 'Intel', 'Texas Instruments', 'AMD', 'NXP'],
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    id: 'product-pm',
    title: 'Product & Tech Management Associate',
    subtitle: 'Product Sense, Metrics, RCA, System Trade-offs & Stakeholder Leadership',
    icon: 'Briefcase',
    popularCompanies: ['Swiggy', 'Zomato', 'Paytm', 'McKinsey', 'Bain'],
    gradient: 'from-emerald-600 to-teal-600',
  },
];

export function getRoleQuestions(role: TargetRole, round: InterviewRound): QuizQuestion[] {
  const allRolePool: Record<TargetRole, QuizQuestion[]> = {
    sde: [
      // ── SECTION 1: TECHNICAL CORE ──────────────────────────────────────
      {
        id: 'sde-tech-01',
        section: 'Technical Core',
        title: 'LRU Cache Time Complexity Architecture',
        question: 'Which combination of data structures achieves both O(1) get(key) and O(1) put(key, value) in an LRU (Least Recently Used) cache?',
        options: [
          'Binary Search Tree + Array',
          'Hash Map + Doubly Linked List',
          'Min Heap + Singly Linked List',
          'Trie + Circular Queue',
        ],
        correctOptionIndex: 1,
        explanation: 'A Hash Map provides O(1) lookup of node pointers, while a Doubly Linked List allows O(1) node removal, head-promotions, and tail-evictions without shifting elements.',
        keyTakeaways: [
          'Hash Map maps key -> Doubly Linked Node pointer in O(1)',
          'Doubly Linked List updates pointers in O(1) upon cache hit',
          'Least recently used item is evicted from tail in O(1)',
        ],
        idealAnswer: 'Combine a Hash Map with a Doubly Linked List. When an item is accessed, the hash map locates its node in O(1), which is detached and moved to the head.',
        evalCriteria: 'Evaluates understanding of composite data structures and pointer manipulation.',
        skillTag: 'Data Structures & Algorithms',
      },
      {
        id: 'sde-tech-02',
        section: 'Technical Core',
        title: 'Database Concurrency & Isolation',
        question: 'Under what specific workload profile is Optimistic Concurrency Control (OCC) mathematically superior to 2-Phase Pessimistic Locking?',
        options: [
          'High write-contention with frequent deadlocks',
          'Read-heavy workloads with very low conflict probability',
          'Financial real-time ledger balance deductions',
          'Batch updating large unindexed tables',
        ],
        correctOptionIndex: 1,
        explanation: 'OCC avoids locking overhead by validating version timestamps at commit time. If writes rarely collide, throughput is significantly higher with zero locking wait times.',
        keyTakeaways: [
          'OCC validates version numbers before committing',
          'Zero locking overhead on read operations',
          'Pessimistic locking is preferred when collisions are frequent to avoid commit aborts',
        ],
        idealAnswer: 'OCC is optimal for read-heavy workloads with low write collisions because transactions read without acquiring locks and only validate versions at commit time.',
        evalCriteria: 'Evaluates transactional integrity, ACID properties, and database scaling intuition.',
        skillTag: 'Database Systems',
      },

      // ── SECTION 2: SCENARIOS & SYSTEM DESIGN ───────────────────────────
      {
        id: 'sde-scen-01',
        section: 'Problem Solving & Scenarios',
        title: 'Distributed Rate Limiter Design',
        question: 'You are designing a distributed rate limiter for an API processing 500,000 requests/sec. To prevent race conditions across multiple server nodes, what is the industry-standard architecture?',
        options: [
          'Global SQL Transaction with Serializable isolation',
          'Redis Cluster using Lua script executing Sliding Window Counter',
          'Local in-memory HashMap on each web server instance',
          'RabbitMQ FIFO Queue with single worker consumer',
        ],
        correctOptionIndex: 1,
        explanation: 'Redis executes Lua scripts atomically in a single event-loop cycle, preventing concurrency race conditions across thousands of distributed server instances.',
        keyTakeaways: [
          'Redis Lua scripts execute atomically with microsecond latency',
          'Sliding Window Log/Counter avoids burst boundary exploits',
          'Local memory counters drift across auto-scaled nodes',
        ],
        idealAnswer: 'Implement a Sliding Window Counter in a Redis cluster using atomic Lua scripts. The script checks timestamps and increments counts atomically without separate lock acquisitions.',
        evalCriteria: 'Evaluates distributed systems, atomic execution, and high-throughput scalability.',
        skillTag: 'System Design & Distributed Systems',
      },
      {
        id: 'sde-scen-02',
        section: 'Problem Solving & Scenarios',
        title: 'Microservices Idempotency & Duplicate Requests',
        question: 'A user accidentally clicks "Pay Now" multiple times due to a slow network. How do you guarantee the payment service charges the user only once?',
        options: [
          'Disable the button on the frontend UI only',
          'Generate a unique Idempotency-Key on client and check/store it in an atomic Redis/DB cache with distributed locks',
          'Use TCP retries to discard second packet',
          'Increase server CPU cores to process requests faster',
        ],
        correctOptionIndex: 1,
        explanation: 'Client-generated UUID idempotency keys stored in an atomic cache with an active lock ensure that subsequent identical requests receive the cached result instead of re-executing payment.',
        keyTakeaways: [
          'Never rely solely on UI button disabling',
          'Client provides Idempotency-Key header on mutation requests',
          'Database unique constraint or atomic Redis setnx guarantees single execution',
        ],
        idealAnswer: 'Generate a unique idempotency key on the client. The backend uses an atomic conditional insert to lock the key, executes payment once, and caches the response for identical subsequent requests.',
        evalCriteria: 'Evaluates resilience, network failure handling, and idempotent API design.',
        skillTag: 'API Architecture & Reliability',
      },

      // ── SECTION 3: HR & BEHAVIORAL STAR ────────────────────────────────
      {
        id: 'sde-hr-01',
        section: 'HR & Behavioral STAR',
        title: 'Handling Technical Disagreement with Senior Engineers',
        question: 'Tell me about a situation where you had a strong technical disagreement with a team member or senior engineer. How did you resolve it?',
        starGuide: {
          situation: 'A senior engineer insisted on using a synchronous REST pipeline for a high-load notification engine, whereas I proposed an async Kafka event queue.',
          task: 'Prove the performance bottleneck objectively without creating friction or defensive confrontation.',
          action: 'Built a quick benchmark prototype using k6. Presented data showing synchronous calls timed out under 5k concurrent users, while Kafka stayed sub-50ms.',
          result: 'The senior engineer praised the objective benchmark and adopted the Kafka architecture, achieving 99.99% delivery reliability during peak sales.',
        },
        keyTakeaways: [
          'Always use objective data & benchmark prototypes rather than ego arguments',
          'Disagree and commit constructively',
          'Highlight measurable impact and mutual team alignment',
        ],
        idealAnswer: 'Structure using STAR: 1. Situation (context of decision), 2. Task (your objective), 3. Action (data-backed prototyping, open dialogue), 4. Result (production outcome).',
        evalCriteria: 'Evaluates emotional intelligence, collaborative resolution, and data-driven communication.',
        skillTag: 'Behavioral & Leadership (STAR)',
      },
    ],

    'data-ai': [
      {
        id: 'ai-tech-01',
        section: 'Technical Core',
        title: 'Mitigating Vanishing Gradients in Deep Neural Networks',
        question: 'Which of the following techniques directly mitigates the vanishing gradient problem in deep feedforward and residual networks?',
        options: [
          'Using Sigmoid activation functions throughout all hidden layers',
          'Residual Skip Connections + He/Xavier Normal Initialization + Layer Normalization',
          'Decreasing batch size to 1 without gradient clipping',
          'Increasing model depth without normalization',
        ],
        correctOptionIndex: 1,
        explanation: 'Residual skip connections allow gradients to flow directly through identity shortcuts without continuous exponential decay during backpropagation.',
        keyTakeaways: [
          'Skip connections (ResNet) provide highway gradients: d(x + F(x))/dx = 1 + F\'(x)',
          'ReLU/GELU prevents gradient saturation in positive regimes',
          'LayerNorm stabilizes activation distributions across layers',
        ],
        idealAnswer: 'Use Residual Skip Connections alongside ReLU/GELU activations and Batch/Layer Normalization to allow uninterrupted gradient backpropagation.',
        evalCriteria: 'Evaluates deep learning mathematical fundamentals and network architecture choices.',
        skillTag: 'Deep Learning & Neural Networks',
      },
      {
        id: 'ai-scen-01',
        section: 'Problem Solving & Scenarios',
        title: 'Handling Extreme Class Imbalance in Fraud Detection',
        question: 'You are training a model on credit card fraud where 99.9% of transactions are legitimate and 0.1% are fraudulent. Why is accuracy a misleading metric, and what should you optimize?',
        options: [
          'Accuracy is optimal; optimize Cross-Entropy loss directly',
          'A naive baseline predicting legitimate achieves 99.9% accuracy; optimize PR-AUC (Precision-Recall Area Under Curve) and F1-Score with Focal Loss / SMOTE',
          'Downsample dataset to 10 samples total',
          'Switch to simple linear regression',
        ],
        correctOptionIndex: 1,
        explanation: 'In highly imbalanced datasets, a dummy classifier predicting the majority class gets 99.9% accuracy. PR-AUC and Recall focus specifically on minority class capture.',
        keyTakeaways: [
          'ROC-AUC can be over-optimistic when negatives vastly outnumber positives',
          'PR-AUC focuses directly on true positive captures versus false alarms',
          'Focal Loss dynamically down-weights easy negative examples during training',
        ],
        idealAnswer: 'A model predicting 100% negative achieves 99.9% accuracy but catches zero fraud. Optimize PR-AUC and Recall using Focal Loss or cost-sensitive class weights.',
        evalCriteria: 'Evaluates real-world ML evaluation metrics and metric selection trade-offs.',
        skillTag: 'ML Model Evaluation & Production Metrics',
      },
      {
        id: 'ai-hr-01',
        section: 'HR & Behavioral STAR',
        title: 'Explaining Complex AI Decisions to Non-Technical Stakeholders',
        question: 'How do you explain a complex black-box Machine Learning prediction (e.g., loan approval or fraud flag) to a non-technical product manager or regulatory auditor?',
        starGuide: {
          situation: 'Our credit risk XGBoost model flagged loan rejections, and business managers requested clear justification for customer communication.',
          task: 'Translate feature weights into interpretable, compliance-ready explanations without overwhelming the business team with mathematical jargon.',
          action: 'Implemented SHAP (SHapley Additive exPlanations) waterfall plots and created a simple dashboard translating top positive/negative feature contributions into plain language.',
          result: 'Reduced customer dispute resolution time by 60% and passed regulatory compliance audit with zero violations.',
        },
        keyTakeaways: [
          'Use explainability frameworks like SHAP or LIME',
          'Avoid mathematical jargon when speaking to business leaders',
          'Frame model outputs around business risk and customer impact',
        ],
        idealAnswer: 'Use SHAP feature attribution to explain the top driving factors in simple business terms (e.g. debt-to-income ratio) rather than abstract weight vectors.',
        evalCriteria: 'Evaluates communication clarity, empathy, and bridging technical complexity with business needs.',
        skillTag: 'Behavioral & Stakeholder Communication',
      },
    ],

    'devops-cloud': [
      {
        id: 'ops-tech-01',
        section: 'Technical Core',
        title: 'Kubernetes Pod Lifecycle & Probes',
        question: 'What is the fundamental difference between a Kubernetes `livenessProbe` and a `readinessProbe`?',
        options: [
          'They perform identical actions and can be used interchangeably',
          '`livenessProbe` restarts failed containers; `readinessProbe` removes unhealthy pods from receiving Service traffic without killing them',
          '`readinessProbe` restarts the entire cluster node',
          '`livenessProbe` only checks CPU usage',
        ],
        correctOptionIndex: 1,
        explanation: 'Liveness probes detect deadlocks and crash-loops (triggering a container restart). Readiness probes detect temporary unreadiness (e.g. warming caches) and isolate the pod from traffic.',
        keyTakeaways: [
          'Liveness: Failed -> Container Restart (Crash recovery)',
          'Readiness: Failed -> Pod removed from Endpoints (No downtime during warmup)',
          'Startup Probe: Protects slow-starting legacy apps from early liveness kills',
        ],
        idealAnswer: 'Liveness probes restart unresponsive containers, while readiness probes stop routing service traffic to pods that are still warming up or temporarily overloaded.',
        evalCriteria: 'Evaluates container orchestration, high-availability architecture, and zero-downtime deployment.',
        skillTag: 'Kubernetes & Container Orchestration',
      },
      {
        id: 'ops-scen-01',
        section: 'Problem Solving & Scenarios',
        title: 'Zero-Downtime Database Migration in Blue-Green Deployments',
        question: 'You need to rename a high-traffic database column in production without incurring downtime. What is the correct multi-phase pattern?',
        options: [
          'Run ALTER TABLE RENAME COLUMN directly during peak hours',
          'Expand & Contract Pattern: 1. Add new column, 2. Dual-write to both, 3. Backfill data, 4. Switch reads to new column, 5. Drop old column',
          'Shut down the web servers for 30 minutes',
          'Delete database and restore from night backup',
        ],
        correctOptionIndex: 1,
        explanation: 'The Expand and Contract (Parallel Change) pattern decouples database migrations from application deployments, ensuring backward and forward compatibility at every phase.',
        keyTakeaways: [
          'Never execute breaking DDL schema modifications in a single step',
          'Dual-write ensures data parity across old and new schema',
          'Contract phase safely removes deprecated columns after all code is upgraded',
        ],
        idealAnswer: 'Use Expand-and-Contract: Add the new column, dual-write to both, backfill legacy rows, transition read queries to the new column, and finally delete the old column.',
        evalCriteria: 'Evaluates production safety, database migration workflows, and zero-downtime discipline.',
        skillTag: 'Cloud Architecture & CI/CD Safety',
      },
      {
        id: 'ops-hr-01',
        section: 'HR & Behavioral STAR',
        title: 'Managing Production Incidents & Blameless Post-Mortems',
        question: 'Describe an experience where a production service went down under your watch. How did you handle the outage and subsequent post-mortem?',
        starGuide: {
          situation: 'A sudden memory leak in a newly released microservice caused gateway pods to OOM-kill, dropping 15% of user traffic.',
          task: 'Restore traffic within SLA and prevent recurrence without assigning individual blame.',
          action: 'Immediately rolled back to the previous stable release via Helm in under 3 minutes. Led a blameless post-mortem analyzing the heap dump, discovering an unclosed HTTP connection pool.',
          result: 'Implemented automated load-test canary checks in CI/CD and fixed the connection leak, preventing similar regression permanently.',
        },
        keyTakeaways: [
          'Mitigate first, debug later (Speed of rollback is king)',
          'Blameless culture focuses on system vulnerabilities, not human finger-pointing',
          'Action items must include automated preventative guardrails in CI/CD',
        ],
        idealAnswer: 'Prioritize rapid mitigation via rollback, communicate transparently during the outage, and lead a blameless post-mortem that adds automated guardrails to CI/CD.',
        evalCriteria: 'Evaluates incident management, poise under pressure, and continuous improvement.',
        skillTag: 'Behavioral & SRE Mindset',
      },
    ],

    'core-ece': [
      {
        id: 'ece-tech-01',
        section: 'Technical Core',
        title: 'Setup & Hold Time Violations in Digital Circuits',
        question: 'What is the primary cause of a Setup Time violation in synchronous sequential logic, and how is it resolved?',
        options: [
          'Clock frequency is too slow; increase frequency',
          'Combinational logic path delay between flip-flops exceeds clock period; resolved by pipelining, logic optimization, or lowering clock frequency',
          'Capacitance is too low',
          'Ground bounce on reset pin',
        ],
        correctOptionIndex: 1,
        explanation: 'Setup time requires data to remain stable before the clock edge. If the combinational propagation delay is too long, the data arrives late, violating $T_{cq} + T_{comb} + T_{setup} \\le T_{clk}$.',
        keyTakeaways: [
          'Setup violation formula: T_cq + T_comb + T_setup <= T_clk + T_skew',
          'Fixed by breaking long combinational paths with pipeline registers',
          'Hold time is independent of clock frequency and fixed by adding buffer delays',
        ],
        idealAnswer: 'A setup violation occurs when data arrives too late at the receiving flip-flop. Resolve by pipelining long combinational paths, optimizing logic gates, or reducing clock frequency.',
        evalCriteria: 'Evaluates VLSI timing constraints, STA (Static Timing Analysis), and digital circuit design.',
        skillTag: 'Digital Design & VLSI Timing',
      },
      {
        id: 'ece-scen-01',
        section: 'Problem Solving & Scenarios',
        title: 'Debouncing Mechanical Switches in Embedded Systems',
        question: 'When reading a mechanical push-button input on an STM32/Arduino microcontroller, why is software or hardware debouncing required?',
        options: [
          'Mechanical switches consume excessive battery power',
          'Mechanical contacts physically vibrate and create dozens of spurious voltage transitions over 5–20 ms, which the MCU registers as multiple rapid clicks',
          'To protect the microcontroller from 230V AC spikes',
          'To invert active-low signals into active-high',
        ],
        correctOptionIndex: 1,
        explanation: 'Mechanical contact bounce creates oscillating voltage spikes for 5-20 milliseconds. Software debouncing (timer polling / state machine) or hardware RC filters filter this noise.',
        keyTakeaways: [
          'Mechanical bounce lasts 5-20ms and triggers false interrupts',
          'Software debouncing uses timer sampling state machines',
          'Hardware debouncing uses an RC low-pass filter with Schmitt Trigger',
        ],
        idealAnswer: 'Physical contacts bounce for 5–20ms when pressed. Debouncing uses software timers (e.g. 20ms confirmation delay) or hardware RC filters to register exactly one clean transition.',
        evalCriteria: 'Evaluates embedded hardware-software interfacing and signal conditioning.',
        skillTag: 'Embedded Systems & Signal Conditioning',
      },
      {
        id: 'ece-hr-01',
        section: 'HR & Behavioral STAR',
        title: 'Handling Hardware Debugging Deadlines with Component Shortages',
        question: 'Tell me about a project where you faced unexpected hardware failure or component unavailability close to a critical milestone.',
        starGuide: {
          situation: 'During our final semester capstone autonomous drone demo, the primary IMU gyro sensor blew due to a power spike 48 hours before evaluation.',
          task: 'Revive telemetry navigation without waiting 2 weeks for an identical overseas sensor delivery.',
          action: 'Sourced an alternative generic I2C sensor from a local lab, rewrote the register read driver in C, and recalibrated the complementary sensor fusion filter overnight.',
          result: 'The drone successfully demonstrated autonomous waypoint hovering on demo day, earning the Best Capstone Project award.',
        },
        keyTakeaways: [
          'Demonstrate resourcefulness and hardware adaptability under pressure',
          'Comfortable digging into raw C register drivers and datasheets',
          'Prioritize core deliverables to meet hard deadlines',
        ],
        idealAnswer: 'Highlight resourcefulness: analyze datasheets, adapt available components, rewrite firmware drivers, and validate thoroughly to meet milestone deadlines.',
        evalCriteria: 'Evaluates practical grit, hardware adaptability, and problem solving.',
        skillTag: 'Behavioral & Practical Engineering Grit',
      },
    ],

    'product-pm': [
      {
        id: 'pm-tech-01',
        section: 'Technical Core',
        title: 'Diagnosing Drop-offs in E-commerce Funnel Metrics',
        question: 'Your e-commerce app experiences a sudden 25% drop in checkout conversion rate on Tuesday morning. What is your systematic Root Cause Analysis (RCA) framework?',
        options: [
          'Immediately redesign the entire app homepage',
          '1. Verify telemetry integrity, 2. Segment by platform (iOS/Android/Web), app version & geography, 3. Check payment gateway error codes & recent backend deployments, 4. Reproduce live checkout flow',
          'Send mass promotional discount coupons to all users',
          'Fire the marketing team',
        ],
        correctOptionIndex: 1,
        explanation: 'A structured product RCA isolates external vs internal factors by segmenting users, checking release logs, verifying gateway status, and confirming analytics telemetry integrity.',
        keyTakeaways: [
          'Never jump to conclusions without data segmentation',
          'Segment by OS version, app release build, payment gateway, and region',
          'Correlate metric drops with engineering deployment timestamps',
        ],
        idealAnswer: 'Follow structured RCA: check tracking instrumentation, segment by device/release/region, correlate with engineering deployment logs, inspect payment gateway errors, and reproduce.',
        evalCriteria: 'Evaluates product analytical rigor, telemetry diagnosis, and structured thinking.',
        skillTag: 'Product Analytics & Root Cause Analysis',
      },
      {
        id: 'pm-scen-01',
        section: 'Problem Solving & Scenarios',
        title: 'Feature Prioritization using RICE Framework',
        question: 'You have engineering bandwidth for only 1 of 3 proposed features. How does the RICE framework objectively prioritize them?',
        options: [
          'Choose the feature proposed by the CEO',
          'Calculate Score = (Reach x Impact x Confidence) / Effort, selecting the highest return-on-investment feature',
          'Choose whichever feature has the coolest UI design',
          'Split the engineering team into 3 parts and build all half-baked',
        ],
        correctOptionIndex: 1,
        explanation: 'RICE (Reach, Impact, Confidence, Effort) provides an objective numerical score balancing potential value against engineering cost and estimation risk.',
        keyTakeaways: [
          'Reach: Number of users impacted per time period',
          'Impact: Value delivered (e.g. 3 = massive, 1 = medium)',
          'Confidence: Percentage certainty in estimations',
          'Effort: Person-months of engineering investment',
        ],
        idealAnswer: 'Score = (Reach * Impact * Confidence) / Effort. This prevents personal bias by balancing user reach and business impact against required engineering person-months.',
        evalCriteria: 'Evaluates product prioritization frameworks, trade-offs, and ROI optimization.',
        skillTag: 'Product Strategy & Prioritization',
      },
      {
        id: 'pm-hr-01',
        section: 'HR & Behavioral STAR',
        title: 'Influencing Engineering Teams without Direct Authority',
        question: 'Product managers have no direct managerial authority over engineers. How do you motivate and align an engineering team behind a tight release deadline?',
        starGuide: {
          situation: 'Engineers felt disconnected from a business-critical onboarding redesign and resisted the scope due to technical debt concerns.',
          task: 'Align engineering on the business rationale while respecting their architectural health concerns.',
          action: 'Organized a collaborative sprint workshop sharing customer video interviews showing checkout confusion. Negotiated a 20% dedicated allocation for refactoring technical debt in exchange for delivering key onboarding MVP features.',
          result: 'Shipped the onboarding MVP on time, increasing signup conversion by 18% while refactoring legacy auth modules.',
        },
        keyTakeaways: [
          'Lead with context, customer empathy, and user data rather than orders',
          'Respect engineering technical debt and negotiate fair compromises',
          'Celebrate engineering wins and maintain open architectural dialogue',
        ],
        idealAnswer: 'Bring the "Why" to engineers using user video evidence and metric goals, and actively allocate sprint bandwidth to resolve their technical debt in exchange for business milestones.',
        evalCriteria: 'Evaluates influence without authority, stakeholder negotiation, and cross-functional empathy.',
        skillTag: 'Behavioral & Cross-Functional Influence',
      },
    ],

    custom: [],
  };

  const pool = allRolePool[role] && allRolePool[role].length > 0 ? allRolePool[role] : allRolePool.sde;

  if (round === 'technical') {
    return pool.filter((q) => q.section === 'Technical Core');
  }
  if (round === 'scenario') {
    return pool.filter((q) => q.section === 'Problem Solving & Scenarios');
  }
  if (round === 'behavioral') {
    return pool.filter((q) => q.section === 'HR & Behavioral STAR');
  }

  return pool;
}
