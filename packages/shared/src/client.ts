import type { CommunityMapApiClient } from "./mock/client";

import { apiPaths } from "./contracts/paths";

type RequestMethod = "GET" | "POST" | "PATCH";

export interface HttpRequester {
  <TResponse>(
    method: RequestMethod,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<TResponse>;
}

export interface HttpClientOptions {
  baseUrl: string;
  actorId?: string;
  requester: HttpRequester;
}

const buildUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
) => {
  const searchParams = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.size > 0 ? `${path}?${searchParams.toString()}` : path;
};

export const createFetchRequester = (
  fetchImpl: typeof fetch = fetch
): HttpRequester => {
  return async (method, url, body, headers = {}) => {
    const response = await fetchImpl(url, {
      method,
      headers: {
        "content-type": "application/json",
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    return (await response.json()) as Promise<any>;
  };
};

export const createHttpClient = (
  options: HttpClientOptions
): CommunityMapApiClient => {
  const request = <TResponse>(
    method: RequestMethod,
    path: string,
    body?: unknown
  ) =>
    options.requester<TResponse>(
      method,
      buildUrl(options.baseUrl, path),
      body,
      options.actorId ? { "x-mock-user-id": options.actorId } : undefined
    );

  return {
    auth: {
      login: (input) => request("POST", apiPaths.auth.login, input),
      me: () => request("GET", apiPaths.auth.me)
    },
    events: {
      list: (query) => request("GET", withQuery(apiPaths.events.list, query)),
      detail: (id) => request("GET", apiPaths.events.detail(id)),
      register: (id, input) =>
        request("POST", apiPaths.events.createRegistration(id), input),
      myRegistrations: () => request("GET", apiPaths.events.myRegistrations),
      registrationTicket: (id) =>
        request("GET", apiPaths.events.registrationTicket(id))
    },
    discover: {
      listPosts: (query) =>
        request("GET", withQuery(apiPaths.discover.listPosts, query)),
      detailPost: (id) => request("GET", apiPaths.discover.detailPost(id)),
      createPost: (input) => request("POST", apiPaths.discover.createPost, input),
      createComment: (id, input) =>
        request("POST", apiPaths.discover.createComment(id), input),
      listComments: (id, query) =>
        request("GET", withQuery(apiPaths.discover.listComments(id), query)),
      reportPost: (id, input) =>
        request("POST", apiPaths.discover.reportPost(id), input)
    },
    places: {
      list: (query) => request("GET", withQuery(apiPaths.places.list, query)),
      detail: (id) => request("GET", apiPaths.places.detail(id)),
      mapMarkers: () => request("GET", apiPaths.places.mapMarkers)
    },
    announcements: {
      list: () => request("GET", apiPaths.announcements.list),
      detail: (id) => request("GET", apiPaths.announcements.detail(id))
    },
    notifications: {
      list: () => request("GET", apiPaths.notifications.list),
      markRead: (id) => request("POST", apiPaths.notifications.markRead(id), {})
    },
    files: {
      createUploadRequest: (input) =>
        request("POST", apiPaths.files.createUploadRequest, input),
      complete: (input) => request("POST", apiPaths.files.completeUpload, input),
      privateUrl: (input) => request("POST", apiPaths.files.privateUrl, input)
    },
    admin: {
      createEvent: (input) => request("POST", apiPaths.admin.createEvent, input),
      updateEvent: (id, input) =>
        request("PATCH", apiPaths.admin.updateEvent(id), input),
      reviewEvent: (id, input) =>
        request("POST", apiPaths.admin.reviewEvent(id), input),
      checkinEvent: (id, input) =>
        request("POST", apiPaths.admin.checkinEvent(id), input),
      moderatePost: (id, input) =>
        request("POST", apiPaths.admin.moderatePost(id), input),
      createPlace: (input) => request("POST", apiPaths.admin.createPlace, input),
      updatePlace: (id, input) =>
        request("PATCH", apiPaths.admin.updatePlace(id), input)
    }
  };
};
