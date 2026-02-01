import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Message } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "muhabbet_ai_chat_history";

// Extended Message type with image support
export interface ExtendedMessage extends Message {
  imageUrl?: string;
  imageBase64?: string;
}

// Fetch chat history from LocalStorage
export function useChatHistory() {
  return useQuery({
    queryKey: [api.chat.history.path],
    queryFn: async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        // First-time welcome message
        const now = new Date();
        const welcomeMessage: ExtendedMessage = {
          id: Date.now(),
          role: "assistant",
          content: `Selam! 👋 Ben Muhabbet AI, Ahmet'in en yeni projesi. Seninle her türlü derin mevzuyu konuşmaya hazırım.

📅 Bugün ${now.toLocaleDateString('tr-TR', { weekday: 'long' })}, ${now.toLocaleDateString('tr-TR')} ve saat ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}.

Benimle ne konuşmak istersin? Felsefe, teknoloji, sanat, günlük hayat... Her şey olabilir. Hatta görseller de yükleyebilirsin, analiz edeyim.`,
          timestamp: now as any
        };
        const initialHistory = [welcomeMessage];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialHistory));
        return initialHistory;
      }
      try {
        const parsed = JSON.parse(stored);
        // Ensure timestamps are Date objects for formatting
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        return [];
      }
    },
    staleTime: Infinity,
  });
}

// Send a message (with optional image)
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, imageUrl, imageBase64 }: {
      content: string;
      imageUrl?: string;
      imageBase64?: string;
    }) => {
      const history = queryClient.getQueryData<ExtendedMessage[]>([api.chat.history.path]) || [];

      // 1. Create and save user message locally
      const userMessage: ExtendedMessage = {
        id: Math.floor(Math.random() * 1000000),
        role: "user",
        content,
        timestamp: new Date() as any,
        imageUrl,
        imageBase64
      };

      const updatedHistoryWithUser = [...history, userMessage];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistoryWithUser));
      queryClient.setQueryData([api.chat.history.path], updatedHistoryWithUser);

      // 2. Get AI response from backend
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          imageUrl,
          imageBase64,
          history: updatedHistoryWithUser.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!res.ok) throw new Error("Mesaj gitmedi be, tekrar dene.");
      const aiMessage = await res.json();

      // 3. Save AI message locally
      const finalHistory = [...updatedHistoryWithUser, aiMessage];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalHistory));

      return aiMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path] });
    },
  });
}

// Delete a single message
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: number) => {
      const history = queryClient.getQueryData<ExtendedMessage[]>([api.chat.history.path]) || [];
      const updatedHistory = history.filter(m => m.id !== messageId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    },
    onSuccess: (updatedHistory) => {
      queryClient.setQueryData([api.chat.history.path], updatedHistory);
    },
  });
}

// Regenerate last AI response
export function useRegenerateResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const history = queryClient.getQueryData<ExtendedMessage[]>([api.chat.history.path]) || [];

      // Find last user message
      let lastUserIndex = -1;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === "user") {
          lastUserIndex = i;
          break;
        }
      }

      if (lastUserIndex === -1) throw new Error("Yeniden oluşturulacak mesaj yok.");

      const lastUserMsg = history[lastUserIndex];

      // Remove messages after last user message
      const historyUpToUser = history.slice(0, lastUserIndex + 1);

      // Get new AI response
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: lastUserMsg.content,
          imageUrl: lastUserMsg.imageUrl,
          imageBase64: lastUserMsg.imageBase64,
          history: historyUpToUser.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!res.ok) throw new Error("Yeniden oluşturulamadı.");
      const aiMessage = await res.json();

      const finalHistory = [...historyUpToUser, aiMessage];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalHistory));

      return aiMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path] });
    },
  });
}

// Clear chat history
export function useClearChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
    onSuccess: () => {
      queryClient.setQueryData([api.chat.history.path], []);
      // Trigger refetch to show welcome message
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path] });
    },
  });
}

// Export chat to JSON or TXT
export function useExportChat() {
  return (format: "json" | "txt" = "txt") => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return;

    try {
      const history: ExtendedMessage[] = JSON.parse(stored);
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === "json") {
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `muhabbet-ai-chat-${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const text = history.map(m => {
          const time = new Date(m.timestamp).toLocaleString('tr-TR');
          const role = m.role === "user" ? "SEN" : "AI";
          return `[${time}] ${role}: ${m.content}`;
        }).join("\n\n");

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `muhabbet-ai-chat-${timestamp}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export failed:", e);
    }
  };
}

// Check if vision API is available
export function useVisionAvailable() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    fetch("/api/vision/available")
      .then(res => res.json())
      .then(data => setAvailable(data.available))
      .catch(() => setAvailable(false));
  }, []);

  return available;
}

