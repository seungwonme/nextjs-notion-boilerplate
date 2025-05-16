/**
 * @file src/app/page.tsx
 * @description 블로그 게시물 목록을 표시하는 메인 페이지입니다.
 *
 * 이 페이지는 Notion 데이터베이스에서 공개된 블로그 게시물 목록을 비동기적으로 가져와서
 * 제목, 설명, 읽기 시간을 표시하고, 각 게시물의 상세 페이지로 이동하는 링크를 제공합니다.
 *
 * 주요 기능:
 * 1. `getBlogPosts` 유틸리티 함수를 사용하여 서버 측에서 데이터 페칭
 * 2. 가져온 게시물 목록 렌더링
 * 3. 각 게시물에 대한 상세 페이지 링크 제공
 *
 * 핵심 구현 로직:
 * - Next.js 13/14의 App Router 및 서버 컴포넌트 활용
 * - `src/utils/notion.ts`의 `getBlogPosts` 함수 호출
 * - TailwindCSS를 사용한 스타일링
 *
 * @dependencies
 * - src/utils/notion.ts (getBlogPosts)
 * - next/link (게시물 링크)
 *
 * @see {@link /src/utils/notion.ts} - 데이터 페칭 로직
 */

import Link from "next/link";
import { getBlogPosts } from "@/utils/notion";
import { BookOpen } from "lucide-react";

// 이 페이지는 서버 컴포넌트로 동작합니다.
export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-[calc(100vh-72px)] py-12">
      <div className="container mx-auto px-4">
        {/* 헤더 섹션 */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-purple-600 text-transparent bg-clip-text">
            노션 블로그
          </h1>
          <p className="text-subtle-foreground text-lg max-w-2xl mx-auto">
            노션 API를 활용한 현대적인 블로그 플랫폼에 오신 것을 환영합니다.
            다양한 주제의 글들을 만나보세요.
          </p>
        </section>

        {/* 게시물 그리드 */}
        <section>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                  <article className="h-full bg-background border border-card-border rounded-lg overflow-hidden hover:shadow-md hover:border-accent/30 transition-all duration-200 flex flex-col">
                    <div className="p-6 flex-grow">
                      <h2 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">
                        {post.title}
                      </h2>
                      <p className="text-subtle-foreground text-sm mb-4 line-clamp-3">
                        {post.description}
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-card-border bg-subtle-background flex items-center text-xs text-subtle-foreground">
                      <BookOpen size={14} className="mr-2" />
                      <span>읽는 시간: {post.readingTime}분</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-subtle-background rounded-lg border border-card-border">
              <p className="text-subtle-foreground">
                게시물이 없습니다. 곧 새로운 글이 업데이트될 예정입니다.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
