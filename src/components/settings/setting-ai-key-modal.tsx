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
import { MessageType, ProviderAIType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PROVIDER_AI } from "@/consts";
import { getLocalStoreAiKey, setLocalStoreAiKey } from "@/lib/localStorage";

interface SettingAIKeyModalProps {
  children: React.ReactNode; // To wrap the trigger button
}

export function SettingAIKeyModal({ children }: SettingAIKeyModalProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.isLoading);
  const savedAiKey = getLocalStoreAiKey();
  
  const [isOpen, setIsOpen] = useState(false);
  const [aiKey, setAiKey] = useState("");
  const [modelAI, setModelAI] = useState("gpt-5.4-mini-2026-03-17");
  const [provider, setProvider] = useState<ProviderAIType>("GEMINI");
  const [message, setMessage] = useState<MessageType | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (savedAiKey?.provider && savedAiKey.key) {
        setProvider(savedAiKey.provider);
        setAiKey(savedAiKey.key);
      } else {
        // Clear if no key is stored
        setProvider("GEMINI")
        setAiKey(""); 
      }
      setMessage(null); // Clear previous messages when modal opens
    }
  }, [isOpen, savedAiKey]);

  const handleSave = () => {
    setMessage(null);
    if (!aiKey.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập AI key!" });
      return;
    }

    // Basic validation (starts with sk- and has a certain length, e.g. > 30)
    // This is a very basic check and OpenAI might change their key format.
    if (provider == "OPENAI" && (!aiKey.startsWith("sk-") || aiKey.length < 30)) {
      setMessage({ type: "error", text: "Định dạng Open API key không hợp lệ. Key thường bắt đầu bằng 'sk-' và lớn hơn 30 ký tự" });
      return;
    }

    dispatch(showLoading());
    try {
      setLocalStoreAiKey({provider: provider, key: aiKey, model: modelAI});
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

          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-2">
              <Select
                value={provider}
                onValueChange={(value) => setProvider(value == "OPENAI" ? "OPENAI" : "GEMINI")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp AI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PROVIDER_AI.OPENAI}>
                    {PROVIDER_AI.OPENAI}
                  </SelectItem>
                  <SelectItem value={PROVIDER_AI.GEMINI}>
                    {PROVIDER_AI.GEMINI}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              id="api-key"
              value={aiKey}
              onChange={(e) => {
                setAiKey(e.target.value);
              }}
              placeholder="Nhập key AI của bạn"
              className="col-span-7"
            />
            <Input
              id="model"
              value={modelAI}
              onChange={(e) => {
                setModelAI(e.target.value);
              }}
              placeholder="Nhập model AI sẽ sử dụng"
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