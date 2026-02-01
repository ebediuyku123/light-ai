import { useState, useEffect } from "react";

export interface AppSettings {
    theme: "dark" | "oled" | "light";
    aiPersonality: "default" | "professional" | "casual" | "creative" | "technical";
    soundEnabled: boolean;
    showTimestamps: boolean;
    enterToSend: boolean;
}

const SETTINGS_KEY = "muhabbet_ai_settings";

const defaultSettings: AppSettings = {
    theme: "oled",
    aiPersonality: "default",
    soundEnabled: false,
    showTimestamps: true,
    enterToSend: true,
};

export function useSettings() {
    const [settings, setSettingsState] = useState<AppSettings>(() => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                return { ...defaultSettings, ...JSON.parse(stored) };
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    const updateSettings = (updates: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettingsState(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

        // Apply theme immediately
        if (updates.theme) {
            document.documentElement.setAttribute("data-theme", updates.theme);
        }
    };

    // Apply theme on mount
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", settings.theme);
    }, [settings.theme]);

    return { settings, updateSettings };
}

// AI Personality descriptions
export const AI_PERSONALITIES = {
    default: {
        name: "Varsayılan",
        description: "Dengeli, samimi ve zeki arkadaş",
        emoji: "🤖"
    },
    professional: {
        name: "Profesyonel",
        description: "İş odaklı, formal ve verimli",
        emoji: "💼"
    },
    casual: {
        name: "Gündelik",
        description: "Rahat, eğlenceli ve samimi",
        emoji: "😎"
    },
    creative: {
        name: "Yaratıcı",
        description: "İnovatif, hayal gücü yüksek",
        emoji: "🎨"
    },
    technical: {
        name: "Teknik",
        description: "Detaylı, analitik ve bilimsel",
        emoji: "🔬"
    }
};
