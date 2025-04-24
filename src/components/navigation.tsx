"use client";

import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 bg-background p-4 z-10 w-full shadow-md">
      <div className="flex justify-between items-center">
        <span className="flex items-center">
          <Image
            src="/swarm.png"
            alt="Swarmbotics AI Logo"
            width={20}
            height={20}
            className="mr-1"
          />
          <Link href="/" className="text-primary text-lg font-black">
            ANTSNet{" "}
            <span className="text-xs font-normal">
              by{" "}
              <span
                className="font-semibold"
                style={{
                  color: "#ff6400",
                }}
              >
                Swarmbotics{" "}
                <span
                  style={{
                    color: "#ffa101",
                  }}
                >
                  AI
                </span>
              </span>
            </span>
          </Link>
        </span>
      </div>
    </nav>
  );
}
