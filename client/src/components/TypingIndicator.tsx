import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 md:gap-4 mb-6">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-violet-700 text-white flex items-center justify-center shadow-lg animate-pulse">
        <span className="text-xs font-bold">AI</span>
      </div>

      {/* Bubble */}
      <div className="flex flex-col items-start">
        <div className="px-4 py-3 md:px-5 md:py-4 rounded-2xl rounded-tl-sm bg-white/5 backdrop-blur-md border border-white/5 flex items-center gap-1.5 h-[46px]">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary/70"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary/70"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary/70"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 ml-1 animate-pulse">
          Yazıyor...
        </span>
      </div>
    </div>
  );
}
