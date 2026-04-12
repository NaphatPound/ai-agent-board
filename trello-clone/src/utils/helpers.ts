import { formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast, differenceInHours, format } from 'date-fns';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function getDueDateStatus(dateStr: string, isComplete: boolean): 'complete' | 'overdue' | 'due-soon' | 'default' {
  if (isComplete) return 'complete';
  const date = new Date(dateStr);
  if (isPast(date)) return 'overdue';
  if (differenceInHours(date, new Date()) <= 24) return 'due-soon';
  return 'default';
}

export function formatTimeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function getChecklistProgress(items: { isChecked: boolean }[]): { checked: number; total: number; percent: number } {
  const total = items.length;
  const checked = items.filter(i => i.isChecked).length;
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  return { checked, total, percent };
}

export function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
