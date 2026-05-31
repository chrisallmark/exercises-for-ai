/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "./route";

const request = (url: string) => new NextRequest(`http://localhost${url}`);

describe("/api/weather", () => {
  const originalKey = process.env.OPENWEATHERMAP_API_KEY;

  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
    delete process.env.OPENWEATHERMAP_API_KEY;
  });

  afterEach(() => {
    process.env.OPENWEATHERMAP_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it("requires a city", async () => {
    const res = await GET(request("/api/weather?key=test-key"));

    await expect(res.json()).resolves.toEqual({ error: "city is required" });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("requires an API key", async () => {
    const res = await GET(request("/api/weather?city=London"));

    await expect(res.json()).resolves.toEqual({ error: "API key is required" });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns weather data from OpenWeatherMap", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ name: "London", main: { temp: 70 } }),
    } as Response);

    const res = await GET(request("/api/weather?city=London&key=test-key"));

    await expect(res.json()).resolves.toEqual({
      name: "London",
      main: { temp: 70 },
    });
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/weather?q=London&appid=test-key&units=imperial",
      { next: { revalidate: 300 } },
    );
  });

  it("passes upstream weather errors through", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "city not found" }),
    } as Response);

    const res = await GET(request("/api/weather?city=Nowhere&key=test-key"));

    await expect(res.json()).resolves.toEqual({ error: "city not found" });
    expect(res.status).toBe(404);
  });
});
