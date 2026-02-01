import { cn } from "@/lib/utils";
import { type ExtendedMessage } from "@/hooks/use-chat";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bot, User, Copy, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: ExtendedMessage;
  isNew?: boolean;
  onDelete?: (id: number) => void;
  onRegenerate?: () => void;
  onCopy?: () => void;
  showTimestamps?: boolean;
}

export function ChatMessage({
  message,
  isNew,
  onDelete,
  onRegenerate,
  onCopy,
  showTimestamps = true
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState(isUser || !isNew ? message.content : "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isUser && isNew && displayedContent.length < message.content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(message.content.slice(0, displayedContent.length + 1));
      }, 15); // Adjust speed here
      return () => clearTimeout(timeout);
    }
  }, [message.content, displayedContent, isUser, isNew]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-3 md:gap-4 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/5",
          isUser
            ? "bg-gradient-to-br from-secondary via-cyan-500 to-blue-600 text-black"
            : "bg-gradient-to-br from-primary via-fuchsia-500 to-violet-700 text-white"
        )}
      >
        {isUser ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
      </motion.div>

      {/* Bubble */}
      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl shadow-xl text-sm md:text-[15px] leading-relaxed break-words relative group transition-all duration-500",
          isUser
            ? "bg-gradient-to-r from-secondary/90 to-cyan-600/90 text-black font-medium rounded-tr-sm"
            : "bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-tl-sm hover:border-primary/30"
        )}>
          {/* Image Preview if available */}
          {(message.imageUrl || message.imageBase64) && (
            <div className="mb-3">
              <img
                src={message.imageUrl || `data:image/jpeg;base64,${message.imageBase64}`}
                alt="Uploaded"
                className="max-w-full rounded-lg max-h-64 object-contain"
              />
            </div>
          )}

          <div className="whitespace-pre-wrap">{displayedContent}</div>

          {/* Action Buttons - Visible on hover */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1 p-1",
            isUser ? "-left-14" : "-right-14"
          )}>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
              title="Kopyala"
            >
              {copied ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-colors backdrop-blur-sm"
                title="Sil"
              >
                <Trash2 size={14} />
              </button>
            )}

            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors backdrop-blur-sm"
                title="Yeniden oluştur"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>

          {/* Footer Info */}
          {showTimestamps && (
            <div className={cn(
              "flex items-center gap-1.5 mt-1 opacity-60",
              isUser ? "justify-end" : "justify-start"
            )}>
              <span className="text-[10px] font-mono">
                {format(new Date(message.timestamp), "HH:mm", { locale: tr })}
              </span>
              {isUser && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-cyan-400"
                >
                  <CheckCheck size={12} />
                </motion.span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

