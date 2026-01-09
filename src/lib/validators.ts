export const BLOCKED_PATTERNS: ReadonlyArray<RegExp> = [
  /ignore\s+previous\s+instructions/i,
  /\b(ignore|disregard|forget|bypass|override)\b.{0,40}\b(previous|prior|earlier)\b.{0,40}\b(instructions?|rules?)\b/i,
  /\b(ignore|disregard|forget|bypass|override)\b.{0,40}\b(system|developer|assistant)\b/i,
  /\byou\s+are\s+now\s+dan\b/i,
  /\bpretend\s+you\s+are\b/i,
  /\bdo\s+anything\s+now\b/i,
  /\bdeveloper\s+mode\b/i,
  /\b(jailbreak|prompt\s*injection|instruction\s*injection)\b/i,
  /\b(system\s*prompt|developer\s*message|hidden\s*prompt)\b/i,
  /\b(reveal|show|print|leak|expose)\b.{0,40}\b(system|developer|hidden|confidential|internal|instructions?|prompt)\b/i,
  /\bact\s+as\b.{0,30}\b(system|developer|assistant|tool|policy)\b/i,
  /\bsystem:\s*you\s+are\b/i,
  /\[inst\]/i,
  /<\s*system\s*>/i,
  /<\s*\/\s*system\s*>/i,
  /\bbegin\s+system\s+prompt\b/i,
  /\bend\s+system\s+prompt\b/i,
  /<\|im_start\|>/i,
];

export const BLOCKED_RESPONSE =
  "I can only answer questions about Ahmed's professional background, skills, and projects.";

export const BLOCKED_RESPONSE_AR =
  "يمكنني فقط الإجابة على الأسئلة المتعلقة بالخلفية المهنية لأحمد ومهاراته ومشاريعه.";

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
