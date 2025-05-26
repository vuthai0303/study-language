import { Button } from "@/components/ui/button";
import { Navigation } from "./navigation";
import { OpenAIApiKeyModal } from "./settings/openai-api-key-modal";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">StudyLanguage</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Navigation />
          <OpenAIApiKeyModal>
            <Button variant="outline" size="icon">
              ⚙️
              <span className="sr-only">Cài đặt</span>
            </Button>
          </OpenAIApiKeyModal>
        </div>
      </div>
    </header>
  );
}