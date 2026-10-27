import { type Dispatch, type SetStateAction } from "react";
import { cn } from "../../lib/utils";

type Props = {
  state: string;
  setter: Dispatch<SetStateAction<string>>;
  elements: string[];
  titles: string[];
  className?: string;
  buttonClassName?: string;
  slideClassName?: string;
};

function Slider({
  state,
  setter,
  elements = ["one", "two"],
  titles = ["T1", "T2"],
  className = "",
  buttonClassName = "",
  slideClassName,
}: Props) {
  return (
    <div className={cn("bg-surface-card relative flex rounded-xl", className)}>
      {/* Sliding Background */}
      <div
        className={cn(
          `bg-background absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] shadow-md transition-transform duration-300 ease-in-out ${
            state === elements[0] ? "translate-x-0" : "translate-x-full"
          }`,
          slideClassName,
        )}
      />

      {/* Tech Stack Button */}
      <button
        onClick={() => setter(elements[0])}
        // Added `relative` so `z-10` works, and restored the active text colors
        className={cn(
          `relative z-10 flex flex-1 cursor-pointer items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors ${
            state === elements[0]
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`,
          buttonClassName,
        )}
      >
        {titles[0]}
      </button>

      {/* Education Button */}
      <button
        onClick={() => setter(elements[1])}
        className={`relative z-10 flex flex-1 cursor-pointer items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors ${
          state === elements[1]
            ? "text-text-primary"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {titles[1]}
      </button>
    </div>
  );
}

export default Slider;
