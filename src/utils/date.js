// Shared date utilities
// Formats a date-like value (Date | string | number) to dd/mm/yyyy.
// Returns empty string for falsy/invalid values.
export function formatDateDDMMYYYY(value) {
  if (!value) return '';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '';
  }
}
