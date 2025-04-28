"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position="bottom-center"
      theme={theme as "light" | "dark" | "system"}
      offset={{
        bottom: 8,
      }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:text-foreground/50 group-[.toast]:hover:text-foreground",
          // Fix the error styling to properly target the toast when it has the error type
          error: "!bg-red-500 !border-red-700 text-white",
          success: "!bg-green-500 border-green-600 text-white",
          warning: "!bg-yellow-500 border-yellow-600 text-white",
          info: "!bg-blue-500 border-blue-600 text-white",
          loading:
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
