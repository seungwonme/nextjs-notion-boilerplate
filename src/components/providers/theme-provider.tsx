"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // class 기반 다크 모드를 사용하도록 설정
      defaultTheme="system" // 시스템 설정을 기본값으로 사용
      enableSystem // 시스템 테마 감지 활성화
      disableTransitionOnChange // 테마 변경 시 깜빡임 방지
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
