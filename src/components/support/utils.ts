export function formatSupportTimestamp(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today, ${timeString}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeString}`;
  }

  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeString}`;
}

export function getStatusBadgeStyle(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'closed':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

export function formatStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'in_progress':
      return 'In Progress';
    case 'open':
      return 'Open';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return status.replace('_', ' ');
  }
}

export function getPriorityBadgeStyle(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'text-red-600 dark:text-red-400 font-semibold';
    case 'high':
      return 'text-orange-600 dark:text-orange-400 font-medium';
    case 'medium':
      return 'text-amber-600 dark:text-amber-400 font-normal';
    case 'low':
      return 'text-slate-500 dark:text-slate-400 font-normal';
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
}
