export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string, timeString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return timeString ? `${dateFormatted} at ${timeString}` : dateFormatted;
  } catch {
    return dateString;
  }
}

export function getCountdown(dueDateString?: string, dueTimeString: string = '23:59'): {
  text: string;
  isOverdue: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (!dueDateString) {
    return { text: 'No due date', isOverdue: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  try {
    const [year, month, day] = dueDateString.split('-').map(Number);
    const [hours, minutes] = dueTimeString.split(':').map(Number);
    const targetDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
    const now = new Date();

    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs < 0) {
      const overdueMs = Math.abs(diffMs);
      const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      return {
        text: overdueDays === 0 ? 'Overdue today' : `Overdue by ${overdueDays}d`,
        isOverdue: true,
        days: overdueDays,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    const remMinutes = totalMinutes % 60;
    const remSeconds = totalSeconds % 60;

    if (days > 0) {
      return { text: `${days}d ${remHours}h left`, isOverdue: false, days, hours: remHours, minutes: remMinutes, seconds: remSeconds };
    }
    if (totalHours > 0) {
      return { text: `${totalHours}h ${remMinutes}m left`, isOverdue: false, days: 0, hours: totalHours, minutes: remMinutes, seconds: remSeconds };
    }
    return { text: `${remMinutes}m ${remSeconds}s left`, isOverdue: false, days: 0, hours: 0, minutes: remMinutes, seconds: remSeconds };
  } catch {
    return { text: 'Invalid date', isOverdue: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
}

/**
 * Attendance Calculations:
 * target % (e.g. 75%)
 */
export function calculateAttendance(present: number, total: number) {
  if (total <= 0) return 0;
  const pct = (present / total) * 100;
  return Math.round(pct * 10) / 10;
}

export function calculateBunkStats(present: number, total: number, target: number = 75) {
  if (total <= 0) {
    return {
      percentage: 0,
      status: 'green' as const,
      canBunk: 0,
      mustAttend: 0,
      message: 'No classes conducted yet',
    };
  }

  const percentage = calculateAttendance(present, total);
  const targetFraction = target / 100;

  if (percentage >= target) {
    // Current >= target: How many classes can student miss while maintaining >= target%
    // (present) / (total + x) >= targetFraction
    // present >= targetFraction * (total + x)
    // present / targetFraction >= total + x
    // x <= (present / targetFraction) - total
    const maxTotalClasses = Math.floor(present / targetFraction);
    const canBunk = Math.max(0, maxTotalClasses - total);

    return {
      percentage,
      status: (percentage >= 75 ? 'green' : 'yellow') as 'green' | 'yellow' | 'red',
      canBunk,
      mustAttend: 0,
      message: canBunk > 0
        ? `You can safely miss ${canBunk} class${canBunk > 1 ? 'es' : ''} and still maintain ${target}%`
        : `On track! Attend the next class to maintain ${target}%`,
    };
  } else {
    // Current < target: How many consecutive classes must attend to reach target%
    // (present + y) / (total + y) >= targetFraction
    // present + y >= targetFraction * total + targetFraction * y
    // y * (1 - targetFraction) >= targetFraction * total - present
    // y >= (targetFraction * total - present) / (1 - targetFraction)
    const needed = Math.ceil(
      (targetFraction * total - present) / (1 - targetFraction)
    );
    const mustAttend = Math.max(1, needed);

    return {
      percentage,
      status: (percentage >= 65 ? 'yellow' : 'red') as 'green' | 'yellow' | 'red',
      canBunk: 0,
      mustAttend,
      message: `Need to attend next ${mustAttend} class${mustAttend > 1 ? 'es' : ''} consecutively to reach ${target}%`,
    };
  }
}

export function getAttendanceColor(percentage: number, targetThreshold: number = 75): {
  color: string;
  bg: string;
  badge: string;
  text: string;
  status: 'safe' | 'warning' | 'danger';
} {
  if (percentage >= targetThreshold) {
    return {
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      text: 'Good Standing',
      status: 'safe',
    };
  }
  if (percentage >= targetThreshold - 10) {
    return {
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-safety-amber',
      badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      text: 'Warning Zone',
      status: 'warning',
    };
  }
  return {
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    text: 'Critical Shortage',
    status: 'danger',
  };
}

export interface SgpaCourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  gradePoint: number; // 0 to 10
  gradeLetter?: string;
  isLab?: boolean;
}

export const GRADE_SCALE: { letter: string; points: number; label: string; minMarks?: number }[] = [
  { letter: 'O', points: 10, label: 'Outstanding (90-100%)', minMarks: 90 },
  { letter: 'A+', points: 9, label: 'Excellent (80-89%)', minMarks: 80 },
  { letter: 'A', points: 8, label: 'Very Good (70-79%)', minMarks: 70 },
  { letter: 'B+', points: 7, label: 'Good (60-69%)', minMarks: 60 },
  { letter: 'B', points: 6, label: 'Above Average (55-59%)', minMarks: 55 },
  { letter: 'C', points: 5, label: 'Average (50-54%)', minMarks: 50 },
  { letter: 'P', points: 4, label: 'Pass (40-49%)', minMarks: 40 },
  { letter: 'F', points: 0, label: 'Fail / Arrears (<40%)', minMarks: 0 },
];

export function calculateSgpa(courses: SgpaCourseItem[]): {
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  totalPoints: number;
  hasBacklog: boolean;
  classification: string;
  percentageStandard: number;
  percentageAicte: number;
} {
  const totalCredits = courses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);
  let totalPoints = 0;
  let earnedCredits = 0;
  let hasBacklog = false;

  courses.forEach((c) => {
    const cred = Number(c.credits) || 0;
    const pt = Number(c.gradePoint) || 0;
    if (pt === 0 && cred > 0) {
      hasBacklog = true;
    } else {
      earnedCredits += cred;
    }
    totalPoints += cred * pt;
  });

  const sgpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  const percentageStandard = Math.round(sgpa * 10 * 10) / 10;
  const percentageAicte = sgpa > 0.75 ? Math.round((sgpa - 0.75) * 10 * 10) / 10 : 0;

  let classification = 'Pass Class';
  if (hasBacklog) classification = 'Backlog / Arrears Alert';
  else if (sgpa >= 8.5) classification = 'First Class with Distinction (Honours)';
  else if (sgpa >= 7.0) classification = 'First Class';
  else if (sgpa >= 6.0) classification = 'Second Class';
  else if (sgpa >= 4.0) classification = 'Pass Class';
  else classification = 'Needs Improvement';

  return {
    sgpa,
    totalCredits,
    earnedCredits,
    totalPoints,
    hasBacklog,
    classification,
    percentageStandard,
    percentageAicte,
  };
}


