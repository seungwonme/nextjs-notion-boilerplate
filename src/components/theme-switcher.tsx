"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="p-2 rounded-full bg-subtle-background hover:bg-card-hover text-subtle-foreground hover:text-foreground transition-all duration-200 ring-0 focus:ring-2 focus:ring-accent focus:outline-none"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`${theme === "dark" ? "라이트" : "다크"} 모드로 전환`}
    >
      {theme === "dark" ? (
        <Sun size={18} className="stroke-[2px]" />
      ) : (
        <Moon size={18} className="stroke-[2px]" />
      )}
    </button>
  );
}
