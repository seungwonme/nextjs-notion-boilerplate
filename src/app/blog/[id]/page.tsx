/**
 * @file src/app/blog/[id]/page.tsx
 * @description 특정 블로그 게시물(Notion 페이지)의 상세 내용을 표시하는 페이지입니다.
 *
 * 이 페이지는 URL 파라미터에서 Notion 페이지 ID를 가져와 해당 게시물의 속성 정보와
 * 블록 내용을 비동기적으로 불러와 화면에 렌더링합니다.
 *
 * 주요 기능:
 * 1. URL 파라미터로부터 Notion 페이지 ID 추출
 * 2. `getBlogPostById` 함수를 사용하여 게시물 전체 페이지 객체 페칭
 * 3. `getBlocks` 함수를 사용하여 게시물 블록 내용 페칭
 * 4. 게시물 제목, 설명, 읽기 시간 표시 (페이지 속성에서 추출)
 * 5. 분리된 클라이언트 컴포넌트(`NotionRendererClient`)를 사용하여 블록 내용을 렌더링
 *
 * 핵심 구현 로직:
 * - Next.js App Router의 동적 라우팅 ([id]) 활용
 * - 서버 컴포넌트에서 비동기 데이터 페칭
 * - `src/utils/notion.ts`의 유틸리티 함수 호출
 * - `src/components/NotionRendererClient.tsx` 클라이언트 컴포넌트 사용
 * - TailwindCSS를 사용한 스타일링
 *
 * @dependencies
 * - src/utils/notion.ts (getBlogPostById, getBlocks)
 * - next/navigation (notFound)
 * - src/components/NotionRendererClient.tsx
 *
 * @see {@link /src/utils/notion.ts} - 데이터 페칭 로직
 * @see {@link https://developers.notion.com/reference/block} - Notion Block Object
 * @see {@link https://developers.notion.com/reference/page} - Notion Page Object
 * @see {@link https://github.com/NotionX/react-notion-x#recordmap} - react-notion-x recordMap 구조
 */

import { getBlogPostById, getBlocks } from "@/utils/notion";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

// 클라이언트 컴포넌트에서 NotionRenderer 및 관련 스타일 임포트
import NotionRendererClient from "@/components/notion-renderer-client";

// 이 페이지는 서버 컴포넌트로 동작하며 동적 라우트 파라미터를 받습니다.
export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const pageId = params.id;

  // 게시물 전체 페이지 객체와 블록 내용 비동기 페칭
  const [page, blocks] = await Promise.all([
    getBlogPostById(pageId),
    getBlocks(pageId),
  ]);

  // 게시물이 없거나 블록 내용이 없으면 404 페이지 반환
  if (!page || !blocks || blocks.length === 0) {
    notFound();
  }

  // NotionRenderer에 전달할 recordMap 생성
  // 페이지 객체와 자식 블록 정보를 결합합니다.
  // NotionRenderer의 recordMap 구조는 { block: { [blockId]: { value: block } }, ... } 형태이며,
  // ExtendedRecordMap 타입은 추가적인 속성들을 요구합니다. 타입 에러 해결을 위해 필수 속성들을 빈 객체로 추가합니다.
  const recordMap: any = {
    // 타입 에러를 일시적으로 회피하기 위해 any 사용 가능, 더 정확한 타입을 원한다면 notion-types의 ExtendedRecordMap을 import하고 사용
    block: {
      // 페이지 블록 자체 정보 추가
      [pageId]: { value: page },
      // 자식 블록 정보 추가
      ...blocks.reduce((acc: any, block: any) => {
        acc[block.id] = { value: block };
        return acc;
      }, {}),
    },
    // ExtendedRecordMap 타입이 요구하는 추가 속성들을 빈 객체로 채워 타입 에러 해결
    collection: {},
    collection_view: {},
    notion_user: {},
    collection_query: {},
    signed_urls: {},
    // 필요한 다른 정보 추가 가능 (NotionRenderer 사용 시)
  };

  // 페이지 객체에서 속성 정보 추출
  const properties = (page as any).properties; // Type assertion for simplicity
  const title =
    (properties?.Title?.title[0]?.plain_text as string) || "Untitled";
  const description =
    (properties?.Description?.rich_text[0]?.plain_text as string) ||
    "No description";
  const body =
    (properties?.Body?.rich_text[0]?.plain_text as string) || "No body";
  const readingTime =
    (properties?.["Reading Time"]?.formula?.number as number) || 0;

  // 마지막 업데이트 날짜 포맷팅 (필요시)
  const lastEditedTime = new Date(
    (page as any).last_edited_time,
  ).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-subtle-foreground hover:text-accent transition-colors duration-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>목록으로 돌아가기</span>
          </Link>
        </div>

        <article className="max-w-3xl mx-auto">
          {/* 게시물 헤더 */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {title}
            </h1>
            <p className="text-subtle-foreground text-lg mb-6">{description}</p>

            <div className="flex items-center text-sm text-subtle-foreground">
              <div className="flex items-center mr-6">
                <Clock size={16} className="mr-2" />
                <span>읽는 시간: {readingTime}분</span>
              </div>
              <div>마지막 업데이트: {lastEditedTime}</div>
            </div>
          </header>

          {/* 본문 내용 (body가 있는 경우만 표시) */}
          {body !== "No body" && (
            <div className="prose prose-gray dark:prose-invert max-w-none mb-10 border-b border-card-border pb-10">
              <p className="text-foreground">{body}</p>
            </div>
          )}

          {/* Notion 블록 내용을 렌더링할 부분 */}
          <div className="notion-content mt-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <NotionRendererClient recordMap={recordMap} />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
