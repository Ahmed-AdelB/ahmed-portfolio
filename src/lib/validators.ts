export const BLOCKED_PATTERNS: ReadonlyArray<RegExp> = [
  /ignore\s+previous\s+instructions/i,
  /\byou\s+are\s+now\s+dan\b/i,
  /\bpretend\s+you\s+are\b/i,
  /\bsystem:\s*you\s+are\b/i,
  /\[inst\]/i,
  /<\|im_start\|>/i,
];

export const BLOCKED_RESPONSE =
  "I can only answer questions about Ahmed's professional background, skills, and projects.";

export type GuardrailResult = {
  allowed: boolean;
  matchedPattern?: string;
};

export type OutputFilterResult = {
  filtered: string;
  blocked: boolean;
  matchedPattern?: string;
};

const findBlockedPattern = (value: string): string | null => {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(value)) {
      return pattern.source;
    }
  }
  return null;
};

/**
 * Checks user input for prompt injection patterns.
 */
export const validateUserInput = (value: string): GuardrailResult => {
  const match = findBlockedPattern(value);
  if (match) {
    return { allowed: false, matchedPattern: match };
  }
  return { allowed: true };
};

/**
 * Filters assistant output to prevent leaking or reflecting injection patterns.
 */
export const filterAssistantOutput = (value: string): OutputFilterResult => {
  const match = findBlockedPattern(value);
  if (match) {
    return {
      filtered: BLOCKED_RESPONSE,
      blocked: true,
      matchedPattern: match,
    };
  }
  return { filtered: value, blocked: false };
};
