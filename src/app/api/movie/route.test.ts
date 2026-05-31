/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "./route";

const request = (url: string) => new NextRequest(`http://localhost${url}`);

describe("/api/movie", () => {
  const originalKey = process.env.OMDB_API_KEY;

  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
    delete process.env.OMDB_API_KEY;
  });

  afterEach(() => {
    process.env.OMDB_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it("requires a title", async () => {
    const res = await GET(request("/api/movie?key=test-key"));

    await expect(res.json()).resolves.toEqual({ error: "title is required" });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("requires an API key", async () => {
    const res = await GET(request("/api/movie?title=Jaws"));

    await expect(res.json()).resolves.toEqual({ error: "API key is required" });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns movie data from OMDb", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ Title: "Jaws", Year: "1975", Response: "True" }),
    } as Response);

    const res = await GET(request("/api/movie?title=Jaws&key=test-key"));

    await expect(res.json()).resolves.toEqual({
      Title: "Jaws",
      Year: "1975",
      Response: "True",
    });
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.omdbapi.com/?t=Jaws&apikey=test-key",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns a not-found error for unsuccessful OMDb responses", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "False", Error: "Movie not found!" }),
    } as Response);

    const res = await GET(request("/api/movie?title=Missing&key=test-key"));

    await expect(res.json()).resolves.toEqual({ error: "Movie not found!" });
    expect(res.status).toBe(404);
  });
});
