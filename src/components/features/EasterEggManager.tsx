import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  easterEggs,
  unlockEgg,
  getFoundEggs,
  EASTER_EGG_DETAILS,
  type EasterEggId
} from "../../stores/easter-eggs";
import { setTheme } from "../../stores/theme";
import { enableMatrix, intensifyMatrix, isMatrixEnabled } from "../../stores/matrix";
import { Trophy, X } from "lucide-react";

export const EasterEggManager: React.FC = () => {
  const eggs = useStore(easterEggs);
  const [toast, setToast] = useState<{ id: EasterEggId; visible: boolean } | null>(null);
  const [showCollection, setShowCollection] = useState(false);
  
  // Key buffers
  const konamiBuffer = useRef<string[]>([]);
  const matrixBuffer = useRef<string[]>([]);
  const hackBuffer = useRef<string[]>([]);
  const logoClicks = useRef(0);

  const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const MATRIX_CODE = ["m", "a", "t", "r", "i", "x"];

  const handleUnlock = (id: EasterEggId) => {
    const isNew = unlockEgg(id);
    if (isNew) {
      setToast({ id, visible: true });
      setTimeout(() => setToast(null), 5000);
    }
    return isNew;
  };

  useEffect(() => {
    // Check for /coffee redirect
    if (window.location.pathname === "/coffee") {
      handleUnlock("coffee_redirect");
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Roll
    }

    // Logo Click Listener
    const attachLogoListener = () => {
      const logo = document.querySelector('a[href="/"], a[href="/ar"]');
      if (logo) {
        const handleClick = (e: Event) => {
          e.preventDefault(); // Prevent navigation during clicks
          logoClicks.current += 1;
          
          if (logoClicks.current === 10) {
            handleUnlock("logo_click");
            logoClicks.current = 0;
            // Allow navigation after unlock or reset? 
            // Better to let them navigate if they click once, but preventing default makes it hard.
            // Let's NOT prevent default, just count clicks. 
            // If they navigate away, state is lost, which is fine (harder challenge).
            // Actually, if they navigate, the component unmounts. 
            // So they have to click 10 times fast or without navigating.
            // To make it possible without navigating, users usually Ctrl+Click or just click fast.
            // Or maybe the logo prevents default if it's the current page.
          }
        };
        logo.addEventListener("click", handleClick);
        return () => logo.removeEventListener("click", handleClick);
      }
      return () => {};
    };
    
    // We might need to wait for DOM or use MutationObserver if logo isn't there yet, 
    // but usually it is.
    const removeLogoListener = attachLogoListener();

    // Keydown Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Konami
      konamiBuffer.current = [...konamiBuffer.current, key].slice(-KONAMI_CODE.length);
      if (JSON.stringify(konamiBuffer.current) === JSON.stringify(KONAMI_CODE)) {
        if (handleUnlock("konami")) {
           setTheme("hacker");
        } else {
           // Already found, just toggle trigger
           setTheme("hacker");
        }
        konamiBuffer.current = [];
      }

      // Matrix
      matrixBuffer.current = [...matrixBuffer.current, key.toLowerCase()].slice(-MATRIX_CODE.length);
      if (JSON.stringify(matrixBuffer.current) === JSON.stringify(MATRIX_CODE)) {
        if (handleUnlock("matrix")) {
          enableMatrix();
        } else {
          // If already enabled, intensify
          if (isMatrixEnabled.get()) {
            intensifyMatrix();
          } else {
            enableMatrix();
          }
        }
        matrixBuffer.current = [];
      }

      // Hack the Planet (ignoring spaces for simpler typing or checking key)
      // If user types "hack the planet", spaces are " " key.
      const normalizedKey = key.toLowerCase();
      if (normalizedKey.length === 1 || normalizedKey === " ") {
          hackBuffer.current = [...hackBuffer.current, normalizedKey].slice(-20); // Keep enough buffer
          const bufferString = hackBuffer.current.join("").replace(/ /g, "");
          const targetString = "hacktheplanet";
          
          if (bufferString.endsWith(targetString)) {
             handleUnlock("hack_the_planet");
             hackBuffer.current = [];
          }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      removeLogoListener();
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            className="fixed bottom-4 right-4 z-[100] bg-zinc-900 border border-emerald-500/50 text-white p-4 rounded-lg shadow-lg max-w-sm cursor-pointer"
            onClick={() => setShowCollection(true)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-400">Achievement Unlocked!</h3>
                <p className="font-medium">{EASTER_EGG_DETAILS[toast.id].title}</p>
                <p className="text-sm text-zinc-400 mt-1">{EASTER_EGG_DETAILS[toast.id].description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCollection && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-emerald-500/30 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Trophy size={20} />
                  Secrets Collection
                </h2>
                <button 
                  onClick={() => setShowCollection(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {(Object.keys(EASTER_EGG_DETAILS) as EasterEggId[]).map((id) => {
                  const isFound = !!eggs[id];
                  const details = EASTER_EGG_DETAILS[id];
                  return (
                    <div 
                      key={id} 
                      className={`p-3 rounded-lg border ${isFound ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-800/50 border-white/5'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono font-bold ${isFound ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {isFound ? details.title : '???'}
                        </span>
                        {isFound && <span className="text-xs text-emerald-500/70">FOUND</span>}
                      </div>
                      <p className={`text-sm ${isFound ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {isFound ? details.description : details.hint}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-zinc-950/50 border-t border-white/5 text-center text-xs text-zinc-500 font-mono">
                {getFoundEggs().length} / {Object.keys(EASTER_EGG_DETAILS).length} SECRETS FOUND
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EasterEggManager;
