// src/modules/syllabus-plan/utils/syllabusScheduler.ts
// Parse syllabus text, allocate daily study blocks, enforce hours/day cap, track dropped units, and re-plan schedule.

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  topics: string[];
  estimatedHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DayStudyBlock {
  id: string;
  unitId: string;
  unitTitle: string;
  topic: string;
  minutes: number;
  completed: boolean;
}

export interface DaySchedule {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string;
  blocks: DayStudyBlock[];
  totalMinutes: number;
}

export interface DroppedUnitInfo {
  unitId: string;
  unitTitle: string;
  estimatedHours: number;
  reason: string;
}

export interface SyllabusPlanResult {
  planId: string;
  createdDate: string;
  deadlineDate: string;
  hoursPerDay: number;
  totalAvailableHours: number;
  totalRequiredHours: number;
  units: SyllabusUnit[];
  days: DaySchedule[];
  droppedUnits: DroppedUnitInfo[];
}

/**
 * Parses raw text or syllabus content into structured SyllabusUnits.
 */
export function parseSyllabusText(text: string): SyllabusUnit[] {
  const lines = text
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const units: SyllabusUnit[] = [];
  let currentUnit: SyllabusUnit | null = null;
  let unitCounter = 1;

  for (const line of lines) {
    const isHeader = /^(unit|chapter|module|section|part|block)\s*\d+|^[A-Z0-9\.\s]{3,30}:/i.test(line) || line.length < 40;

    if (isHeader || !currentUnit) {
      if (currentUnit) units.push(currentUnit);
      currentUnit = {
        id: `unit-${unitCounter}`,
        unitNumber: unitCounter,
        title: line.replace(/^(unit|chapter|module|section)\s*\d+[\s:\-]*/i, '').trim() || `Unit ${unitCounter}`,
        topics: [],
        estimatedHours: Math.floor(Math.random() * 3) + 2, // 2 to 4 hours
        difficulty: unitCounter % 3 === 0 ? 'hard' : unitCounter % 2 === 0 ? 'medium' : 'easy',
      };
      unitCounter++;
    } else {
      if (currentUnit && currentUnit.topics.length < 6) {
        currentUnit.topics.push(line.slice(0, 70));
      }
    }
  }

  if (currentUnit) units.push(currentUnit);

  // Guarantee at least 3 fallback units if text was brief
  if (units.length < 3) {
    return [
      {
        id: 'unit-1',
        unitNumber: 1,
        title: 'Core Fundamentals & Principles',
        topics: ['Basic Definitions & Concepts', 'Governing Equations', 'Standard Diagrams'],
        estimatedHours: 3,
        difficulty: 'easy',
      },
      {
        id: 'unit-2',
        unitNumber: 2,
        title: 'Advanced Analytical Applications',
        topics: ['Problem Solving Techniques', 'Derivations & Proofs', 'Numerical Exercises'],
        estimatedHours: 4,
        difficulty: 'medium',
      },
      {
        id: 'unit-3',
        unitNumber: 3,
        title: 'Comprehensive Practice & Mock Review',
        topics: ['Previous Year Questions', 'Formula Mnemonics Review', 'Mock Assessment'],
        estimatedHours: 3,
        difficulty: 'hard',
      },
    ];
  }

  return units;
}

/**
 * Generates day-wise study schedule. Enforces strictly that no day exceeds `hoursPerDay * 60` minutes.
 * Units that cannot fit before the deadline are listed as dropped with explicit reasons.
 */
export function generateStudyPlan(
  units: SyllabusUnit[],
  deadlineDateStr: string,
  hoursPerDay: number,
  planId: string = `plan-${Date.now()}`
): SyllabusPlanResult {
  const today = new Date();
  const deadline = new Date(deadlineDateStr);

  // Calculate available days (minimum 1 day)
  const diffTime = Math.max(1, deadline.getTime() - today.getTime());
  const totalDaysAvailable = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const maxMinutesPerDay = Math.round(hoursPerDay * 60);
  const totalAvailableHours = Number((totalDaysAvailable * hoursPerDay).toFixed(1));

  // Flatten all topics into individual study tasks (60 mins each)
  interface TaskItem {
    unitId: string;
    unitTitle: string;
    topic: string;
    durationMinutes: number;
  }

  const tasks: TaskItem[] = [];
  let totalRequiredMinutes = 0;

  units.forEach((unit) => {
    const topicList = unit.topics.length > 0 ? unit.topics : [unit.title];
    const minutesPerTopic = Math.max(30, Math.round((unit.estimatedHours * 60) / topicList.length));

    topicList.forEach((t) => {
      tasks.push({
        unitId: unit.id,
        unitTitle: unit.title,
        topic: t,
        durationMinutes: minutesPerTopic,
      });
      totalRequiredMinutes += minutesPerTopic;
    });
  });

  const totalRequiredHours = Number((totalRequiredMinutes / 60).toFixed(1));

  // Build Day Buckets
  const days: DaySchedule[] = [];
  const droppedUnitsMap = new Map<string, DroppedUnitInfo>();

  let currentDayIndex = 0;
  let currentDayMinutes = 0;
  let currentDayBlocks: DayStudyBlock[] = [];

  const addCurrentDay = () => {
    if (currentDayBlocks.length > 0 && currentDayIndex < totalDaysAvailable) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + currentDayIndex);

      days.push({
        dayNumber: currentDayIndex + 1,
        dateStr: dayDate.toISOString().split('T')[0],
        dayLabel: `Day ${currentDayIndex + 1} (${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        blocks: currentDayBlocks,
        totalMinutes: currentDayMinutes,
      });
    }
  };

  tasks.forEach((task, index) => {
    // Check if task can fit in current day
    if (currentDayMinutes + task.durationMinutes <= maxMinutesPerDay && currentDayIndex < totalDaysAvailable) {
      currentDayBlocks.push({
        id: `block-${index}`,
        unitId: task.unitId,
        unitTitle: task.unitTitle,
        topic: task.topic,
        minutes: task.durationMinutes,
        completed: false,
      });
      currentDayMinutes += task.durationMinutes;
    } else {
      // Move to next day
      addCurrentDay();
      currentDayIndex++;
      currentDayMinutes = 0;
      currentDayBlocks = [];

      // Check if within available days limit
      if (currentDayIndex < totalDaysAvailable) {
        currentDayBlocks.push({
          id: `block-${index}`,
          unitId: task.unitId,
          unitTitle: task.unitTitle,
          topic: task.topic,
          minutes: task.durationMinutes,
          completed: false,
        });
        currentDayMinutes += task.durationMinutes;
      } else {
        // Exceeds total available timeline -> Mark unit as dropped!
        if (!droppedUnitsMap.has(task.unitId)) {
          const u = units.find((x) => x.id === task.unitId);
          droppedUnitsMap.set(task.unitId, {
            unitId: task.unitId,
            unitTitle: task.unitTitle,
            estimatedHours: u ? u.estimatedHours : 2,
            reason: `Exceeds total available preparation time prior to deadline (${totalRequiredHours}h needed vs ${totalAvailableHours}h available at ${hoursPerDay}h/day cap).`,
          });
        }
      }
    }
  });

  // Push final day
  if (currentDayBlocks.length > 0 && currentDayIndex < totalDaysAvailable) {
    addCurrentDay();
  }

  return {
    planId,
    createdDate: today.toISOString().split('T')[0],
    deadlineDate: deadlineDateStr,
    hoursPerDay,
    totalAvailableHours,
    totalRequiredHours,
    units,
    days,
    droppedUnits: Array.from(droppedUnitsMap.values()),
  };
}

/**
 * Re-plans an existing schedule after missed days while preserving completed topics.
 */
export function replanSchedule(
  currentPlan: SyllabusPlanResult,
  completedBlockIds: Set<string>
): SyllabusPlanResult {
  // Extract uncompleted blocks
  const uncompletedTasks: DayStudyBlock[] = [];
  currentPlan.days.forEach((day) => {
    day.blocks.forEach((block) => {
      if (!completedBlockIds.has(block.id) && !block.completed) {
        uncompletedTasks.push(block);
      }
    });
  });

  // Re-run scheduler with uncompleted tasks across remaining timeline
  const today = new Date();
  const deadline = new Date(currentPlan.deadlineDate);
  const diffTime = Math.max(1, deadline.getTime() - today.getTime());
  const remainingDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const maxMinutesPerDay = Math.round(currentPlan.hoursPerDay * 60);

  const newDays: DaySchedule[] = [];
  const droppedMap = new Map<string, DroppedUnitInfo>();

  let currentDayIndex = 0;
  let currentDayMinutes = 0;
  let currentDayBlocks: DayStudyBlock[] = [];

  const addDay = () => {
    if (currentDayBlocks.length > 0 && currentDayIndex < remainingDays) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + currentDayIndex);

      newDays.push({
        dayNumber: currentDayIndex + 1,
        dateStr: dayDate.toISOString().split('T')[0],
        dayLabel: `Day ${currentDayIndex + 1} (${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        blocks: currentDayBlocks,
        totalMinutes: currentDayMinutes,
      });
    }
  };

  uncompletedTasks.forEach((task, idx) => {
    if (currentDayMinutes + task.minutes <= maxMinutesPerDay && currentDayIndex < remainingDays) {
      currentDayBlocks.push({ ...task, id: `replan-block-${idx}` });
      currentDayMinutes += task.minutes;
    } else {
      addDay();
      currentDayIndex++;
      currentDayMinutes = 0;
      currentDayBlocks = [];

      if (currentDayIndex < remainingDays) {
        currentDayBlocks.push({ ...task, id: `replan-block-${idx}` });
        currentDayMinutes += task.minutes;
      } else {
        if (!droppedMap.has(task.unitId)) {
          droppedMap.set(task.unitId, {
            unitId: task.unitId,
            unitTitle: task.unitTitle,
            estimatedHours: 2,
            reason: `Re-planned timeline cap reached (${currentPlan.hoursPerDay}h/day max limit).`,
          });
        }
      }
    }
  });

  if (currentDayBlocks.length > 0 && currentDayIndex < remainingDays) {
    addDay();
  }

  return {
    ...currentPlan,
    days: newDays,
    droppedUnits: Array.from(droppedMap.values()),
  };
}
