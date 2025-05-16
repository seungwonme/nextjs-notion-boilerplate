// 이 파일은 클라이언트 컴포넌트입니다.
"use client";

import { NotionRenderer } from "react-notion-x";
import { ExtendedRecordMap } from "notion-types";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// react-notion-x 기본 스타일 임포트
import "react-notion-x/src/styles.css";

// 커스텀 스타일을 위한 CSS 클래스
const notionCustomStyles = {
  container:
    "rounded-lg overflow-hidden notion-container transition-colors duration-200",
  page: "p-0 notion-page",
  text: "text-foreground notion-text",
  callout:
    "bg-subtle-background border border-card-border rounded-md p-4 notion-callout",
  code: "bg-subtle-background text-foreground notion-code font-mono rounded-md p-4 overflow-auto",
  collection:
    "border border-card-border rounded-lg overflow-hidden notion-collection",
  collectionRow:
    "border-b border-card-border hover:bg-subtle-background transition-colors duration-200 notion-collection-row",
  link: "text-accent hover:underline notion-link",
};

interface NotionRendererClientProps {
  recordMap: ExtendedRecordMap;
}

// Notion 블록 내용을 클라이언트 측에서 렌더링하는 컴포넌트
export default function NotionRendererClient({
  recordMap,
}: NotionRendererClientProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 커스텀 스타일 적용을 위한 CSS 클래스 추가
    const applyCustomStyles = () => {
      const root = document.documentElement;

      // 커스텀 CSS 변수 설정
      if (theme === "dark") {
        root.style.setProperty("--notion-page-bg", "var(--background)");
        root.style.setProperty("--notion-text", "var(--foreground)");
        root.style.setProperty("--notion-code-bg", "var(--subtle-background)");
      } else {
        root.style.setProperty("--notion-page-bg", "var(--background)");
        root.style.setProperty("--notion-text", "var(--foreground)");
        root.style.setProperty("--notion-code-bg", "var(--subtle-background)");
      }
    };

    applyCustomStyles();

    // 테마 변경 시 스타일 재적용
    window.addEventListener("theme-change", applyCustomStyles);
    return () => {
      window.removeEventListener("theme-change", applyCustomStyles);
    };
  }, [theme]);

  // mounted 상태가 아니면 렌더링하지 않음 (하이드레이션 불일치 방지)
  if (!mounted) {
    return null;
  }

  // NotionRenderer의 darkMode prop에 현재 테마 상태 전달
  const isDarkMode = theme === "dark";

  return (
    <div className={notionCustomStyles.container}>
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={isDarkMode}
        className="notion-renderer-custom"
        previewImages={true}
        showTableOfContents={true}
        minTableOfContentsItems={3}
        // 커스텀 컴포넌트 스타일 적용
        mapPageUrl={(pageId) => `/blog/${pageId}`}
      />
    </div>
  );
}
