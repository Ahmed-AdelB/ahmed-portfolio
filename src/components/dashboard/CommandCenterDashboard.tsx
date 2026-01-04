import React, { useEffect, useState } from "react";
import { terminalMode } from "../../stores/terminal";
import { useStore } from "@nanostores/react";
import {
  Shield,
  AlertTriangle,
  Activity,
  Terminal,
  Cpu,
  Wifi,
  Lock,
  Globe,
  Zap,
  Radio,
  Server,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { challenges, statusMeta } from "../../data/security-challenges";
import type { Challenge } from "../../types/security";
import { PrayerTimeWidget } from "../features/PrayerTimeWidget";

// --- Mock Data Generators ---

const generateLog = () => {
  const actions = ["Blocked", "Detected", "Analyzing", "Mitigated", "Scanning"];
  const types = ["SQL Injection", "XSS Attempt", "Brute Force", "Port Scan", "DDoS"];
  const ips = [
    "192.168.1.105",
    "10.0.0.4",
    "172.16.254.1",
    "45.33.22.11",
    "203.0.113.5",
  ];
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    action: actions[Math.floor(Math.random() * actions.length)],
    type: types[Math.floor(Math.random() * types.length)],
    ip: ips[Math.floor(Math.random() * ips.length)],
  };
};

const SystemStatus = () => {
  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState(45);
  const [net, setNet] = useState(230);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setMem((prev) => Math.min(100, Math.max(0, prev + (Math.random() * 5 - 2.5))));
      setNet((prev) => Math.max(0, prev + (Math.random() * 50 - 25)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatusCard
        label="CPU Load"
        value={`${cpu.toFixed(1)}%`}
        icon={Cpu}
        color={cpu > 80 ? "text-red-500" : "text-green-500"}
      />
      <StatusCard
        label="Memory"
        value={`${mem.toFixed(1)}%`}
        icon={Database}
        color="text-blue-500"
      />
      <StatusCard
        label="Network In"
        value={`${net.toFixed(0)} MB/s`}
        icon={Wifi}
        color="text-yellow-500"
      />
      <StatusCard
        label="Uptime"
        value="99.99%"
        icon={Activity}
        color="text-purple-500"
      />
    </div>
  );
};

const StatusCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
    </div>
    <Icon className={`w-8 h-8 opacity-20 ${color}`} />
  </div>
);

const ThreatMapPanel = () => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-500 font-mono text-sm flex items-center gap-2">
          <Globe className="w-4 h-4" /> ACTIVE THREATS
        </h3>
        <span className="text-xs text-zinc-500 animate-pulse">LIVE FEED</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
        {challenges.map((challenge: Challenge) => (
          <div
            key={challenge.id}
            className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded flex items-start gap-3 hover:border-red-500/50 transition-colors"
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 ${
                challenge.difficulty === 'Hard' ? 'text-red-500' :
                challenge.difficulty === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
            }`} />
            <div>
              <p className="text-zinc-200 text-sm font-bold font-mono">{challenge.title}</p>
              <p className="text-zinc-500 text-xs mt-1">{challenge.context.substring(0, 60)}...</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">
                    {challenge.difficulty.toUpperCase()}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">
                    {challenge.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkGraph = () => {
    // Simple visual simulation of network traffic using bars
    const [bars, setBars] = useState<number[]>(Array(20).fill(10));

    useEffect(() => {
        const interval = setInterval(() => {
            setBars(prev => {
                const newBars = [...prev.slice(1), Math.random() * 100];
                return newBars;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 h-full flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-500 font-mono text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" /> NETWORK TRAFFIC
                </h3>
            </div>
            <div className="flex-1 flex items-end justify-between gap-1 h-32 overflow-hidden">
                {bars.map((height, i) => (
                    <motion.div
                        key={i}
                        className="bg-blue-500/50 w-full rounded-t-sm"
                        animate={{ height: `${height}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-600 font-mono uppercase">
                <span>Inbound</span>
                <span>Outbound</span>
            </div>
        </div>
    )
}

const SecurityLog = () => {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        // Initial population
        setLogs(Array(5).fill(0).map(generateLog));

        const interval = setInterval(() => {
            setLogs(prev => [generateLog(), ...prev.slice(0, 20)]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-500 font-mono text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> SYSTEM LOGS
                </h3>
            </div>
            <div className="flex-1 overflow-hidden font-mono text-xs">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-4 py-1.5 border-b border-zinc-800/50 text-zinc-400"
                        >
                            <span className="text-zinc-600 w-20 shrink-0">{log.timestamp}</span>
                            <span className={
                                log.action === "Blocked" ? "text-green-500 font-bold w-20 shrink-0" :
                                log.action === "Detected" ? "text-red-500 font-bold w-20 shrink-0" :
                                "text-blue-500 w-20 shrink-0"
                            }>{log.action}</span>
                            <span className="text-zinc-300 flex-1 truncate">{log.type}</span>
                            <span className="text-zinc-600 hidden md:block">{log.ip}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

const QuickActions = () => {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
             <h3 className="text-purple-500 font-mono text-sm flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4" /> ACTIONS
            </h3>
            <div className="grid grid-cols-2 gap-2">
                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs font-mono transition-colors text-left flex items-center gap-2"
                 onClick={() => window.open('/security-playground', '_blank')}>
                    <Shield className="w-3 h-3" /> Playground
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs font-mono transition-colors text-left flex items-center gap-2"
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                    <Terminal className="w-3 h-3" /> Cmd Palette
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs font-mono transition-colors text-left flex items-center gap-2">
                     <Server className="w-3 h-3" /> Flush DNS
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs font-mono transition-colors text-left flex items-center gap-2">
                     <Radio className="w-3 h-3" /> Ping Test
                </button>
            </div>
        </div>
    )
}

export const CommandCenterDashboard = () => {
  const isTerminalMode = useStore(terminalMode);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Only allow access if terminal mode is active
    // We give a small delay to allow hydration
    const timer = setTimeout(() => {
        if (!isTerminalMode) {
           window.location.href = "/";
        } else {
            setAuthorized(true);
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [isTerminalMode]);

  if (!authorized) return (
      <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono p-4">
          <div className="text-center space-y-4">
              <Lock className="w-12 h-12 mx-auto animate-pulse" />
              <h1 className="text-2xl font-bold">ACCESS RESTRICTED</h1>
              <p className="text-zinc-500">Authenticating...</p>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6">
      {/* Header */}
      <header className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">COMMAND CENTER</h1>
            <p className="text-zinc-500 text-sm mt-1">SOC / DASHBOARD / V.2.1.0</p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-zinc-500 text-xs">SYSTEM STATUS</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-500 font-bold">OPERATIONAL</span>
            </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_1fr_1fr] gap-6 h-[calc(100vh-150px)]">
        
        {/* Top Row: Stats */}
        <div className="md:col-span-4">
            <SystemStatus />
        </div>

        {/* Middle Row: Left (Threats) & Right (Graph + Logs) */}
        <div className="md:col-span-1 md:row-span-2 h-96 md:h-auto">
            <ThreatMapPanel />
        </div>

        <div className="md:col-span-2 h-64 md:h-auto">
            <SecurityLog />
        </div>

        <div className="md:col-span-1 flex flex-col gap-6">
            <div className="h-48">
                <NetworkGraph />
            </div>
            <div className="flex-1">
                <QuickActions />
            </div>
        </div>
      </div>
      <PrayerTimeWidget />
    </div>
  );
};
