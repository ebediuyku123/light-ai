import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        for (const shortcut of shortcuts) {
            const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatch = shortcut.alt ? event.altKey : !event.altKey;

            if (event.key === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
                event.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}

// Predefined shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
    {
        key: "k",
        ctrl: true,
        description: "Sohbeti temizle",
        action: () => { } // Will be overridden
    },
    {
        key: "/",
        ctrl: true,
        description: "Kısayolları göster/gizle",
        action: () => { }
    },
    {
        key: "Escape",
        description: "Modalları kapat",
        action: () => { }
    }
];
