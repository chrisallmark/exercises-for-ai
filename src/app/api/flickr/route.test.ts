/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "./route";

const request = (url: string) => new NextRequest(`http://localhost${url}`);

describe("/api/flickr", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns Flickr feed data", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ title: "Sunset" }] }),
    } as Response);

    const res = await GET(request("/api/flickr?tags=sunset beach"));

    await expect(res.json()).resolves.toEqual({
      items: [{ title: "Sunset" }],
    });
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.flickr.com/services/feeds/photos_public.gne?tags=sunset%20beach&format=json&nojsoncallback=1",
      { next: { revalidate: 60 } },
    );
  });

  it("returns a bad gateway error when Flickr fails", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const res = await GET(request("/api/flickr?tags=sunset"));

    await expect(res.json()).resolves.toEqual({
      error: "Failed to fetch Flickr feed",
    });
    expect(res.status).toBe(502);
  });
});
