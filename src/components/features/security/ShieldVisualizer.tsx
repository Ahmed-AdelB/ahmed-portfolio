import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import type { FC } from "react";
import type { SimulationResult } from "../../../types/security";

interface ShieldVisualizerProps {
  result: SimulationResult | null;
  isAnalyzing: boolean;
}

export const ShieldVisualizer: FC<ShieldVisualizerProps> = ({
  result,
  isAnalyzing,
}) => {
  // Determine state
  const status = result?.status || "idle";
  const isCompromised = status === "compromised";
  const isBlocked = status === "blocked";
  const isSafe = status === "safe";

  // Colors
  const coreColor = isCompromised
    ? "bg-rose-500 shadow-rose-500/50"
    : isBlocked
      ? "bg-emerald-500 shadow-emerald-500/50"
      : "bg-blue-500 shadow-blue-500/50";

  const ringColor = isCompromised
    ? "border-rose-500/30"
    : isBlocked
      ? "border-emerald-500/30"
      : "border-blue-500/30";

  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      {/* Active Defenses Rings */}
      {result?.activeDefenses.map((defense, index) => (
        <motion.div
          key={defense.id}
          className={`absolute rounded-full border-2 ${ringColor}`}
          initial={{ width: "100%", height: "100%", opacity: 0 }}
          animate={{
            width: `${100 - (index + 1) * 15}%`,
            height: `${100 - (index + 1) * 15}%`,
            opacity: 1,
            rotate: isAnalyzing ? 360 : 0,
          }}
          transition={{
            width: { duration: 0.5 },
            height: { duration: 0.5 },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          }}
        />
      ))}

      {/* Attack Particles (Simulated) */}
      {isAnalyzing && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-2 w-2 rounded-full bg-rose-400"
              initial={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: 0,
              }}
              animate={{
                x: 0,
                y: 0,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}

      {/* Core Node */}
      <motion.div
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-colors duration-500 ${coreColor}`}
        animate={
          isCompromised
            ? {
                scale: [1, 1.2, 1],
                x: [0, -5, 5, -5, 5, 0],
              }
            : isAnalyzing
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
        }
        transition={{
          scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0 },
          x: { duration: 0.4 },
        }}
      >
        {isCompromised ? (
          <ShieldAlert className="h-8 w-8 text-white" />
        ) : isBlocked ? (
          <ShieldCheck className="h-8 w-8 text-white" />
        ) : (
          <Shield className="h-8 w-8 text-white" />
        )}
      </motion.div>

      {/* Status Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        {isAnalyzing ? (
          <span className="text-sm font-medium text-blue-500 animate-pulse">
            Analyzing Attack Vectors...
          </span>
        ) : result ? (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`text-sm font-bold ${
                isCompromised
                  ? "text-rose-500"
                  : isBlocked
                    ? "text-emerald-500"
                    : "text-blue-500"
              }`}
            >
              {isCompromised
                ? "SECURITY COMPROMISED"
                : isBlocked
                  ? "ATTACK BLOCKED"
                  : "SYSTEM SECURE"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Attack Power: {result.attackPower} vs Defense:{" "}
              {result.defensePower}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Ready to simulate</span>
        )}
      </div>
    </div>
  );
};
