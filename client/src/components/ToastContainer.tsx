import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { type Toast } from "@/hooks/use-toast-notifications";

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const colors = {
        success: "bg-green-500/10 border-green-500/30 text-green-400",
        error: "bg-red-500/10 border-red-500/30 text-red-400",
        info: "bg-blue-500/10 border-blue-500/30 text-blue-400"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl min-w-[280px] max-w-md ${colors[toast.type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
