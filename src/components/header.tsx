"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  return (
    <header className="bg-background border-b border-card-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* 로고 (왼쪽) */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight hover:text-accent transition-colors duration-200"
        >
          Notion Blog
        </Link>

        {/* 테마 스위처 (오른쪽) */}
        <div>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
