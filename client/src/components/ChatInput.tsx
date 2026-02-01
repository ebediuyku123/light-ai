import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Loader2, Image as ImageIcon, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: { content: string; imageUrl?: string; imageBase64?: string }) => void;
  isLoading: boolean;
  enterToSend?: boolean;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ChatInput({ onSend, isLoading, enterToSend = true }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const validateAndProcessImage = async (file: File): Promise<boolean> => {
    setError(null);

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Sadece JPG, PNG, GIF veya WEBP formatları destekleniyor");
      return false;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Görsel 10MB'dan küçük olmalı");
      return false;
    }

    // Convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:image/...;base64, prefix

        setImagePreview(base64);
        setImageBase64(base64Data);
        resolve(true);
      };
      reader.onerror = () => {
        setError("Görsel yüklenirken hata oluştu");
        resolve(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await validateAndProcessImage(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await validateAndProcessImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !imageBase64) || isLoading) return;

    onSend({
      content: input.trim() || "(Görsel gönderildi)",
      imageBase64: imageBase64 || undefined
    });

    setInput("");
    removeImage();
    setError(null);

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-4xl mx-auto relative group">

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 rounded-lg border border-white/10"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Neon Glow Effect under the input */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/30 to-primary/30 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>

        <form
          onSubmit={handleSubmit}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative bg-muted/50 rounded-2xl border flex items-end overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300",
            isDragging ? "border-primary bg-primary/5" : "border-white/5"
          )}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-primary" />
                <p className="text-sm text-primary font-medium">Görseli buraya bırak</p>
              </div>
            </div>
          )}

          {/* Image Upload Button */}
          <div className="flex items-center pl-2 md:pl-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              title="Görsel ekle"
            >
              <ImageIcon size={20} />
            </button>

            {/* Mobile Camera Button */}
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                }
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all md:hidden"
              title="Kamera"
            >
              <Camera size={20} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bi' şeyler yaz kanka..."
            rows={1}
            className="flex-1 bg-transparent border-0 text-white placeholder:text-muted-foreground focus:ring-0 px-4 py-3 md:py-4 md:px-6 min-h-[50px] md:min-h-[60px] max-h-[120px] resize-none font-body text-base md:text-lg custom-scrollbar"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={(!input.trim() && !imageBase64) || isLoading}
            className={cn(
              "m-2 p-2 md:p-3 rounded-xl flex items-center justify-center transition-all duration-200",
              (input.trim() || imageBase64) && !isLoading
                ? "bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            ) : (
              <SendHorizontal className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
            )}
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-[10px] text-muted-foreground/50">
            {enterToSend
              ? "Enter'a bas gönder, Shift+Enter alt satıra geç."
              : "Shift+Enter mesaj gönder, Enter alt satıra geç."
            }
          </p>
        </div>
      </div>
    </div>
  );
}

