import React from "react";
import { useStore } from "@nanostores/react";
import {
  ctfStore,
  isMasterHacker,
  foundFlagsCount,
  type CTFFlags,
} from "../../stores/ctf";
import { motion } from "framer-motion";
import { Shield, Unlock, Lock, Terminal, Cpu, Bot } from "lucide-react";
import { themeStore, setTheme } from "../../stores/theme";

export const MasterBadge = () => {
  const flags = useStore(ctfStore);
  const isMaster = useStore(isMasterHacker);
  const count = useStore(foundFlagsCount);
  const currentTheme = useStore(themeStore);

  const flagDetails: Record<
    keyof CTFFlags,
    { icon: React.ElementType; label: string }
  > = {
    flag1_robots: { icon: Cpu, label: "Robots Protocol" },
    flag2_terminal: { icon: Terminal, label: "Terminal Access" },
    flag3_chatbot: { icon: Bot, label: "AI Injection" },
  };

  const handleEnableElite = () => {
    setTheme("hacker");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-mono tracking-tighter flex items-center gap-2">
          <Shield
            className={isMaster ? "text-green-500" : "text-muted-foreground"}
          />
          CTF Status
        </h2>
        <span className="font-mono text-xl">{count}/3</span>
      </div>

      <div className="space-y-4 mb-6">
        {Object.entries(flagDetails).map(([key, details]) => {
          const isFound = flags[key as keyof CTFFlags] === "true";
          const Icon = details.icon;
          return (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded border ${
                isFound
                  ? "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400"
                  : "bg-muted border-muted-foreground/20 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-mono text-sm">{details.label}</span>
              </div>
              {isFound ? <Unlock size={16} /> : <Lock size={16} />}
            </div>
          );
        })}
      </div>

      {isMaster && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="text-xl font-bold text-primary mb-2 animate-pulse">
              MASTER HACKER STATUS
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have bypassed all security layers. Elite Mode is now
              available.
            </p>

            {currentTheme !== "hacker" ? (
              <button
                onClick={handleEnableElite}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-mono font-bold rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(22,163,74,0.5)]"
              >
                <Terminal size={18} />
                ACTIVATE ELITE MODE
              </button>
            ) : (
              <div className="text-green-500 font-mono text-sm">
                Elite Mode Active
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
