import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navigation } from "./navigation";
import { SettingAIKeyModal } from "./settings/setting-ai-key-modal";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-[89px] md:h-16 flex-row flex-wrap items-center justify-between px-4 pb-2 gap-y-1">
        <div className="flex justify-start items-center order-1 basis-1/2 md:flex-1">
          <h1 className="text-xl font-bold">
            <Link href="/">StudyLanguage</Link>
          </h1>
        </div>
        <div className="flex justify-center items-center order-3 md:order-1 basis-full md:flex-1">
          <Navigation />
        </div>
        <div className="flex justify-end order-2 basis-1/2 md:flex-1">
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
