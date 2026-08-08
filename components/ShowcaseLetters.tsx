import { cn } from "@/lib/utils";

const letters = [
  { char: "E", color: "bg-accent" },
  { char: "-", color: "bg-lime" },
  { char: "P", color: "bg-cyan" },
  { char: "O", color: "bg-pink" },
  { char: "R", color: "bg-yellow" },
  { char: "T", color: "bg-accent" },
  { char: "F", color: "bg-lime" },
  { char: "O", color: "bg-cyan" },
  { char: "L", color: "bg-pink" },
  { char: "I", color: "bg-yellow" },
  { char: "O", color: "bg-accent" },
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
