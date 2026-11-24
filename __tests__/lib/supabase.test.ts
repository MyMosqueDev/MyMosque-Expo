import { storage } from "@/lib/mmkv";
import { createClient } from "@supabase/supabase-js";

jest.unmock("@/lib/supabase");
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({})),
}));

it("keeps its session in MMKV", () => {
  jest.requireActual("@/lib/supabase");
  const { storage: adapter } = jest.mocked(createClient).mock.calls[0][2]!
    .auth! as { storage: any };
  adapter.setItem("session", "abc");
  expect(storage.getString("session")).toBe("abc");
  expect(adapter.getItem("session")).toBe("abc");
  adapter.removeItem("session");
  expect(adapter.getItem("session")).toBeNull();
});
