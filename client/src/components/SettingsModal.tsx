import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, X, Palette, Zap, Download, Keyboard } from "lucide-react";
import { useSettings, AI_PERSONALITIES } from "@/hooks/use-settings";
import { useExportChat } from "@/hooks/use-chat";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings } = useSettings();
    const exportChat = useExportChat();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">Ayarlar</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Theme Selection */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold">Tema</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(["dark", "oled", "light"] as const).map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => updateSettings({ theme })}
                                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === theme
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="text-sm font-medium capitalize">{theme}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {theme === "oled" && "Saf Siyah"}
                                            {theme === "dark" && "Koyu Gri"}
                                            {theme === "light" && "Aydınlık"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* AI Personality */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold">AI Kişiliği</h3>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(AI_PERSONALITIES).map(([key, personality]) => (
                                    <button
                                        key={key}
                                        onClick={() => updateSettings({ aiPersonality: key as any })}
                                        className={`w-full p-4 rounded-xl border transition-all text-left ${settings.aiPersonality === key
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{personality.emoji}</span>
                                            <div className="flex-1">
                                                <div className="font-medium">{personality.name}</div>
                                                <div className="text-sm text-muted-foreground">{personality.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Export Chat */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Download className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold">Sohbeti Dışa Aktar</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        exportChat("txt");
                                        onClose();
                                    }}
                                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary hover:bg-primary/10 transition-all text-left"
                                >
                                    <div className="font-medium">TXT Dosyası</div>
                                    <div className="text-sm text-muted-foreground mt-1">Okunabilir metin</div>
                                </button>
                                <button
                                    onClick={() => {
                                        exportChat("json");
                                        onClose();
                                    }}
                                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary hover:bg-primary/10 transition-all text-left"
                                >
                                    <div className="font-medium">JSON Dosyası</div>
                                    <div className="text-sm text-muted-foreground mt-1">Yapısal veri</div>
                                </button>
                            </div>
                        </section>

                        {/* Keyboard Shortcuts */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Keyboard className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold">Klavye Kısayolları</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                    <span className="text-muted-foreground">Sohbeti temizle</span>
                                    <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">Ctrl+K</kbd>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                    <span className="text-muted-foreground">Mesaj gönder</span>
                                    <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">Enter</kbd>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                    <span className="text-muted-foreground">Yeni satır</span>
                                    <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">Shift+Enter</kbd>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                    <span className="text-muted-foreground">Modalları kapat</span>
                                    <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">Escape</kbd>
                                </div>
                            </div>
                        </section>

                        {/* Toggles */}
                        <section className="space-y-3">
                            <label className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all">
                                <span className="font-medium">Zaman damgalarını göster</span>
                                <input
                                    type="checkbox"
                                    checked={settings.showTimestamps}
                                    onChange={(e) => updateSettings({ showTimestamps: e.target.checked })}
                                    className="w-5 h-5 rounded accent-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all">
                                <span className="font-medium">Enter ile gönder</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enterToSend}
                                    onChange={(e) => updateSettings({ enterToSend: e.target.checked })}
                                    className="w-5 h-5 rounded accent-primary"
                                />
                            </label>
                        </section>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
