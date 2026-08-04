import { describe, expect, it } from "vitest";
import { parseTajweed, stripTajweed, TAJWEED_LEGEND } from "./tajweed-text";

describe("tajweed annotation parser", () => {
  const annotated = "بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ";
  it("preserves the exact Quran text while removing provider annotations", () => {
    expect(stripTajweed(annotated)).toBe("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ");
  });
  it("maps each annotated segment to its rule code", () => {
    expect(
      parseTajweed(annotated)
        .filter((segment) => segment.code)
        .map((segment) => segment.code),
    ).toEqual(["h", "h", "l", "n"]);
  });
  it("handles a nested rule without leaking annotation syntax", () => {
    const nested = "[o[[s[و]ٲٓاْ]";
    expect(stripTajweed(nested)).toBe("وٲٓاْ");
    expect(
      parseTajweed(nested)
        .filter((segment) => segment.code)
        .map((segment) => segment.code),
    ).toEqual(["s", "o"]);
  });
  it("keeps the full provider rule vocabulary in the color guide", () => {
    expect(TAJWEED_LEGEND).toHaveLength(17);
  });
});
