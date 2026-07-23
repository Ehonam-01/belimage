import { describe, it, expect } from "vitest";
import { DeepSeekClient } from "@/lib/ai/deepseek/client";

describe("DeepSeekClient", () => {
  it("creates a client with API key", () => {
    const client = new DeepSeekClient();
    expect(client).toBeInstanceOf(DeepSeekClient);
  });

  it("has chat and chatJSON methods", () => {
    const client = new DeepSeekClient();
    expect(typeof client.chat).toBe("function");
    expect(typeof client.chatJSON).toBe("function");
  });
});
