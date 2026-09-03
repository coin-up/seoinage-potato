const TICKET_INPUT_PATTERN = /[^A-Z0-9]/g;

/**
 * Keeps the ticket code input stable when a device keyboard emits several
 * letters from one key press, while still accepting a pasted complete code.
 */
export function normalizeTicketCodeInput(rawValue: string) {
  const normalized = rawValue.toUpperCase().replace(TICKET_INPUT_PATTERN, "");
  const firstLetterIndex = normalized.search(/[A-Z]/);
  if (firstLetterIndex < 0) return "";

  const firstLetter = normalized[firstLetterIndex];
  const digits = normalized.slice(firstLetterIndex + 1).match(/[0-9]/g)?.slice(0, 3).join("") ?? "";
  return `${firstLetter}${digits}`;
}
