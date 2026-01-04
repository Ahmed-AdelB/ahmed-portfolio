import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  challenges,
  defaultDefenseState,
  defenseMap,
  defenseMechanisms,
} from "../../data/security-challenges";
import { usePersistentProgress } from "../../hooks/usePersistentProgress";
import {
  buildHardenedPrompt,
  evaluateSimulation,
} from "../../lib/security-utils";
import type {
  ChallengeId,
  ChallengeProgress,
  DefenseId,
  SimulationResult,
} from "../../types/security";
import { ChallengeList } from "./security/ChallengeList";
import { DefenseControls } from "./security/DefenseControls";
import { EducationalPanel } from "./security/EducationalPanel";
import { ProgressTracker } from "./security/ProgressTracker";
import { SimulationConsole } from "./security/SimulationConsole";
import { SimulationResultDisplay } from "./security/SimulationResultDisplay";

const challengeIds = challenges.map(
  (challenge) => challenge.id,
) as ChallengeId[];

interface SecurityPlaygroundProps {}

/**
 * SecurityPlayground - Interactive prompt injection challenges with defense demos and progress tracking.
 *
 * @example
 * <SecurityPlayground />
 */
export const SecurityPlayground: FC<SecurityPlaygroundProps> = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<ChallengeId>(
    challenges[0].id,
  );
  const [promptInput, setPromptInput] = useState<string>(
    challenges[0].userPrompt,
  );
  const [enabledDefenses, setEnabledDefenses] =
    useState<Record<DefenseId, boolean>>(defaultDefenseState);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const { progress, setProgress, resetProgress, isReady } =
    usePersistentProgress(challengeIds);

  const activeChallenge = useMemo(() => {
    return (
      challenges.find((challenge) => challenge.id === selectedChallengeId) ??
      challenges[0]
    );
  }, [selectedChallengeId]);

  const hardenedPrompt = useMemo(() => {
    return buildHardenedPrompt(activeChallenge, enabledDefenses);
  }, [activeChallenge, enabledDefenses]);

  useEffect(() => {
    setPromptInput(activeChallenge.userPrompt);
    setResult(null);
  }, [activeChallenge.id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleToggleDefense = useCallback((defenseId: DefenseId) => {
    setEnabledDefenses((prev) => ({
      ...prev,
      [defenseId]: !prev[defenseId],
    }));
  }, []);

  const handleRunSimulation = useCallback(() => {
    if (promptInput.trim().length === 0) return;

    setIsAnalyzing(true);
    setResult(null);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      const simulation = evaluateSimulation(
        promptInput,
        activeChallenge,
        enabledDefenses,
      );
      setResult(simulation);
      setIsAnalyzing(false);

      setProgress((prev) => {
        const current = prev[selectedChallengeId];
        const next: ChallengeProgress = {
          ...current,
          attempts: current.attempts + 1,
          blocked: current.blocked + (simulation.status === "blocked" ? 1 : 0),
          compromised:
            current.compromised + (simulation.status === "compromised" ? 1 : 0),
          safe: current.safe + (simulation.status === "safe" ? 1 : 0),
          lastStatus: simulation.status,
          lastUpdated: Date.now(),
        };

        return {
          ...prev,
          [selectedChallengeId]: next,
        };
      });
    }, 650);
  }, [
    promptInput,
    activeChallenge,
    enabledDefenses,
    selectedChallengeId,
    setProgress,
  ]);

  const handleResetPrompt = useCallback(() => {
    setPromptInput(activeChallenge.userPrompt);
    setResult(null);
  }, [activeChallenge.userPrompt]);

  return (
    <section className="relative">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <ChallengeList
            challenges={challenges}
            selectedChallengeId={selectedChallengeId}
            onSelectChallenge={setSelectedChallengeId}
            progress={progress}
          />

          <ProgressTracker
            progress={progress}
            challengeIds={challengeIds}
            isReady={isReady}
            onReset={resetProgress}
          />
        </aside>

        <div className="space-y-6">
          <SimulationConsole
            activeChallenge={activeChallenge}
            promptInput={promptInput}
            isAnalyzing={isAnalyzing}
            onPromptChange={setPromptInput}
            onResetPrompt={handleResetPrompt}
            onRunSimulation={handleRunSimulation}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DefenseControls
              defenseMechanisms={defenseMechanisms}
              enabledDefenses={enabledDefenses}
              onToggleDefense={handleToggleDefense}
              hardenedPrompt={hardenedPrompt}
            />

            <SimulationResultDisplay
              result={result}
              isAnalyzing={isAnalyzing}
              defenseMap={defenseMap}
            />
          </div>

          <EducationalPanel activeChallenge={activeChallenge} />
        </div>
      </div>
    </section>
  );
};

export default SecurityPlayground;
