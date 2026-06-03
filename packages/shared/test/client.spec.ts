import {
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

describe("shared api clients", () => {
  it("keeps mock and http client signatures aligned for events list", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_001",
      data: {
        items: [
          {
            _id: "event_http_001",
            community_id: "tongzilin",
            title_zh: "HTTP 活动",
            title_en: "HTTP Event",
            summary_zh: "简介",
            summary_en: "Summary",
            content_zh: "正文",
            content_en: "Body",
            cover_file_id: "cloud://cover",
            cover_cloud_path: "public/events/event_http_001/cover.jpg",
            cover_url: "https://example.com/cover.jpg",
            place_id: "place_001",
            address_text: "Address",
            location: { latitude: 30.6, longitude: 104.0 },
            start_time: "2026-03-28T10:00:00+08:00",
            end_time: "2026-03-28T12:00:00+08:00",
            signup_deadline: "2026-03-27T18:00:00+08:00",
            capacity: 20,
            organizer_user_id: "user_001",
            review_status: "approved",
            publish_status: "published"
          }
        ],
        page: 1,
        pageSize: 10,
        total: 1
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.events.list();
    const httpResult = await httpClient.events.list();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(Array.isArray(mockResult.data.items)).toBe(true);
    expect(Array.isArray(httpResult.data.items)).toBe(true);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/events",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for place markers", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_002",
      data: [
        {
          _id: "place_http_001",
          name_zh: "社区中心",
          name_en: "Community Center",
          category_level_1: "public-service",
          location: { latitude: 30.615, longitude: 104.0625 }
        }
      ]
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.places.mapMarkers();
    const httpResult = await httpClient.places.mapMarkers();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(mockResult.data[0]).toHaveProperty("category_level_1");
    expect(httpResult.data[0]).toHaveProperty("category_level_1");
    expect(httpResult.data[0]).not.toHaveProperty("address_zh");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places/map-markers",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps discover feed, comments, and report clients aligned", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async (method: string, url: string) => {
      if (url.includes("/comments")) {
        return {
          success: true,
          requestId: "req_http_comments",
          data: {
            items: [],
            page: 1,
            pageSize: 20,
            total: 0
          }
        };
      }
      return {
        success: true,
        requestId: "req_http_post",
        data:
          method === "GET"
            ? {
                items: [],
                page: 1,
                pageSize: 5,
                total: 0
              }
            : {
                _id: "post_http_001",
                author_user_id: "user_001",
                community_id: "tongzilin",
                title: "Reported post",
                content: "Body",
                language: "en",
                tag_ids: ["help"],
                location_text: null,
                image_file_ids: [],
                image_urls: [],
                status: "visible",
                review_status: "reported"
              }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockFeed = await mockClient.discover.listPosts({ tagId: "help" });
    const httpFeed = await httpClient.discover.listPosts({
      page: 1,
      pageSize: 5,
      keyword: "dentist",
      tagId: "help"
    });
    const mockComments = await mockClient.discover.listComments("post_001");
    const httpComments = await httpClient.discover.listComments("post_001", {
      page: 1,
      pageSize: 20
    });
    const mockReport = await mockClient.discover.reportPost("post_001", {
      reason: "spam"
    });
    const httpReport = await httpClient.discover.reportPost("post_http_001", {
      reason: "spam"
    });

    expect(mockFeed.data.items.every((post) => post.tag_ids.includes("help"))).toBe(
      true
    );
    expect(httpFeed.success).toBe(true);
    expect(Array.isArray(mockComments.data.items)).toBe(true);
    expect(httpComments.data.total).toBe(0);
    expect(mockReport.data.review_status).toBe("reported");
    expect(httpReport.data.review_status).toBe("reported");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/posts?page=1&pageSize=5&keyword=dentist&tagId=help",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/posts/post_001/comments?page=1&pageSize=20",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/discover/posts/post_http_001/report",
      { reason: "spam" },
      { "x-mock-user-id": "user_001" }
    );
  });
});
