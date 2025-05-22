import { cn } from "@/lib/utils";

export function Loader({
  size = "md",
  color = "white",
}: {
  size?: "sm" | "md" | "lg";
  color?: "white" | "black";
}) {
  const colorClasses = {
    white: "border-zinc-100 border-t-transparent",
    black: "border-zinc-950 border-t-transparent",
  };

  const widthClasses = {
    sm: "border-2",
    md: "border-3",
    lg: "border-4",
  };

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        colorClasses[color],
        sizeClasses[size],
        widthClasses[size]
      )}
    />
  );
}
