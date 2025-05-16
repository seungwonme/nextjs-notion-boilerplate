/**
 * @file src/utils/notion.ts
 * @description Notion API를 사용하여 데이터를 가져오는 유틸리티 함수들을 제공합니다.
 *
 * 이 파일은 Notion API 클라이언트를 초기화하고, 특정 데이터베이스에서
 * 블로그 게시물 목록을 쿼리하는 비동기 함수를 포함합니다.
 *
 * 주요 기능:
 * 1. 환경 변수로부터 Notion API 키와 데이터베이스 ID 로드
 * 2. Notion API 클라이언트 초기화
 * 3. 데이터베이스에서 게시물 목록 필터링 및 정렬하여 가져오기
 * 4. 단일 게시물(페이지) 객체 및 해당 블록 내용 가져오기
 *
 * 핵심 구현 로직:
 * - `@notionhq/client` 라이브러리 사용
 * - `process.env.NOTION_API_KEY`, `process.env.NOTION_DATABASE_ID` 활용
 * - 데이터베이스 쿼리 시 `public` 속성을 기준으로 필터링 및 `created_time`으로 정렬
 * - Notion API 응답 타입에 맞춰 데이터 가공 및 타입 정의
 *
 * @dependencies
 * - @notionhq/client
 *
 * @see {@link https://developers.notion.com/reference/post-database-query} - Notion Database Query API 문서
 * @see {@link https://developers.notion.com/reference/retrieve-a-page} - Notion Retrieve a Page API 문서
 * @see {@link https://developers.notion.com/reference/retrieve-block-children} - Notion Retrieve Block Children API 문서
 */

import { Client } from "@notionhq/client";

// 블로그 게시물 목록에서 사용할 타입 정의
export interface BlogPostItem {
  id: string;
  title: string;
  description: string;
  readingTime: number; // Formula 속성이 Number를 반환한다고 가정
  // createdTime: string; // 필요하다면 추가
}

// 환경 변수에서 Notion API 키와 데이터베이스 ID를 로드합니다.
const notionApiKey = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트를 초기화합니다.
const notion = new Client({ auth: notionApiKey });

// Notion 데이터베이스에서 블로그 게시물 목록을 가져오는 비동기 함수입니다.
export async function getBlogPosts(): Promise<BlogPostItem[]> {
  if (!notionDatabaseId) {
    console.error("NOTION_DATABASE_ID is not set.");
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      // public 속성을 기준으로 필터링
      filter: {
        property: "public", // 이미지에서 확인된 속성 이름
        checkbox: {
          equals: true,
        },
      },
      // 생성 날짜 역순으로 정렬 (Notion 기본 메타데이터 속성 사용)
      sorts: [
        {
          direction: "descending",
          property: "Created time",
        },
      ],
    });

    console.log(response);

    const posts: BlogPostItem[] = response.results.map((page: any) => {
      const properties = page.properties;

      const title =
        (properties?.Title?.title[0]?.plain_text as string) || "제목 없음";
      const description =
        (properties?.Description?.rich_text[0]?.plain_text as string) ||
        "설명 없음";
      // Reading Time (formula) 값 추출. Formula 결과 중 number 타입 값을 가져옴
      const readingTime =
        (properties?.["Reading Time"]?.formula?.number as number) || 0;

      return {
        id: page.id,
        title,
        description,
        readingTime,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts from Notion:", error);
    return [];
  }
}

// TODO: 단일 블로그 게시물 내용을 가져오는 함수 구현 (Optional)
// export async function getBlogPost(id: string) { ... }

// Notion Block 내용을 가져오는 함수 구현 (Post 상세 페이지용)
// 블로그 게시물 상세 내용은 페이지 자체의 속성(properties)에 있는 Body 필드 외에,
// 페이지를 구성하는 블록들(제목, 본문 단락, 이미지 등)을 별도로 가져와야 합니다.
// https://developers.notion.com/reference/retrieve-block-children 참조
export async function getBlocks(blockId: string) {
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100, // 필요에 따라 페이지 사이즈 조절
    });
    return response.results;
  } catch (error) {
    console.error("Error fetching block children from Notion:", error);
    return [];
  }
}

// 단일 블로그 게시물(페이지)의 속성 정보를 가져오는 함수
// https://developers.notion.com/reference/retrieve-a-page 참조
// NotionRenderer가 필요로 하는 전체 페이지 객체를 반환하도록 수정
export async function getBlogPostById(pageId: string): Promise<any | null> {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });
    // Notion API는 페이지 객체 자체를 반환하므로 그대로 반환합니다.
    return response;
  } catch (error) {
    console.error("Error fetching blog post by ID from Notion:", error);
    return null;
  }
}
