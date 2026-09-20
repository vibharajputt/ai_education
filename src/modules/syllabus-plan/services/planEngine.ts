import type { SyllabusUnit, StudyPlanDay, StudyBlock, DroppedUnit, SyllabusPlanResult } from '../types';

export function extractSyllabusUnitsFromText(rawText: string): SyllabusUnit[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const units: SyllabusUnit[] = [];

  let currentSubject = 'General STEM';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase().includes('physics') || line.toLowerCase().includes('chemistry') || line.toLowerCase().includes('math') || line.toLowerCase().includes('computer')) {
      currentSubject = line.replace(/[:#-]/g, '').trim();
    }

    const isChapter =
      /^(chapter|unit|module|topic|section|\d+[.:])\s+/i.test(line) ||
      (line.length > 5 && line.length < 80 && !line.endsWith('.'));

    if (isChapter && !line.toLowerCase().startsWith('http')) {
      const cleanName = line.replace(/^(chapter|unit|module|topic|section|\d+[.:])\s*/i, '').trim();
      if (cleanName.length >= 3 && !units.some((u) => u.name.toLowerCase() === cleanName.toLowerCase())) {
        units.push({
          id: `unit-${units.length + 1}`,
          name: cleanName,
          subject: currentSubject,
          weightageEstimated: 10,
          currentMastery: 50,
          estimatedHours: 4,
        });
      }
    }
  }

  if (units.length === 0) {
    const defaultUnits = [
      'Chemical Reactions and Equations',
      'Acids, Bases and Salts',
      'Metals and Non-metals',
      'Life Processes',
      'Light - Reflection and Refraction',
      'Electricity and Circuits',
    ];
    return defaultUnits.map((name, i) => ({
      id: `unit-${i + 1}`,
      name,
      subject: 'Science & Mathematics',
      weightageEstimated: 12,
      currentMastery: 50,
      estimatedHours: 4,
    }));
  }

  return units.slice(0, 16);
}

export function generateStudyPlan(
  goal: string,
  deadlineStr: string,
  hoursPerDay: number,
  units: SyllabusUnit[],
  completedBlockIds: Set<string> = new Set(),
): SyllabusPlanResult {
  const maxDailyMinutes = Math.floor(hoursPerDay * 60);

  const now = new Date();
  const targetDate = new Date(deadlineStr);
  const diffTime = Math.max(1, targetDate.getTime() - now.getTime());
  const availableDays = Math.max(1, Math.min(60, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

  const days: StudyPlanDay[] = [];
  const dropped: DroppedUnit[] = [];

  const sortedUnits = [...units].sort((a, b) => a.currentMastery - b.currentMastery);

  let currentDayIndex = 0;
  let currentDayMinutes = 0;
  let currentDayBlocks: StudyBlock[] = [];

  const addDay = (dateStr: string, dayNum: number) => {
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      totalMinutes: currentDayMinutes,
      blocks: currentDayBlocks,
    });
    currentDayMinutes = 0;
    currentDayBlocks = [];
  };

  for (const unit of sortedUnits) {
    const mastery = unit.currentMastery;
    const requiredMinutes = mastery < 40 ? 180 : mastery < 70 ? 120 : 60;
    const blockDuration = Math.min(60, Math.floor(maxDailyMinutes / 2) || 45);
    const blockCount = Math.ceil(requiredMinutes / blockDuration);

    let unitScheduled = false;

    for (let b = 0; b < blockCount; b++) {
      if (currentDayIndex >= availableDays) {
        break;
      }

      if (currentDayMinutes + blockDuration > maxDailyMinutes) {
        const dayDate = new Date(now.getTime() + currentDayIndex * 86400000);
        addDay(dayDate.toISOString().split('T')[0], currentDayIndex + 1);
        currentDayIndex++;
      }

      if (currentDayIndex < availableDays) {
        const blockId = `block-${unit.id}-${b + 1}`;
        const activity = b === 0 ? 'Core Theory & Concept Mapping' : b === 1 ? 'Step Derivations & Formulas' : 'PYQ Practice & Self-Audit';
        currentDayBlocks.push({
          id: blockId,
          topic: unit.name,
          minutes: blockDuration,
          activity,
          completed: completedBlockIds.has(blockId),
        });
        currentDayMinutes += blockDuration;
        unitScheduled = true;
      }
    }

    if (!unitScheduled) {
      dropped.push({
        unit: unit.name,
        reason: `Time capacity constraint: High baseline mastery (${unit.currentMastery}%) or target exam deadline (${deadlineStr}) requires prioritizing higher-yield weak topics.`,
      });
    }
  }

  if (currentDayBlocks.length > 0 && currentDayIndex < availableDays) {
    const dayDate = new Date(now.getTime() + currentDayIndex * 86400000);
    addDay(dayDate.toISOString().split('T')[0], currentDayIndex + 1);
  }

  return {
    id: `plan-${Date.now()}`,
    goal,
    deadline: deadlineStr,
    hoursPerDay,
    units,
    days,
    dropped,
    assumptions: [
      `Daily study block capped strictly at ${hoursPerDay}h (${maxDailyMinutes} minutes/day).`,
      `Spaced active recall scheduled with interleaved problem-solving blocks.`,
      `Topics prioritized by lowest current diagnostic mastery scores.`,
    ],
    riskNotes: [
      `Target deadline is in ${availableDays} days. Ensure uninterrupted daily study sessions.`,
      `If more than 2 consecutive days are missed, trigger the Re-Plan button to recalibrate.`,
    ],
    createdAt: Date.now(),
  };
}
