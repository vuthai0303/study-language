import { Sentence } from "@/types/writing";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SentenceLayoutProps {
  sentence: Sentence;
  isCurrent: boolean;
  isLastSentence?: boolean;
}

export const SentenceLayout = ({
  sentence,
  isCurrent,
  isLastSentence,
}: SentenceLayoutProps) => {
  if (sentence.isCorrect) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="border-l-2 border-green-500 rounded-sm py-0.5 bg-green-200/50">
              <span className="font-semibold text-green-500 pl-1">
                {sentence.translation}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span>{sentence.text}</span>
          </TooltipContent>
        </Tooltip>
        <span>{!isLastSentence ? " " : ""}</span>
      </>
    );
  }

  if (isCurrent) {
    return (
      <>
        <span className="border-l-2 border-amber-500 rounded-sm py-0.5 bg-amber-300/30">
          <span className="font-semibold text-amber-500 pl-1">
            {sentence.text}
          </span>
        </span>
        <span>{!isLastSentence ? " " : ""}</span>
      </>
    );
  }

  return (
    <span className="py-1">
      {sentence.text}
      {!isLastSentence ? " " : ""}
    </span>
  );
};