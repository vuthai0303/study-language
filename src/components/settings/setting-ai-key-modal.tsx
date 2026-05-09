"use client";

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
import { PROVIDER_AI } from "@/consts";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { getLocalStoreAiKey, setLocalStoreAiKey } from "@/lib/localStorage";
import { setAIConfig } from "@/store/aiConfigSlice";
import { setLoading } from "@/store/loadingSlice";
import { AiKeyType, MessageType, ProviderAIType } from "@/types";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface SettingAIKeyModalProps {
  children: React.ReactNode;
}

export function SettingAIKeyModal({ children }: SettingAIKeyModalProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.isLoading);
  
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<ProviderAIType>("GEMINI");
  const [aiKey, setAiKey] = useState("");
  const [modelAI, setModelAI] = useState("");
  const [message, setMessage] = useState<MessageType | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedAiKey = getLocalStoreAiKey();
      if (savedAiKey?.provider && savedAiKey.key) {
        setProvider(savedAiKey.provider ?? "GEMINI");
        setAiKey(savedAiKey.key ?? "");
        setModelAI(savedAiKey.model ?? "")
      } else {
        // set default value if data not existed in localstorage
        setProvider("GEMINI")
        setAiKey("");
        setModelAI("")
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
    if (provider == "OPENAI" && (!aiKey.startsWith("sk-") || aiKey.length < 30)) {
      setMessage({ type: "error", text: "Định dạng Open API key không hợp lệ. Key thường bắt đầu bằng 'sk-' và lớn hơn 30 ký tự" });
      return;
    }

    dispatch(setLoading(true));
    try {
      const AIConfig: AiKeyType = {provider: provider, key: aiKey, model: modelAI};
      setLocalStoreAiKey(AIConfig);
      dispatch(setAIConfig(AIConfig))
      setMessage({ type: "success", text: "Đã lưu API key!" });
    } catch (error) {
      console.error("Lỗi lưu API key:", error);
      setMessage({ type: "error", text: "Lỗi khi lưu API key. Vui lòng thử lại." });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-2/3 min-w-[380px]" style={{maxWidth: "80%"}}>
        <DialogHeader>
          <DialogTitle>Cài đặt AI API Key</DialogTitle>
          <DialogDescription>
            Nhập AI API key của bạn để sử dụng các tính năng AI. Key sẽ được lưu trữ cục bộ trên trình duyệt của bạn. Hiện tại đang hỗ trợ API của Gemini và OpenAI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">

          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-12 md:col-span-2">
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
              className="col-span-12 md:col-span-7"
            />
            <Input
              id="model"
              value={modelAI}
              onChange={(e) => {
                setModelAI(e.target.value);
              }}
              placeholder="Nhập model AI sẽ sử dụng"
              className="col-span-12 md:col-span-3"
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