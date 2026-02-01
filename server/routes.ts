import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { getChatResponse, getChatResponseWithVision, isVisionAvailable } from "./openai";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Standard text chat
  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { content, history, imageUrl, imageBase64 } = z.object({
        content: z.string(),
        history: z.array(z.object({
          role: z.string(),
          content: z.any()
        })).optional(),
        imageUrl: z.string().optional(),
        imageBase64: z.string().optional()
      }).parse(req.body);

      // 1. Get AI response using provided history for context
      const chatContext = (history || [])
        .filter(m => m.content) // Filter out messages without content
        .map(m => ({ role: m.role, content: m.content as string })); // Ensure content is string

      let aiContent: string;

      // Use vision API if image is provided
      if (imageUrl || imageBase64) {
        aiContent = await getChatResponseWithVision(
          [...chatContext, { role: "user", content }],
          imageUrl,
          imageBase64
        );
      } else {
        aiContent = await getChatResponse([
          ...chatContext,
          { role: "user", content }
        ]);
      }

      // 2. Return AI message (Frontend will handle storage)
      const aiMessage = {
        id: Math.floor(Math.random() * 1000000),
        role: "assistant",
        content: aiContent,
        timestamp: new Date()
      };

      res.json(aiMessage);
    } catch (error: any) {
      console.error("Chat error:", error);

      const errorMessage = error?.message?.includes('validation')
        ? "Mesaj formatı hatalı, tekrar dener misin?"
        : "Bi sıkıntı çıktı kanka, sonra tekrar dene.";

      res.status(500).json({ message: errorMessage });
    }
  });

  // Check vision availability
  app.get("/api/vision/available", async (_req, res) => {
    res.json({ available: isVisionAvailable() });
  });

  // No-op endpoints since storage is now local
  app.get(api.chat.history.path, async (_req, res) => {
    res.json([]);
  });

  app.post(api.chat.clear.path, async (_req, res) => {
    res.status(204).send();
  });

  return httpServer;
}
