import { describe, expect, it } from "vitest";
import { qiblaBearing } from "./prayer-provider";

describe("Qibla bearing", () => {
  it("calculates the established north-east bearing from New York", () => {
    expect(qiblaBearing(40.7128, -74.006).toFixed(1)).toBe("58.5");
  });

  it("keeps the bearing normalized to compass degrees", () => {
    const bearing = qiblaBearing(-33.8688, 151.2093);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });
});
