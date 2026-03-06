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
import { showLoading, hideLoading } from "@/store/loadingSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { MessageType } from "@/types";
import { saveAiKey } from "@/store/aiKey";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LOCAL_STORAGE_KEY } from "@/consts";

interface SettingAIKeyModalProps {
  children: React.ReactNode; // To wrap the trigger button
}

export function SettingAIKeyModal({ children }: SettingAIKeyModalProps) {
  const [aiKey, setAiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState(LOCAL_STORAGE_KEY.GEMINI_AI_TOKEN);
  const [message, setMessage] = useState<MessageType | null>(null);
  const isLoading = useAppSelector((state) => state.isLoading);
  const savedAiKey = useAppSelector((state) => state.aiKey);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen) {
      if (savedAiKey?.label && savedAiKey.value) {
        setLabel(savedAiKey.label);
        setAiKey(savedAiKey.value);
      } else {
        // Clear if no key is stored
        setLabel(LOCAL_STORAGE_KEY.GEMINI_AI_TOKEN)
        setAiKey(""); 
      }
      setMessage(null); // Clear previous messages when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    setMessage(null);
    if (!aiKey.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập AI key!" });
      return;
    }

    // Basic validation (starts with sk- and has a certain length, e.g. > 30)
    // This is a very basic check and OpenAI might change their key format.
    if (label == LOCAL_STORAGE_KEY.OPEN_AI_TOKEN && (!aiKey.startsWith("sk-") || aiKey.length < 30)) {
      setMessage({ type: "error", text: "Định dạng Open API key không hợp lệ. Key thường bắt đầu bằng 'sk-' và lớn hơn 30 ký tự" });
      return;
    }

    dispatch(showLoading());
    try {
      dispatch(saveAiKey({label: label, value: aiKey}));
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
            <Select
              value={label}
              onValueChange={setLabel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LOCAL_STORAGE_KEY.OPEN_AI_TOKEN}>
                  {LOCAL_STORAGE_KEY.OPEN_AI_TOKEN}
                </SelectItem>
                <SelectItem value={LOCAL_STORAGE_KEY.GEMINI_AI_TOKEN}>
                  {LOCAL_STORAGE_KEY.GEMINI_AI_TOKEN}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="api-key"
              value={aiKey}
              onChange={(e) => {
                setAiKey(e.target.value);
              }}
              placeholder="Nhập key AI của bạn"
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