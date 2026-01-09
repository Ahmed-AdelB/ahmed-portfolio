import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { isWhoisOpen, closeWhois } from "../../stores/portfolioActions";

export default function WhoisProfile() {
  const isOpen = useStore(isWhoisOpen);
  const [copied, setCopied] = useState(false);

  const profile = {
    name: "Ahmed Adel",
    role: "AI Security Researcher & Engineer",
    location: "Dublin, Ireland",
    openToRelocation: ["Cork", "Galway", "Limerick"],
    stack: {
      languages: ["Python", "TypeScript", "Go"],
      security: ["AppSec", "CloudSec", "AI Safety"],
      frameworks: ["FastAPI", "Next.js", "LangChain"],
    },
    status: "Open for opportunities",
    email: "contact@ahmedalderai.com",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={closeWhois}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-blue-500/30 bg-[#0d1117] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 bg-[#161b22] px-4 py-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Terminal className="h-4 w-4" />
                <span className="font-mono text-sm font-bold">whois ahmed</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  title="Copy JSON"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={closeWhois}
                  className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto p-4 max-h-[70vh]">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-gray-300">
                  <span className="text-purple-400">{"{"}</span>
                  <span className="text-blue-400"> "name"</span>:{" "}
                  <span className="text-green-400">"{profile.name}"</span>,
                  <span className="text-blue-400"> "role"</span>:{" "}
                  <span className="text-green-400">"{profile.role}"</span>,
                  <span className="text-blue-400"> "location"</span>:{" "}
                  <span className="text-green-400">"{profile.location}"</span>,
                  <span className="text-blue-400"> "status"</span>:{" "}
                  <span className="text-yellow-400">"{profile.status}"</span>,
                  <span className="text-blue-400"> "stack"</span>:{" "}
                  <span className="text-purple-400">{"{"}</span>
                  <span className="text-blue-400"> "languages"</span>: [
                  <span className="text-green-400">"Python"</span>,{" "}
                  <span className="text-green-400">"TypeScript"</span>,{" "}
                  <span className="text-green-400">"Go"</span>],
                  <span className="text-blue-400"> "security"</span>: [
                  <span className="text-green-400">"AppSec"</span>,{" "}
                  <span className="text-green-400">"CloudSec"</span>,{" "}
                  <span className="text-green-400">"AI Safety"</span>]
                  <span className="text-purple-400"> {"}"}</span>,
                  <span className="text-blue-400"> "contact"</span>:{" "}
                  <span className="text-green-400">"{profile.email}"</span>
                  <span className="text-purple-400">{"}"}</span>
                </code>
              </pre>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 bg-[#161b22] px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Active Session</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
