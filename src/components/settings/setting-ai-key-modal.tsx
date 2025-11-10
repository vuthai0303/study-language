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
import { showLoading, hideLoading } from "@/store/loadingSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { MessageType } from "@/types";
import { saveAiKey } from "@/store/aiKey";

interface SettingAIKeyModalProps {
  children: React.ReactNode; // To wrap the trigger button
}

export function SettingAIKeyModal({ children }: SettingAIKeyModalProps) {
  const [openAiKey, setOpenAiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const isLoading = useAppSelector((state) => state.isLoading);
  const aiKey = useAppSelector((state) => state.aiKey);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen) {
      if (aiKey) {
        setOpenAiKey(aiKey.OPEN_AI_TOKEN);
        setGeminiKey(aiKey.GEMINI_AI_TOKEN);
      } else {
        // Clear if no key is stored
        setOpenAiKey(""); 
        setGeminiKey("");
      }
      setMessage(null); // Clear previous messages when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    setMessage(null);
    if (!openAiKey.trim() && !geminiKey.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập 1 trong các AI key!" });
      return;
    }

    // Basic validation (starts with sk- and has a certain length, e.g. > 30)
    // This is a very basic check and OpenAI might change their key format.
    if (!openAiKey.startsWith("sk-") || openAiKey.length < 30) {
      setMessage({ type: "error", text: "Định dạng Open API key không hợp lệ. Key thường bắt đầu bằng 'sk-'." });
      return;
    }

    dispatch(showLoading());
    try {
      dispatch(saveAiKey({OPEN_AI_TOKEN: openAiKey, GEMINI_AI_TOKEN: geminiKey}));
      setMessage({ type: "success", text: "Đã lưu API key!" });
    } catch (error) {
      console.error("Lỗi lưu API key:", error);
      setMessage({ type: "error", text: "Lỗi khi lưu API key. Vui lòng thử lại." });
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-2/3 min-w-[425px]" style={{maxWidth: "80%"}}>
        <DialogHeader>
          <DialogTitle>Cài đặt AI API Key</DialogTitle>
          <DialogDescription>
            Nhập AI API key của bạn để sử dụng các tính năng AI. Key sẽ được lưu trữ cục bộ trên trình duyệt của bạn. Hiện tại đang hỗ trợ API của Gemini và OpenAI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              OpenAI API Key:
            </Label>
            <Input
              id="api-key"
              value={openAiKey}
              onChange={(e) => {
                setOpenAiKey(e.target.value);
              }}
              placeholder="Nhập OpenAI key của bạn (ví dụ: sk-...)"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gemini-key" className="text-right">
              Gemini API Key:
            </Label>
            <Input
              id="gemini-key"
              value={geminiKey}
              onChange={(e) => {
                setGeminiKey(e.target.value);
              }}
              placeholder="Nhập Gemini key của bạn (ví dụ: sk-...)"
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
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setMessage(null);
            }}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isLoading.value}>
            {isLoading.value ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}