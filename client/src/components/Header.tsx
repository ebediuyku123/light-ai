import { Trash2, Sparkles, Settings, WifiOff, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { useClearChat } from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  onOpenSettings?: () => void;
  isOnline?: boolean;
}

export function Header({ onOpenSettings, isOnline = true }: HeaderProps) {
  const { mutate: clearChat, isPending } = useClearChat();
  const { toast } = useToast();

  const handleClear = () => {
    clearChat(undefined, {
      onSuccess: () => {
        toast({
          title: "Tertemiz oldu!",
          description: "Tüm geçmiş silindi kanka, yeni bir sayfa açtık.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Hata oldu",
          description: "Silemedik ya, bi' daha dene istersen.",
        });
      }
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 md:h-20 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-2 bg-primary/20 rounded-full blur-xl pointer-events-none"
          />
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-secondary to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 relative z-10 border border-white/10 group-hover:border-white/20 transition-colors">
            <Sparkles className="text-white w-6 h-6 md:w-7 md:h-7 animate-pulse" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0d0d12] z-20 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
            Muhabbet AI
          </h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Çevrimiçi • Vizyoner
                </p>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <p className="text-[10px] md:text-xs text-red-400/80 uppercase tracking-widest font-semibold">
                  Bağlantı Yok
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 md:p-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors duration-200"
            title="Ayarlar"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
            <span className="sr-only">Ayarlar</span>
          </button>
        )}

        {/* Clear Chat Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isPending}
              className="p-2 md:p-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-destructive transition-colors duration-200 group relative"
              title="Geçmişi Temizle"
            >
              <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              <span className="sr-only">Geçmişi Temizle</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a20] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl">
                Emin misin kanka?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-base">
                Tüm konuşmaları sileceğiz. Geri getiremem bak, sonra üzülme.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white hover:text-white">
                Vazgeçtim
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClear}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
              >
                Sil Gitsin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}

