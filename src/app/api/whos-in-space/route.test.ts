/**
 * @jest-environment node
 */

import { GET } from "./route";

describe("/api/whos-in-space", () => {
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

  it("returns astronaut data", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        number: 1,
        people: [{ name: "Ada Lovelace", craft: "ISS" }],
      }),
    } as Response);

    const res = await GET();

    await expect(res.json()).resolves.toEqual({
      number: 1,
      people: [{ name: "Ada Lovelace", craft: "ISS" }],
    });
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://api.open-notify.org/astros.json",
      { next: { revalidate: 60 } },
    );
  });

  it("returns a bad gateway error when the upstream service fails", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const res = await GET();

    await expect(res.json()).resolves.toEqual({
      error: "Failed to fetch data",
    });
    expect(res.status).toBe(502);
  });
});
