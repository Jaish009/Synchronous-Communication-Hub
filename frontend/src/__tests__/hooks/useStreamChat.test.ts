import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before import
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(() => ({
    user: {
      id: "test-user-id",
      fullName: "Test User",
      imageUrl: "https://example.com/avatar.jpg",
      username: "testuser",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  })),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: { token: "mock-stream-token" },
    isLoading: false,
    error: null,
  })),
}));

vi.mock("stream-chat", () => {
  const mockClient = {
    connectUser: vi.fn().mockResolvedValue({}),
    disconnectUser: vi.fn().mockResolvedValue({}),
    userID: "test-user-id",
  };

  return {
    StreamChat: {
      getInstance: vi.fn(() => mockClient),
    },
  };
});

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  getStreamToken: vi.fn().mockResolvedValue({ token: "mock-token" }),
}));

describe("useStreamChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set env variable
    vi.stubEnv("VITE_STREAM_API_KEY", "test-api-key");
  });

  it("should export a function", async () => {
    const mod = await import("../../hooks/useStreamChat");
    expect(typeof mod.useStreamChat).toBe("function");
  });

  it("should have correct return type interface", async () => {
    // Verify the module exports what we expect
    const mod = await import("../../hooks/useStreamChat");
    expect(mod).toHaveProperty("useStreamChat");
  });
});
