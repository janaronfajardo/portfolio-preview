import { cn } from "@/lib/utils";

const letters = [
  { char: "S", color: "bg-accent" },
  { char: "H", color: "bg-lime" },
  { char: "O", color: "bg-cyan" },
  { char: "W", color: "bg-pink" },
  { char: "C", color: "bg-yellow" },
  { char: "A", color: "bg-accent" },
  { char: "S", color: "bg-lime" },
  { char: "E", color: "bg-cyan" },
];

export function ShowcaseLetters({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {letters.map((l, i) => (
        <span
          key={i}
          className={cn(
            "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 brutal-border font-mono font-black text-sm sm:text-base text-black",
            l.color
          )}
          style={{ transform: i % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)" }}
        >
          {l.char}
        </span>
      ))}
    </div>
  );
}
