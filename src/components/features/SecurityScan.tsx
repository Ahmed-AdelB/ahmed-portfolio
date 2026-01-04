import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Server, Lock, Activity, X } from 'lucide-react';
import { isScanOpen, closeScan } from '../../stores/portfolioActions';

export default function SecurityScan() {
  const isOpen = useStore(isScanOpen);
  const [stage, setStage] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStage('scanning');
      setProgress(0);
      setLogs([]);
      simulateScan();
    } else {
      setStage('idle');
    }
  }, [isOpen]);

  const simulateScan = async () => {
    const steps = [
      { msg: 'Initializing headers...', time: 400 },
      { msg: 'Checking SSL certificate...', time: 800 },
      { msg: 'Verifying DNS records...', time: 1200 },
      { msg: 'Analyzing content security policy...', time: 1600 },
      { msg: 'Ping test: Dublin [4ms]...', time: 2000 },
      { msg: 'Scanning for open ports...', time: 2400 },
      { msg: 'System Status: OPTIMAL', time: 3000 },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, Math.random() * 300 + 200));
      setLogs(prev => [...prev, step.msg]);
      setProgress(p => Math.min(p + 15, 100));
    }
    
    setProgress(100);
    setTimeout(() => setStage('complete'), 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeScan}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/30 bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="h-5 w-5" />
                <span className="font-mono font-bold">System Diagnostics</span>
              </div>
              <button 
                onClick={closeScan}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 font-mono text-sm">
              {stage === 'scanning' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Activity className="h-5 w-5 animate-pulse" />
                    <span>Running diagnostic scan...</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Logs */}
                  <div className="h-32 overflow-hidden rounded bg-black/50 p-3 text-xs font-mono text-gray-400">
                    {logs.map((log, i) => (
                      <div key={i} className="mb-1 text-emerald-500/80">
                        {`> ${log}`}
                      </div>
                    ))}
                    <div className="animate-pulse">_</div>
                  </div>
                </div>
              )}

              {stage === 'complete' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <div className="mb-1 flex justify-center text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="text-xs text-gray-400">System Status</div>
                      <div className="font-bold text-emerald-400">ONLINE</div>
                    </div>
                    
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <div className="mb-1 flex justify-center text-emerald-400">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div className="text-xs text-gray-400">SSL Certificate</div>
                      <div className="font-bold text-emerald-400">SECURE</div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <div className="mb-1 flex justify-center text-emerald-400">
                        <Server className="h-6 w-6" />
                      </div>
                      <div className="text-xs text-gray-400">Uptime</div>
                      <div className="font-bold text-emerald-400">99.9%</div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <div className="mb-1 flex justify-center text-emerald-400">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div className="text-xs text-gray-400">Latency</div>
                      <div className="font-bold text-emerald-400">24ms</div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    Scan ID: {Math.random().toString(36).substring(7).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
