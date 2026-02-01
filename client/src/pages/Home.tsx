import { useEffect, useRef, useState } from "react";
import { useChatHistory, useSendMessage, useDeleteMessage, useRegenerateResponse } from "@/hooks/use-chat";
import { useSettings } from "@/hooks/use-settings";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { useToast } from "@/hooks/use-toast-notifications";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Header } from "@/components/Header";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsModal } from "@/components/SettingsModal";
import { ToastContainer } from "@/components/ToastContainer";
import { MessageSquareDashed, Ghost } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: messages = [], isLoading: isHistoryLoading, isError } = useChatHistory();
  const { mutate: sendMessage, isPending: isSending, isError: isSendError } = useSendMessage();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: regenerateResponse, isPending: isRegenerating } = useRegenerateResponse();
  const { settings } = useSettings();
  const { isOnline } = useConnectionStatus();
  const { toasts, showToast, removeToast } = useToast();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isRegenerating]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      description: "Sohbeti temizle",
      action: () => {
        // Trigger clear via header button logic
      }
    },
    {
      key: "Escape",
      description: "Modalları kapat",
      action: () => setIsSettingsOpen(false)
    }
  ]);

  const handleSend = ({ content, imageUrl, imageBase64 }: {
    content: string;
    imageUrl?: string;
    imageBase64?: string
  }) => {
    if (!isOnline) {
      showToast("İnternet bağlantın yok gibi. Bağlantını kontrol et.", "error");
      return;
    }

    sendMessage({ content, imageUrl, imageBase64 }, {
      onError: () => {
        showToast("Mesaj gönderilemedi. Tekrar dene.", "error");
      }
    });
  };

  const handleDelete = (messageId: number) => {
    deleteMessage(messageId, {
      onSuccess: () => {
        showToast("Mesaj silindi", "success");
      },
      onError: () => {
        showToast("Silinemedi. Tekrar dene.", "error");
      }
    });
  };

  const handleRegenerate = () => {
    regenerateResponse(undefined, {
      onSuccess: () => {
        showToast("Yanıt yenilendi", "success");
      },
      onError: () => {
        showToast("Yenilenemedi. Tekrar dene.", "error");
      }
    });
  };

  const handleCopy = () => {
    showToast("Mesaj kopyalandı", "success", 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative selection:bg-primary/30">

      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px] pointer-events-none -z-10 opacity-60 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/15 rounded-full blur-[160px] pointer-events-none -z-10 opacity-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-secondary/5 rounded-full blur-[200px] pointer-events-none -z-10 opacity-30" />

      <Header onOpenSettings={() => setIsSettingsOpen(true)} isOnline={isOnline} />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-4 px-4 md:px-6 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">

          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-muted-foreground animate-pulse">
                Yükleniyor kanka...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Ghost className="w-24 h-24 text-destructive/20 mb-4" />
              <h2 className="text-2xl font-bold font-display text-white mb-2">Hata Oldu</h2>
              <p className="text-muted-foreground">
                Bağlantı koptu galiba, sayfayı yenilemeyi dene.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-[50vh] text-center p-8 select-none"
            >
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl shadow-primary/10">
                <MessageSquareDashed className="w-12 h-12 text-secondary opacity-80" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3 tracking-tight">
                Naber la?
              </h2>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Bomboş duruyoruz burada. Konuşsana benle, canım sıkıldı.
                <br />
                <span className="text-primary/80 text-sm mt-2 block font-mono">
                  (Her türlü muhabbete varım. Hatta görsel de yükleyebilirsin!)
                </span>
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2 py-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isNew={index === messages.length - 1}
                    onDelete={msg.role === "user" ? handleDelete : undefined}
                    onRegenerate={msg.role === "assistant" && index === messages.length - 1 ? handleRegenerate : undefined}
                    onCopy={handleCopy}
                    showTimestamps={settings.showTimestamps}
                  />
                ))}
              </AnimatePresence>

              {/* Show typing indicator only when waiting for response */}
              {(isSending || isRegenerating) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}

              {isSendError && (
                <div className="text-center py-2">
                  <p className="text-xs text-destructive font-medium animate-pulse">
                    Bağlantı hatası, lütfen tekrar dene kanka.
                  </p>
                </div>
              )}

              <div ref={bottomRef} className="h-2" />
            </div>
          )}
        </div>
      </main>

      <ChatInput
        onSend={handleSend}
        isLoading={isSending || isRegenerating}
        enterToSend={settings.enterToSend}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

