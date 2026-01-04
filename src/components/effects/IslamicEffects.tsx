import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslamicEasterEggs } from '../../hooks/useIslamicEasterEggs';

export const IslamicEffects: React.FC = () => {
  const { activeEgg, eggData } = useIslamicEasterEggs();

  return (
    <AnimatePresence>
      {activeEgg === 'bismillah' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 pointer-events-none select-none"
        >
          <motion.div
             initial={{ scale: 0.8, opacity: 0, pathLength: 0 }}
             animate={{ scale: 1, opacity: 1, pathLength: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="text-emerald-500 text-5xl md:text-8xl font-serif text-center leading-relaxed drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.div>
        </motion.div>
      )}

      {activeEgg === 'salaam' && (
        <motion.div
           initial={{ y: 50, opacity: 0, x: 50 }}
           animate={{ y: 0, opacity: 1, x: 0 }}
           exit={{ y: 20, opacity: 0 }}
           className="fixed bottom-8 right-8 z-[100] bg-zinc-900/95 text-emerald-50 px-6 py-4 rounded-lg shadow-xl border border-emerald-500/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <div>
                <p className="font-bold text-emerald-400 text-lg">Wa alaykumu s-salam!</p>
                <p className="text-sm text-emerald-100/70 font-mono">And upon you be peace.</p>
             </div>
          </div>
        </motion.div>
      )}

      {activeEgg === '99' && eggData && (
        <motion.div
           initial={{ scale: 0.9, opacity: 0, y: -20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.9, opacity: 0, y: -20 }}
           className="fixed top-24 right-4 md:right-10 z-[100] bg-zinc-950/95 p-6 rounded-xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] max-w-sm backdrop-blur-md"
        >
          <div className="text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            <h3 className="text-4xl mb-3 font-serif text-emerald-400 mt-2">{eggData.ar}</h3>
            <h4 className="text-xl font-bold mb-2 text-white">{eggData.en}</h4>
            <div className="w-12 h-0.5 bg-zinc-800 mx-auto mb-3"></div>
            <p className="text-zinc-400 italic text-sm leading-relaxed">{eggData.meaning}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
