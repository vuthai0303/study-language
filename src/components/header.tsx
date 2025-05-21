import { Navigation } from "./navigation";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">StudyLanguage</h1>
        </div>
        <Navigation />
      </div>
    </header>
  );
}