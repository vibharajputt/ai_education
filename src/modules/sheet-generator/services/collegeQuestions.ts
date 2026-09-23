// src/modules/sheet-generator/services/collegeQuestions.ts
import type { ContentItem, Difficulty, QuestionType } from '@core';

export interface CollegeTemplatePreset {
  id: string;
  name: string;
  subtitle: string;
  defaultTitle: string;
  defaultInstitution: string;
  defaultTimeMinutes: number;
  defaultMarks: number;
  defaultCount: number;
  chapters: string[];
  difficulties: Difficulty[];
  questionTypes: QuestionType[];
}

export const COLLEGE_PRESETS: CollegeTemplatePreset[] = [
  {
    id: 'campus-placement',
    name: 'Campus Placement & Aptitude Test',
    subtitle: 'TCS NQT, Infosys, Amazon & Tier-1 Assessment Format (DSA + Core + Aptitude)',
    defaultTitle: 'National Campus Placement Assessment & Technical Drill',
    defaultInstitution: 'Center for Placement Training & Corporate Readiness',
    defaultTimeMinutes: 60,
    defaultMarks: 50,
    defaultCount: 12,
    chapters: [
      'Data Structures & Algorithms',
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Operating Systems',
      'Database Management (SQL)',
      'Object-Oriented Programming (Java/C++)',
    ],
    difficulties: ['easy', 'medium', 'hard'],
    questionTypes: ['mcq', 'short'],
  },
  {
    id: 'semester-exam',
    name: 'B.Tech University Semester Exam',
    subtitle: 'Mid-Sem / End-Sem Paper with 2-mark, 5-mark & 10-mark Step Marking Scheme',
    defaultTitle: 'B.Tech End-Semester Examination: Core Computer Science & Engg',
    defaultInstitution: 'Department of Computer Science & Engineering, Technical University',
    defaultTimeMinutes: 90,
    defaultMarks: 75,
    defaultCount: 10,
    chapters: [
      'Data Structures & Algorithms',
      'Database Management (SQL)',
      'Operating Systems',
      'Computer Networks',
      'System Design & Distributed Systems',
    ],
    difficulties: ['medium', 'hard'],
    questionTypes: ['short', 'long', 'mcq'],
  },
  {
    id: 'gate-drill',
    name: 'GATE Technical Mock Drill',
    subtitle: 'GATE CSE / ECE Sectional Mock Paper with MCQs & NAT Numericals',
    defaultTitle: 'GATE National Sectional Mock: Algorithms, OS & Discrete Math',
    defaultInstitution: 'All India GATE Technical Assessment Forum',
    defaultTimeMinutes: 60,
    defaultMarks: 40,
    defaultCount: 15,
    chapters: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Computer Networks',
      'Engineering Mathematics & Discrete Math',
      'Digital Logic & Microprocessors',
    ],
    difficulties: ['medium', 'hard'],
    questionTypes: ['mcq', 'short'],
  },
  {
    id: 'ai-ml-specialist',
    name: 'AI, Data Science & GenAI Assessment',
    subtitle: 'Machine Learning, PyTorch, RAG Pipelines & Math Evaluation',
    defaultTitle: 'Applied Machine Learning & Generative AI Technical Test',
    defaultInstitution: 'School of Artificial Intelligence & Advanced Computing',
    defaultTimeMinutes: 45,
    defaultMarks: 35,
    defaultCount: 8,
    chapters: [
      'Machine Learning Foundations',
      'Deep Learning & PyTorch',
      'Generative AI & LLMs',
      'Probability, Statistics & Linear Algebra',
    ],
    difficulties: ['medium', 'hard'],
    questionTypes: ['mcq', 'short', 'long'],
  },
  {
    id: 'core-ece-embedded',
    name: 'Core ECE & Embedded Systems Paper',
    subtitle: 'Microcontrollers, ARM, RTOS, Verilog HDL & Communication Protocols',
    defaultTitle: 'Embedded Systems & Digital VLSI Examination Sheet',
    defaultInstitution: 'Department of Electronics & Communication Engineering',
    defaultTimeMinutes: 60,
    defaultMarks: 50,
    defaultCount: 10,
    chapters: [
      'Microcontrollers & ARM Architecture',
      'Real-Time Operating Systems (RTOS)',
      'Digital Electronics & Verilog HDL',
      'Communication Protocols (UART/SPI/I2C/CAN)',
    ],
    difficulties: ['medium', 'hard'],
    questionTypes: ['mcq', 'short', 'long'],
  },
];

const RAW_COLLEGE_QUESTION_POOL: any[] = [
  // ── DATA STRUCTURES & ALGORITHMS ──────────────────────────────────────────
  {
    id: 'col-dsa-001',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Data Structures & Algorithms',
    concepts: ['Two Pointers', 'Array Optimization', 'Time Complexity'],
    body: 'Given an array of integers sorted in ascending order and a target integer `k`, what is the optimal time and auxiliary space complexity to find if there exist two elements whose sum equals `k` using the Two-Pointer technique?',
    difficulty: 'easy',
    tags: ['dsa', 'arrays', 'two-pointers', 'faang'],
    metadata: {
      questionType: 'mcq',
      options: [
        'O(N^2) Time, O(1) Space',
        'O(N log N) Time, O(N) Space',
        'O(N) Time, O(1) Auxiliary Space',
        'O(log N) Time, O(N) Space',
      ],
      correctOptionIndex: 2,
      marks: 2,
      solution:
        'Because the array is already sorted, placing one pointer at index 0 (left) and one at index N-1 (right) allows moving inwards in a single pass. At each step, if sum < target, left++; if sum > target, right--; if sum == target, return true. Hence Time = O(N) and Space = O(1).',
      markingScheme: [
        '1 Mark: Identifying the Two-Pointer convergence property',
        '1 Mark: Correct asymptotic bounds O(N) and O(1)',
      ],
    },
  },
  {
    id: 'col-dsa-002',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Data Structures & Algorithms',
    concepts: ['Binary Search Tree', 'Inorder Traversal', 'Tree Properties'],
    body: 'Which tree traversal algorithm produces elements of a Binary Search Tree (BST) in strictly sorted ascending order?',
    difficulty: 'easy',
    tags: ['dsa', 'bst', 'trees', 'campus-placement'],
    metadata: {
      questionType: 'mcq',
      options: [
        'Preorder Traversal (Root, Left, Right)',
        'Inorder Traversal (Left, Root, Right)',
        'Postorder Traversal (Left, Right, Root)',
        'Level-Order Traversal (Breadth-First Search)',
      ],
      correctOptionIndex: 1,
      marks: 2,
      solution:
        'By definition of a BST, for every node, all keys in the left subtree are smaller and all keys in the right subtree are larger. Inorder traversal visits (Left, Root, Right), which systematically traverses all nodes in ascending order.',
    },
  },
  {
    id: 'col-dsa-003',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Data Structures & Algorithms',
    concepts: ['Dynamic Programming', '0/1 Knapsack', 'State Transition'],
    body: 'In the classic 0/1 Knapsack problem with N items and maximum weight capacity W: (a) Formulate the dynamic programming recurrence relation for `dp[i][w]`. (b) Explain why the greedy fractional knapsack strategy fails on the 0/1 constraint with a counterexample.',
    difficulty: 'medium',
    tags: ['dsa', 'dp', 'knapsack', 'semester-exam'],
    metadata: {
      questionType: 'short',
      marks: 5,
      solution:
        '(a) Recurrence: dp[i][w] = dp[i-1][w] if weight[i] > w; otherwise max(dp[i-1][w], val[i] + dp[i-1][w - weight[i]]). Base condition: dp[0][w] = 0 and dp[i][0] = 0. (b) In 0/1 Knapsack, items cannot be subdivided. Counterexample: Capacity W=50. Item 1 (v=60, w=10, ratio=6), Item 2 (v=100, w=20, ratio=5), Item 3 (v=120, w=30, ratio=4). Greedy by ratio takes Item 1 & 2 (weight=30, value=160). But taking Item 2 & 3 yields weight=50 with value=220, outperforming greedy.',
      markingScheme: [
        '2 Marks: Correct DP state formulation & base cases',
        '3 Marks: Rigorous counterexample showing greedy suboptimal choice',
      ],
    },
  },
  {
    id: 'col-dsa-004',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Data Structures & Algorithms',
    concepts: ['Graph Algorithms', 'Dijkstra', 'Negative Cycles'],
    body: 'Why does Dijkstra\'s Single Source Shortest Path algorithm fail on graphs with negative weight edges? Which algorithm should be utilized instead to detect negative weight cycles in O(V * E) time?',
    difficulty: 'hard',
    tags: ['dsa', 'graphs', 'dijkstra', 'bellman-ford', 'gate'],
    metadata: {
      questionType: 'short',
      marks: 4,
      solution:
        'Dijkstra\'s algorithm relies on a Greedy assumption: once a vertex is removed from the priority queue (visited), its shortest path distance is permanently finalized. A negative weight edge encountered later can offer a shorter path to an already finalized vertex, invalidating previous distances. The Bellman-Ford algorithm should be used instead, running V-1 relaxation passes over all edges in O(V*E) time and detecting negative cycles on the V-th pass.',
      markingScheme: [
        '2 Marks: Explanation of greedy finalization violation with negative edges',
        '2 Marks: Identification of Bellman-Ford algorithm and O(V*E) complexity',
      ],
    },
  },

  // ── OPERATING SYSTEMS ─────────────────────────────────────────────────────
  {
    id: 'col-os-001',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Operating Systems',
    concepts: ['Deadlock', 'Coffman Conditions', 'Banker Algorithm'],
    body: 'Which of the following is NOT one of the four necessary Coffman conditions required for a Deadlock to occur in an operating system?',
    difficulty: 'easy',
    tags: ['os', 'deadlock', 'gate', 'campus-placement'],
    metadata: {
      questionType: 'mcq',
      options: [
        'Mutual Exclusion',
        'Hold and Wait',
        'Preemptive Resource Allocation',
        'Circular Wait',
      ],
      correctOptionIndex: 2,
      marks: 2,
      solution:
        'The four Coffman conditions are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption (resources CANNOT be forcibly preempted), and (4) Circular Wait. "Preemptive Resource Allocation" actually PREVENTS deadlocks.',
    },
  },
  {
    id: 'col-os-002',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Operating Systems',
    concepts: ['Virtual Memory', 'Paging', 'TLB Miss', 'Page Faults'],
    body: 'Describe the complete step-by-step hardware and OS sequence that occurs when a CPU generates a logical memory address resulting in a Translation Lookaside Buffer (TLB) miss followed by a Page Fault.',
    difficulty: 'hard',
    tags: ['os', 'virtual-memory', 'paging', 'tlb', 'semester-exam'],
    metadata: {
      questionType: 'long',
      marks: 8,
      solution:
        '1. CPU generates virtual address (Page #, Offset).\n2. MMU checks TLB -> TLB Miss.\n3. MMU searches Page Table in physical RAM. Valid/Invalid bit is 0 -> Traps to OS via Page Fault Interrupt.\n4. OS saves user process context.\n5. OS verifies address validity in process address space.\n6. OS locates the required page on backing store (disk/SSD).\n7. OS finds a free physical frame (or applies page replacement algorithm like LRU if full, writing dirty victim page to disk).\n8. OS issues asynchronous disk I/O to read page into frame; process moves to WAITING state.\n9. Disk controller issues I/O completion interrupt.\n10. OS updates Page Table with frame # and sets Valid bit = 1.\n11. TLB is updated.\n12. Process moves to READY state; CPU restarts the exact faulting instruction.',
      markingScheme: [
        '2 Marks: Initial address translation and TLB lookup failure',
        '3 Marks: Page table invalid trap and disk frame allocation/eviction',
        '3 Marks: Disk I/O completion, page table update, and instruction restart',
      ],
    },
  },
  {
    id: 'col-os-003',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Operating Systems',
    concepts: ['Concurrency', 'Semaphores', 'Mutex', 'Deadlock'],
    body: 'What is the primary architectural difference between a **Mutex** and a **Counting Semaphore**? Can a thread that did not lock a Mutex unlock it?',
    difficulty: 'medium',
    tags: ['os', 'concurrency', 'mutex', 'semaphores', 'interview'],
    metadata: {
      questionType: 'short',
      marks: 3,
      solution:
        'A Mutex is a locking mechanism with ownership: only the specific thread that acquired (locked) the mutex can release (unlock) it. A Semaphore is a signaling mechanism (an integer counter) without ownership: any thread can post/signal (V) to increment it, allowing resource counting and task synchronization across different threads.',
    },
  },

  // ── DATABASE MANAGEMENT SYSTEMS (SQL) ─────────────────────────────────────
  {
    id: 'col-db-001',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Database Management (SQL)',
    concepts: ['ACID Properties', 'Transaction Isolation', 'Phantom Reads'],
    body: 'Under standard ANSI SQL transaction isolation levels, which isolation level guarantees prevention of Dirty Reads and Non-Repeatable Reads, but may still permit **Phantom Reads** unless range locking is enforced?',
    difficulty: 'medium',
    tags: ['dbms', 'sql', 'acid', 'transactions'],
    metadata: {
      questionType: 'mcq',
      options: [
        'Read Uncommitted',
        'Read Committed',
        'Repeatable Read',
        'Serializable',
      ],
      correctOptionIndex: 2,
      marks: 2,
      solution:
        'Repeatable Read prevents Dirty Reads (reading uncommitted changes) and Non-Repeatable Reads (row-level data changes during a transaction) by holding read locks on existing rows. However, newly inserted rows matching a range query (Phantoms) can appear unless Serializable isolation with range/gap locking is used.',
    },
  },
  {
    id: 'col-db-002',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Database Management (SQL)',
    concepts: ['SQL Queries', 'Window Functions', 'Subqueries'],
    body: 'Given an `Employees` table with columns `(id, name, department_id, salary)`, write a SQL query to find the 2nd highest salary in each department using standard SQL Window Functions (DENSE_RANK).',
    difficulty: 'medium',
    tags: ['dbms', 'sql', 'window-functions', 'faang'],
    metadata: {
      questionType: 'short',
      marks: 5,
      solution:
        '```sql\nWITH RankedSalaries AS (\n  SELECT \n    id, name, department_id, salary,\n    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk\n  FROM Employees\n)\nSELECT id, name, department_id, salary\nFROM RankedSalaries\nWHERE rnk = 2;\n```\nExplanation: DENSE_RANK() correctly handles duplicate tied salaries without skipping rank numbers.',
      markingScheme: [
        '2 Marks: Correct PARTITION BY department_id and ORDER BY salary DESC',
        '2 Marks: Usage of DENSE_RANK() over CTE or subquery',
        '1 Mark: Final filter WHERE rnk = 2',
      ],
    },
  },
  {
    id: 'col-db-003',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Database Management (SQL)',
    concepts: ['Database Normalization', 'BCNF', '3NF', 'Functional Dependencies'],
    body: 'State the formal definition of Boyce-Codd Normal Form (BCNF). Why is every relation in BCNF guaranteed to be in 3NF, but the reverse is not always true?',
    difficulty: 'hard',
    tags: ['dbms', 'normalization', 'bcnf', 'gate'],
    metadata: {
      questionType: 'short',
      marks: 4,
      solution:
        'A relation R is in BCNF if for every non-trivial functional dependency X -> Y, X is a superkey of R. In 3NF, the requirement is relaxed: either X is a superkey OR Y is a prime attribute (part of a candidate key). Hence BCNF strictly subsumes 3NF. If a relation has overlapping candidate keys, it can be in 3NF without satisfying BCNF.',
    },
  },

  // ── COMPUTER NETWORKS ─────────────────────────────────────────────────────
  {
    id: 'col-net-001',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Computer Networks',
    concepts: ['TCP/IP', 'Three-Way Handshake', 'SYN Flood'],
    body: 'During the standard TCP 3-way connection establishment handshake, what are the exact flags sent in sequence between Client (C) and Server (S)?',
    difficulty: 'easy',
    tags: ['networks', 'tcp', 'handshake', 'placement'],
    metadata: {
      questionType: 'mcq',
      options: [
        '1. C -> S: SYN | 2. S -> C: SYN-ACK | 3. C -> S: ACK',
        '1. C -> S: ACK | 2. S -> C: SYN | 3. C -> S: FIN',
        '1. C -> S: SYN | 2. S -> C: ACK | 3. C -> S: SYN',
        '1. C -> S: RST | 2. S -> C: SYN-ACK | 3. C -> S: ACK',
      ],
      correctOptionIndex: 0,
      marks: 2,
      solution:
        'Step 1: Client sends SYN with initial sequence number (ISN_c). Step 2: Server responds with SYN-ACK with its own ISN_s and ACK=(ISN_c + 1). Step 3: Client sends ACK=(ISN_s + 1) to establish full-duplex socket.',
    },
  },
  {
    id: 'col-net-002',
    kind: 'question',
    track: 'college',
    subject: 'Computer Science',
    chapter: 'Computer Networks',
    concepts: ['CIDR Subnetting', 'IPv4', 'Network Address'],
    body: 'An organization is allocated the IPv4 subnet `192.168.16.0/20`. (a) What is the total number of usable host IP addresses? (b) What is the network broadcast address of this subnet?',
    difficulty: 'medium',
    tags: ['networks', 'subnetting', 'cidr', 'gate'],
    metadata: {
      questionType: 'short',
      marks: 4,
      solution:
        '(a) Prefix is /20. Host bits = 32 - 20 = 12 bits. Total addresses = 2^12 = 4096. Usable host IPs = 4096 - 2 = 4094 (excluding network & broadcast addresses). (b) Subnet mask: 255.255.240.0. 3rd octet block size = 16. Subnet range: 192.168.16.0 to 192.168.31.255. Broadcast address is 192.168.31.255.',
    },
  },

  // ── QUANTITATIVE APTITUDE & LOGICAL REASONING ──────────────────────────────
  {
    id: 'col-apt-001',
    kind: 'question',
    track: 'college',
    subject: 'Aptitude & Placement',
    chapter: 'Quantitative Aptitude',
    concepts: ['Time and Work', 'Efficiency Ratio', 'Placement Aptitude'],
    body: 'Worker A can complete a software module in 12 days, while Worker B can complete the same module in 18 days. If they work together for 4 days and then Worker A leaves, how many additional days will Worker B take alone to finish the remaining work?',
    difficulty: 'easy',
    tags: ['aptitude', 'time-work', 'tcs-nqt', 'infosys'],
    metadata: {
      questionType: 'mcq',
      options: ['4 Days', '6 Days', '8 Days', '10 Days'],
      correctOptionIndex: 2,
      marks: 2,
      solution:
        'Total Work = LCM(12, 18) = 36 units.\nEfficiency of A = 36/12 = 3 units/day.\nEfficiency of B = 36/18 = 2 units/day.\nCombined efficiency = 3 + 2 = 5 units/day.\nWork done in first 4 days = 4 * 5 = 20 units.\nRemaining work = 36 - 20 = 16 units.\nTime for B alone = 16 / 2 = 8 Days.',
    },
  },
  {
    id: 'col-apt-002',
    kind: 'question',
    track: 'college',
    subject: 'Aptitude & Placement',
    chapter: 'Quantitative Aptitude',
    concepts: ['Speed Distance Time', 'Relative Speed', 'Trains'],
    body: 'Two trains of lengths 140 meters and 160 meters are running on parallel tracks in opposite directions with speeds of 60 km/h and 48 km/h respectively. How many seconds will they take to completely cross each other from the moment they meet?',
    difficulty: 'medium',
    tags: ['aptitude', 'speed-time', 'placement'],
    metadata: {
      questionType: 'mcq',
      options: ['8 Seconds', '10 Seconds', '12 Seconds', '15 Seconds'],
      correctOptionIndex: 1,
      marks: 2,
      solution:
        'Total distance to cross = 140m + 160m = 300 meters.\nRelative speed (opposite direction) = 60 + 48 = 108 km/h.\nConverting to m/s: 108 * (5/18) = 6 * 5 = 30 m/s.\nTime = Distance / Relative Speed = 300m / 30 m/s = 10 Seconds.',
    },
  },
  {
    id: 'col-apt-003',
    kind: 'question',
    track: 'college',
    subject: 'Aptitude & Placement',
    chapter: 'Logical Reasoning',
    concepts: ['Coding Decoding', 'Pattern Recognition'],
    body: 'In a certain technical encryption cipher, if `SYSTEM` is coded as `SYSMET` and `ALGORITHM` is coded as `ALGMHTIOR`, how will the word `COMPILER` be coded in the same cipher?',
    difficulty: 'medium',
    tags: ['aptitude', 'logical-reasoning', 'placement'],
    metadata: {
      questionType: 'mcq',
      options: ['COMPRELI', 'COMPREL I', 'COMPRELI', 'COPMREL I'],
      correctOptionIndex: 0,
      marks: 2,
      solution:
        'Word length is 8 letters. Pattern: First 4 letters `COMP` remain intact; the remaining 4 letters `ILER` are reversed to `RELI`. Combining gives `COMPRELI`.',
    },
  },

  // ── AI, MACHINE LEARNING & PYTORCH ─────────────────────────────────────────
  {
    id: 'col-ai-001',
    kind: 'question',
    track: 'college',
    subject: 'AI & Data Science',
    chapter: 'Machine Learning Foundations',
    concepts: ['Bias-Variance Tradeoff', 'Overfitting', 'Regularization'],
    body: 'Explain how L1 (Lasso) and L2 (Ridge) regularization mathematically penalize loss functions. Why does L1 regularization drive certain feature weights strictly to zero, effectively performing feature selection?',
    difficulty: 'medium',
    tags: ['ai', 'ml', 'regularization', 'lasso-ridge', 'interview'],
    metadata: {
      questionType: 'short',
      marks: 5,
      solution:
        'L2 (Ridge) adds penalty λ * Σ(w_i^2), creating spherical L2 contours. L1 (Lasso) adds penalty λ * Σ|w_i|, creating diamond/rhombus shaped L1 constraint contours with sharp corners along the coordinate axes. The elliptical error contours of the unregularized loss are much more likely to intersect the L1 diamond at an axis corner where one or more parameters w_i = 0, inducing mathematical sparsity and automatic feature selection.',
      markingScheme: [
        '2 Marks: Mathematical penalty expressions for L1 and L2',
        '3 Marks: Geometric explanation of diamond contour corner intersection yielding sparsity',
      ],
    },
  },
  {
    id: 'col-ai-002',
    kind: 'question',
    track: 'college',
    subject: 'AI & Data Science',
    chapter: 'Generative AI & LLMs',
    concepts: ['Transformers', 'Self-Attention', 'Query Key Value'],
    body: 'Write down the mathematical formula for Scaled Dot-Product Attention in Transformer architectures. What is the role of scaling by `sqrt(d_k)`?',
    difficulty: 'hard',
    tags: ['ai', 'transformers', 'attention', 'llm', 'genai'],
    metadata: {
      questionType: 'short',
      marks: 4,
      solution:
        '$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$\nRole of scaling by $\\sqrt{d_k}$: For large projection dimensions $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradients). Scaling by $1/\\sqrt{d_k}$ keeps the variance of the dot product around 1.0, preserving gradient stability during backpropagation.',
    },
  },

  // ── CORE ECE & EMBEDDED ───────────────────────────────────────────────────
  {
    id: 'col-ece-001',
    kind: 'question',
    track: 'college',
    subject: 'Electronics & Hardware',
    chapter: 'Real-Time Operating Systems (RTOS)',
    concepts: ['Priority Inversion', 'Priority Inheritance', 'FreeRTOS'],
    body: 'Describe the **Priority Inversion** anomaly in real-time operating systems (RTOS) involving three tasks (High, Medium, Low priority). How does the **Priority Inheritance Protocol (PIP)** resolve this vulnerability?',
    difficulty: 'hard',
    tags: ['ece', 'rtos', 'embedded', 'priority-inversion'],
    metadata: {
      questionType: 'long',
      marks: 6,
      solution:
        'Anomaly Scenario:\n1. Low priority task (L) locks a shared resource Mutex.\n2. High priority task (H) wakes up, preempts L, and requests the same Mutex -> H is blocked waiting for L.\n3. Medium priority task (M), which does NOT need the mutex, wakes up and preempts L because M has higher priority than L.\n4. Result: H is indirectly waiting for M to finish, completely inverting task priority.\n\nResolution via Priority Inheritance:\nWhen H blocks on the mutex held by L, the RTOS dynamically elevates L\'s priority to match H\'s priority until L releases the mutex. This prevents intermediate task M from preempting L, allowing L to release the resource quickly so H can resume without delay.',
      markingScheme: [
        '3 Marks: Clear description of the 3-task priority inversion sequence',
        '3 Marks: Priority inheritance elevation mechanism and mutex release transition',
      ],
    },
  },
  {
    id: 'col-ece-002',
    kind: 'question',
    track: 'college',
    subject: 'Electronics & Hardware',
    chapter: 'Digital Electronics & Verilog HDL',
    concepts: ['Setup Time', 'Hold Time', 'Metastability', 'Flip-Flops'],
    body: 'Define **Setup Time (t_setup)** and **Hold Time (t_hold)** for an edge-triggered D flip-flop. What physical phenomenon occurs if either constraint is violated during clock edge transitions?',
    difficulty: 'medium',
    tags: ['ece', 'vlsi', 'digital-logic', 'setup-hold', 'gate'],
    metadata: {
      questionType: 'short',
      marks: 4,
      solution:
        '1. Setup Time (t_setup): The minimum continuous duration the data input (D) must remain stable BEFORE the active clock transition.\n2. Hold Time (t_hold): The minimum continuous duration the data input (D) must remain stable AFTER the active clock transition.\nViolation consequence: If either constraint is breached, the internal cross-coupled latch enters **Metastability**, where the output voltage hovers in an intermediate indeterminate state between logic 0 and logic 1 for an unpredictable duration before settling, corrupting digital state machines.',
    },
  },
];

export const COLLEGE_QUESTION_POOL: ContentItem[] = RAW_COLLEGE_QUESTION_POOL.map((item) => ({
  images: [],
  ...item,
}));

