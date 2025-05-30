import { Link, useLocation } from "react-router-dom";
import { InfoIcon, MapIcon, Settings, VideoIcon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

export function Navigation() {
  const { theme } = useTheme();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 z-20 w-full justify-stretch shadow-lg h-[60px]",
        theme === "dark" ? "bg-zinc-900" : "bg-zinc-950"
      )}
    >
      <div className="px-4 flex h-full justify-between items-center self-center">
        <span className="flex items-center">
          <img
            src="/swarm.png"
            alt="Swarmbotics AI Logo"
            width={20}
            height={20}
            className="mr-1"
          />
          <Link to="/" className={cn("text-lg font-extrabold text-zinc-400")}>
            ANTSNet{" "}
            <span className="text-xs font-normal">
              by{" "}
              <span
                className="font-semibold"
                style={{
                  color: theme === "dark" ? "#ff6400" : "#fff",
                }}
              >
                Swarmbotics{" "}
                <span
                  style={{
                    color: theme === "dark" ? "#ffa101" : "#fff",
                  }}
                >
                  AI
                </span>
              </span>
            </span>
          </Link>
        </span>
        <div className="flex items-center gap-4">
          <NavLink to="/" icon={MapIcon} label="Map" />
          <NavLink to="/streams" icon={VideoIcon} label="Streams" />
          <NavLink to="/info" icon={InfoIcon} label="Data" />
          <NavLink to="/settings" icon={Settings} label="Settings" />
        </div>
      </div>
    </nav>
  );
}

export function NavLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  return (
    <Link
      to={to}
      className={cn(
        "h-[54px] flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-none transition duration-200 mt-[5px] border-b-4 border-transparent",
        pathname === to && theme === "dark"
          ? "!text-white border-yellow-600"
          : "",
        pathname === to && theme === "light" ? "!text-white border-white" : "",
        theme === "dark" ? "text-zinc-400 " : "text-zinc-200 "
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
