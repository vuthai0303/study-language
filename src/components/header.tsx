import { Button } from "@/components/ui/button";
import { Navigation } from "./navigation";
import { SettingAIKeyModal } from "./settings/setting-ai-key-modal";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">
            <Link href="/">StudyLanguage</Link>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Navigation />
          <SettingAIKeyModal>
            <Button variant="outline" size="icon">
              ⚙️
              <span className="sr-only">Cài đặt</span>
            </Button>
          </SettingAIKeyModal>
        </div>
      </div>
    </header>
  );
}
