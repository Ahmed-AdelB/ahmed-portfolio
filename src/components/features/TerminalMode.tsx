import {
  type FC,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "@nanostores/react";
import { Terminal, Power } from "lucide-react";
import { terminalMode, toggleTerminalMode } from "../../stores/terminal";

type TerminalLineType = "command" | "output" | "system";

interface TerminalLine {
  id: string;
  type: TerminalLineType;
  content: string;
}

interface TerminalModeProps {
  className?: string;
}

interface TypingQueueOptions {
  typingSpeedMs: number;
  reducedMotion: boolean;
}

interface TypingQueueResult {
  lines: TerminalLine[];
  isTyping: boolean;
  appendLine: (line: TerminalLine) => void;
  enqueueLines: (lines: string[], type?: TerminalLineType) => void;
  clearLines: (nextLines?: TerminalLine[]) => void;
}

const ROOT_DIR = "~" as const;
const DIRECTORIES = [
  "about",
  "projects",
  "skills",
  "contact",
  "blog",
  "resume",
] as const;

type TerminalDirectory = typeof ROOT_DIR | (typeof DIRECTORIES)[number];

const PROMPT_USER = "guest";
const PROMPT_HOST = "ahmed-portfolio";

const ABOUT_OUTPUT = [
  "Ahmed Adel - AI Security Researcher & Open Source Contributor.",
  "Focus: Incident Response, Threat Intelligence, AI Security.",
  "Open-source work across pip, pydantic, openai-python, and OWASP.",
];

const PROJECTS_OUTPUT = [
  "Featured projects:",
  "- LLM Security Playbook",
  "- OpenAI Python Security Hardening",
  "- pip Supply Chain Security Contributions",
  "More: /projects",
];

const SKILLS_OUTPUT = [
  "Core skills:",
  "- Incident Response",
  "- Threat Intelligence",
  "- AI Security",
  "- AppSec",
  "- DevSecOps",
  "- Open Source",
];

const CONTACT_OUTPUT = [
  "Email: contact@ahmedalderai.com",
  "LinkedIn: linkedin.com/in/ahmedadel1991",
  "GitHub: github.com/Ahmed-AdelB",
];

const BLOG_OUTPUT = ["Latest posts live at /blog."];

const RESUME_OUTPUT = ["Resume available at /resume."];

const README_OUTPUT = [
  "Welcome to Terminal Mode.",
  "Type `help` to see available commands.",
  "Tip: use `ls` and `cat` to explore.",
];

const HELP_OUTPUT = [
  "Available commands:",
  "ls - list sections/files",
  "cat <file> - read a file",
  "cd <section> - change directory",
  "help - show this message",
  "whoami - display current user",
  "clear - clear the screen",
  "projects - featured work",
  "skills - core skills",
  "contact - contact details",
];

const DIRECTORY_LISTINGS: Record<TerminalDirectory, string[]> = {
  [ROOT_DIR]: [
    "about",
    "projects",
    "skills",
    "contact",
    "blog",
    "resume",
    "about.txt",
    "projects.txt",
    "skills.txt",
    "contact.txt",
    "readme.txt",
  ],
  about: ["index.txt"],
  projects: ["index.txt"],
  skills: ["index.txt"],
  contact: ["index.txt"],
  blog: ["index.txt"],
  resume: ["index.txt"],
};

const FILE_CONTENTS: Record<string, string[]> = {
  "about.txt": ABOUT_OUTPUT,
  "about/index.txt": ABOUT_OUTPUT,
  "projects.txt": PROJECTS_OUTPUT,
  "projects/index.txt": PROJECTS_OUTPUT,
  "skills.txt": SKILLS_OUTPUT,
  "skills/index.txt": SKILLS_OUTPUT,
  "contact.txt": CONTACT_OUTPUT,
  "contact/index.txt": CONTACT_OUTPUT,
  "blog/index.txt": BLOG_OUTPUT,
  "resume/index.txt": RESUME_OUTPUT,
  "readme.txt": README_OUTPUT,
};

const COMMAND_OUTPUTS: Record<string, string[]> = {
  projects: PROJECTS_OUTPUT,
  skills: SKILLS_OUTPUT,
  contact: CONTACT_OUTPUT,
};

const INITIAL_LINES: TerminalLine[] = [
  {
    id: "terminal-welcome",
    type: "system",
    content: "Terminal Mode ready. Type `help` to begin.",
  },
];

const createLineId = (): string =>
  `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const isDirectory = (value: string): value is (typeof DIRECTORIES)[number] =>
  (DIRECTORIES as readonly string[]).includes(value);

const formatPrompt = (cwd: TerminalDirectory): string =>
  `${PROMPT_USER}@${PROMPT_HOST}:${cwd === ROOT_DIR ? ROOT_DIR : `~/${cwd}`}$`;

const normalizeFileTarget = (
  target: string,
  cwd: TerminalDirectory,
): string => {
  const stripped = target.replace(/^~\//, "").replace(/^\//, "");
  if (stripped.includes("/")) return stripped;
  if (cwd !== ROOT_DIR) {
    return `${cwd}/${stripped}`;
  }
  return stripped;
};

const usePrefersReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
};

const useTypingQueue = (
  initialLines: TerminalLine[],
  { typingSpeedMs, reducedMotion }: TypingQueueOptions,
): TypingQueueResult => {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [isTyping, setIsTyping] = useState(false);
  const queueRef = useRef<TerminalLine[]>([]);
  const typingRef = useRef(false);
  const cancelTokenRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      queueRef.current = [];
    };
  }, []);

  const appendLine = useCallback((line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const clearLines = useCallback((nextLines: TerminalLine[] = []) => {
    cancelTokenRef.current += 1;
    queueRef.current = [];
    typingRef.current = false;
    setIsTyping(false);
    setLines(nextLines);
  }, []);

  const processQueue = useCallback(async () => {
    if (typingRef.current || !mountedRef.current) return;
    typingRef.current = true;
    setIsTyping(true);
    const token = cancelTokenRef.current;

    while (queueRef.current.length > 0 && cancelTokenRef.current === token) {
      const next = queueRef.current.shift();
      if (!next) break;

      if (reducedMotion) {
        if (!mountedRef.current) return;
        setLines((prev) => [...prev, next]);
        continue;
      }

      if (!mountedRef.current) return;
      setLines((prev) => [...prev, { ...next, content: "" }]);

      for (let index = 1; index <= next.content.length; index += 1) {
        if (!mountedRef.current || cancelTokenRef.current !== token) return;
        await sleep(typingSpeedMs);
        setLines((prev) =>
          prev.map((line) =>
            line.id === next.id
              ? { ...line, content: next.content.slice(0, index) }
              : line,
          ),
        );
      }
    }

    typingRef.current = false;
    if (mountedRef.current && cancelTokenRef.current === token) {
      setIsTyping(false);
    }
  }, [reducedMotion, typingSpeedMs]);

  const enqueueLines = useCallback(
    (contents: string[], type: TerminalLineType = "output") => {
      const nextLines = contents.map((content) => ({
        id: createLineId(),
        type,
        content,
      }));
      queueRef.current = [...queueRef.current, ...nextLines];
      void processQueue();
    },
    [processQueue],
  );

  return {
    lines,
    isTyping,
    appendLine,
    enqueueLines,
    clearLines,
  };
};

/**
 * TerminalMode - Interactive terminal UI for the portfolio.
 *
 * @example
 * <TerminalMode />
 */
export const TerminalMode: FC<TerminalModeProps> = ({ className }) => {
  const isTerminalEnabled = useStore(terminalMode);
  const [cwd, setCwd] = useState<TerminalDirectory>(ROOT_DIR);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const prompt = useMemo(() => formatPrompt(cwd), [cwd]);

  const { lines, isTyping, appendLine, enqueueLines, clearLines } =
    useTypingQueue(INITIAL_LINES, {
      typingSpeedMs: prefersReducedMotion ? 0 : 14,
      reducedMotion: prefersReducedMotion,
    });

  const handleScroll = useCallback(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    handleScroll();
  }, [lines, isTyping, handleScroll]);

  useEffect(() => {
    if (isTerminalEnabled) {
      inputRef.current?.focus();
    }
  }, [isTerminalEnabled]);

  const handleHistoryNavigation = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (history.length === 0) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex =
          historyIndex === null
            ? history.length - 1
            : Math.max(historyIndex - 1, 0);
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex] ?? "");
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyIndex === null) return;
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(null);
          setInputValue("");
          return;
        }
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex] ?? "");
      }
    },
    [history, historyIndex],
  );

  const handleCommand = useCallback(
    (rawInput: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      appendLine({
        id: createLineId(),
        type: "command",
        content: `${prompt} ${trimmed}`,
      });

      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(null);

      const [commandToken, ...rest] = trimmed.split(/\s+/);
      const command = commandToken.toLowerCase();

      // CTF Challenge - Flag 2
      if (
        (command === "sudo" && rest[0] === "su") ||
        (command === "cat" && rest[0] === "/etc/shadow")
      ) {
        enqueueLines([
          "SYSTEM OVERRIDE INITIATED...",
          "Access granted... You found the secret flag!",
          "FLAG{terminal_hacker_elite}",
        ]);
        return;
      }

      if (command === "clear") {
        clearLines([]);
        return;
      }

      if (command === "ls") {
        const listing = DIRECTORY_LISTINGS[cwd] ?? DIRECTORY_LISTINGS[ROOT_DIR];
        enqueueLines([listing.join("  ")]);
        return;
      }

      if (command === "help") {
        enqueueLines(HELP_OUTPUT);
        return;
      }

      if (command === "whoami") {
        enqueueLines([PROMPT_USER]);
        return;
      }

      if (command === "cd") {
        const target = rest[0];
        if (!target) {
          enqueueLines([
            "Usage: cd <section>",
            `Available: ${DIRECTORIES.join(", ")}`,
          ]);
          return;
        }

        if (target === "/" || target === "~") {
          setCwd(ROOT_DIR);
          enqueueLines(["Moved to ~"]);
          return;
        }

        if (target === "..") {
          setCwd(ROOT_DIR);
          enqueueLines(["Moved to ~"]);
          return;
        }

        const normalized = target
          .replace(/^~\//, "")
          .replace(/^\//, "")
          .toLowerCase();
        if (isDirectory(normalized)) {
          setCwd(normalized);
          enqueueLines([
            `Switched to ~/${normalized}.`,
            "Run `ls` or `cat index.txt`.",
          ]);
          return;
        }

        enqueueLines([`cd: no such section: ${target}`]);
        return;
      }

      if (command === "cat") {
        const target = rest[0];
        if (!target) {
          enqueueLines(["Usage: cat <file>", "Try: cat about.txt"]);
          return;
        }
        const resolved = normalizeFileTarget(target, cwd);
        const content = FILE_CONTENTS[resolved];
        if (!content) {
          enqueueLines([`cat: ${target}: No such file`]);
          return;
        }
        enqueueLines(content);
        return;
      }

      if (COMMAND_OUTPUTS[command]) {
        enqueueLines(COMMAND_OUTPUTS[command]);
        return;
      }

      enqueueLines([`Command not found: ${command}. Type 'help' for options.`]);
    },
    [appendLine, clearLines, cwd, enqueueLines, prompt],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputValue.trim() || isTyping) return;
      const nextInput = inputValue;
      setInputValue("");
      handleCommand(nextInput);
    },
    [handleCommand, inputValue, isTyping],
  );

  return (
    <div className={`terminal-shell ${className ?? ""}`.trim()}>
      <button
        type="button"
        className="terminal-toggle"
        data-enabled={isTerminalEnabled ? "true" : "false"}
        onClick={toggleTerminalMode}
        aria-pressed={isTerminalEnabled}
        aria-label={
          isTerminalEnabled ? "Disable terminal mode" : "Enable terminal mode"
        }
      >
        <Terminal size={18} aria-hidden="true" />
        <span className="terminal-toggle__label">
          {isTerminalEnabled ? "Terminal Mode On" : "Terminal Mode"}
        </span>
        <Power size={16} aria-hidden="true" />
      </button>

      <section
        className="terminal-panel"
        data-open={isTerminalEnabled ? "true" : "false"}
        aria-hidden={!isTerminalEnabled}
        aria-label="Interactive terminal"
      >
        <div className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-status-dot" aria-hidden="true"></span>
            Portfolio Terminal
          </div>
          <div className="terminal-status">
            {isTerminalEnabled ? "Online" : "Offline"}
          </div>
        </div>

        <div
          className="terminal-output"
          role="log"
          aria-live="polite"
          ref={outputRef}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              className={`terminal-line terminal-line--${line.type}`}
            >
              {line.content}
            </div>
          ))}
          {isTyping && (
            <div className="terminal-line terminal-line--output">
              <span className="terminal-caret" aria-hidden="true">
                █
              </span>
            </div>
          )}
        </div>

        <form className="terminal-input-row" onSubmit={handleSubmit}>
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setHistoryIndex(null);
            }}
            onKeyDown={handleHistoryNavigation}
            className="terminal-input"
            aria-label="Terminal command input"
            autoComplete="off"
            spellCheck={false}
            disabled={!isTerminalEnabled || isTyping}
          />
          <button
            type="submit"
            className="terminal-submit"
            disabled={
              !isTerminalEnabled || isTyping || inputValue.trim().length === 0
            }
          >
            Run
          </button>
        </form>
      </section>
    </div>
  );
};

export default TerminalMode;
