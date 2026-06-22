import readingTime from 'reading-time';

const MR_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
];

const EN_TO_MR_DIGITS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

/** Convert Latin digits in a string to Devanagari numerals. */
export function toMarathiDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => EN_TO_MR_DIGITS[d]);
}

/** "१५ जून २०२६" — human, Marathi, Devanagari numerals. */
export function formatDateMr(date: Date): string {
  const day = toMarathiDigits(date.getDate());
  const month = MR_MONTHS[date.getMonth()];
  const year = toMarathiDigits(date.getFullYear());
  return `${day} ${month} ${year}`;
}

/** Machine-readable ISO date for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/**
 * Reading time tuned for Devanagari prose. `reading-time` counts whitespace
 * tokens; average Marathi reading speed is ~180 wpm. Returns a Marathi label.
 */
export function readingTimeMr(body: string): string {
  const { words } = readingTime(body);
  const minutes = Math.max(1, Math.round(words / 180));
  return `${toMarathiDigits(minutes)} मिनिटांचं वाचन`;
}
