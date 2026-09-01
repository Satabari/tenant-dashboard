import { isNetworkError, isOffline } from "@/lib/retryUtils";

describe("retryUtils", () => {
  describe("isNetworkError", () => {
    it("should identify network errors", () => {
      const networkError = new TypeError("Failed to fetch");
      expect(isNetworkError(networkError)).toBe(true);
    });

    it("should return false for non-network errors", () => {
      const error = new Error("Some other error");
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe("isOffline", () => {
    it("should check navigator.onLine status", () => {
      if (typeof navigator !== "undefined") {
        expect(typeof isOffline()).toBe("boolean");
      }
    });
  });
});
