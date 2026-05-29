export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatLongDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getRemainingAccessDays(accessUntil: Date | string | null) {
  if (!accessUntil) {
    return null;
  }

  const diff = new Date(accessUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
