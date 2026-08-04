import { describe, expect, it } from "vitest";
import { getNextRecitationStep } from "./recitation";

describe("recitation range playback", () => {
  it("advances only within the selected range", () => {
    expect(
      getNextRecitationStep({
        currentIndex: 3,
        startIndex: 2,
        endIndex: 5,
        iteration: 0,
        repeatCount: 1,
      }),
    ).toEqual({ complete: false, index: 4, iteration: 0 });
  });

  it("restarts at the selected beginning for another complete pass", () => {
    expect(
      getNextRecitationStep({
        currentIndex: 5,
        startIndex: 2,
        endIndex: 5,
        iteration: 0,
        repeatCount: 3,
      }),
    ).toEqual({ complete: false, index: 2, iteration: 1 });
  });

  it("finishes after the requested number of complete passes", () => {
    expect(
      getNextRecitationStep({
        currentIndex: 5,
        startIndex: 2,
        endIndex: 5,
        iteration: 2,
        repeatCount: 3,
      }),
    ).toEqual({ complete: true, index: 2, iteration: 0 });
  });
});
