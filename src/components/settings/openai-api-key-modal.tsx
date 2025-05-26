"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_KEY_STORAGE_KEY = "openai_api_key";

interface OpenAIApiKeyModalProps {
  children: React.ReactNode; // To wrap the trigger button
}

export function OpenAIApiKeyModal({ children }: OpenAIApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      } else {
        setApiKey(""); // Clear if no key is stored
      }
      setMessage(null); // Clear previous messages when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    setMessage(null);
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "API key không được để trống." });
      return;
    }

    // Basic validation (starts with sk- and has a certain length, e.g. > 30)
    // This is a very basic check and OpenAI might change their key format.
    if (!apiKey.startsWith("sk-") || apiKey.length < 30) {
        setMessage({ type: "error", text: "Định dạng API key không hợp lệ. Key thường bắt đầu bằng 'sk-'." });
        return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      setMessage({ type: "success", text: "Đã lưu API key!" });
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 1500); // Close modal after 1.5 seconds
    } catch (error) {
      console.error("Lỗi lưu API key:", error);
      setMessage({ type: "error", text: "Lỗi khi lưu API key. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  const getMaskedApiKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cài đặt OpenAI API Key</DialogTitle>
          <DialogDescription>
            Nhập OpenAI API key của bạn để sử dụng các tính năng AI. Key sẽ được lưu trữ cục bộ trên trình duyệt của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey ? (apiKey.startsWith("sk-") ? getMaskedApiKey(apiKey) : apiKey) : ""}
              onFocus={() => {
                // Show full key on focus if it was previously masked
                const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
                if (storedApiKey) setApiKey(storedApiKey);
              }}
              onBlur={() => {
                // Re-mask if it's a valid-looking key after blur, unless it's empty
                if (apiKey.startsWith("sk-")) {
                  // No need to re-mask here, display value is already masked or full based on focus
                }
              }}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (message) setMessage(null); // Clear message on input change
              }}
              placeholder="Nhập API key của bạn (ví dụ: sk-...)"
              className="col-span-3"
            />
          </div>
          {message && (
            <div className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsOpen(false); setMessage(null); }}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}