"use client";

import { useState, useMemo } from "react";
import {
  Bot,
  Map,
  Layers3,
  VideoIcon,
  InfoIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "robots", icon: Bot, path: "/", title: "View Robots" },
  { label: "missions", icon: Map, path: "/missions", title: "Mission Planner" },
  { label: "layers", icon: Layers3, path: "/layers", title: "Create Layers" },
  {
    label: "streams",
    icon: VideoIcon,
    path: "/videos",
    title: "Robot Video Streams",
  },
  { label: "info", icon: InfoIcon, path: "/debug", title: "Debug Page" },
];

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const activeRoute = useMemo(() => {
    if (pathname === "/" || pathname.includes("robot")) return "robots";
    if (pathname.includes("missions")) return "missions";
    if (pathname.includes("layers")) return "layers";
    if (pathname.includes("videos")) return "streams";
    if (pathname.includes("debug")) return "info";
    return null;
  }, [pathname]);

  return (
    <div className="flex h-[calc(100vh-60px)] fixed left-0 top-15 z-50">
      {/* Persistent Icon Column */}
      <div className="w-16 border-r bg-background flex flex-col items-center py-2 gap-2">
        <Button
          title={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
          variant="ghost"
          size="icon"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </Button>
        {navItems.map(({ label, icon: Icon, path, title }) => {
          const isActive = activeRoute === label;
          return (
            <Button
              key={label}
              variant={isActive ? "secondary" : "ghost"}
              size="icon"
              className="w-10 h-10"
              title={title}
              onClick={() => router.push(path)}
            >
              <Icon
                size={18}
                color={cn(
                  isActive ? "var(--color-orange-500)" : "var(--color-primary)"
                )}
                className={cn()}
              />
            </Button>
          );
        })}

        <SidebarFooter className="mt-auto mb-2">
          <ThemeToggle />
        </SidebarFooter>
      </div>

      {children && activeRoute && (
        <div
          className={cn(
            "transition-all duration-300 border-r bg-muted/10 shadow-sm h-full flex flex-col",
            expanded ? "w-88" : "w-0 overflow-hidden"
          )}
        >
          <SidebarContent className="flex-1 overflow-y-auto px-2 bg-sidebar">
            {children}
          </SidebarContent>
        </div>
      )}
    </div>
  );
}
