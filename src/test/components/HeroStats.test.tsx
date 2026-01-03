import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { HTMLAttributes } from "react";
import HeroStats from "../../components/features/HeroStats";

vi.mock("framer-motion", async () => {
  const React = await import("react");

  const createMotionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children),
    );

  const motion = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop !== "string") {
          return createMotionComponent("div");
        }
        return createMotionComponent(prop);
      },
    },
  );

  const useSpring = (initial: number) => {
    let current = initial;
    return {
      set: (value: number) => {
        current = value;
      },
      get: () => current,
    };
  };

  const useTransform = (
    value: { get: () => number },
    transformer: (current: number) => string | number,
  ) => transformer(value.get());

  return {
    motion,
    useInView: () => true,
    useSpring,
    useTransform,
  };
});

interface MockResponse {
  ok: boolean;
  json: () => Promise<unknown>;
}

const createMockResponse = (data: unknown, ok = true): MockResponse => ({
  ok,
  json: async () => data,
});

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

describe("HeroStats", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders loading skeletons while fetching", () => {
    const pending = new Promise<Response>(() => {});
    globalThis.fetch = vi.fn(() => pending) as unknown as typeof fetch;

    const { container } = render(<HeroStats />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders stats after successful fetch", async () => {
    const events = [
      {
        type: "PullRequestEvent",
        payload: { action: "closed" },
        repo: { name: "a/b" },
      },
      { type: "PushEvent", repo: { name: "a/b" } },
      {
        type: "PullRequestEvent",
        payload: { action: "closed" },
        repo: { name: "c/d" },
      },
    ];
    const repos = [{ stargazers_count: 10 }, { stargazers_count: 2 }];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = resolveUrl(input);
      if (url.includes("/events")) {
        return createMockResponse(events) as unknown as Response;
      }
      if (url.includes("/repos")) {
        return createMockResponse(repos) as unknown as Response;
      }
      return createMockResponse([], false) as unknown as Response;
    }) as unknown as typeof fetch;

    globalThis.fetch = fetchMock;

    render(<HeroStats />);

    await waitFor(() => {
      expect(screen.getByText("PRs Merged")).toBeInTheDocument();
      expect(screen.getByText("Repos Contributed")).toBeInTheDocument();
      expect(screen.getByText("Total Stars")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/aadel/events?per_page=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/vnd.github.v3+json",
        }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/aadel/repos?per_page=100&sort=updated",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/vnd.github.v3+json",
        }),
      }),
    );

    expect(
      screen.getByRole("link", { name: /view github profile/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/cached data/i)).not.toBeInTheDocument();
  });

  it("falls back to cached data on fetch error", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Network error");
    }) as unknown as typeof fetch;

    globalThis.fetch = fetchMock;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<HeroStats />);

    await waitFor(() => {
      expect(screen.getByText(/cached data/i)).toBeInTheDocument();
      expect(screen.getByText("PRs Merged")).toBeInTheDocument();
    });

    warnSpy.mockRestore();
  });
});
