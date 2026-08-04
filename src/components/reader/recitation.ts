export type RecitationStep =
  | { complete: false; index: number; iteration: number }
  | { complete: true; index: number; iteration: 0 };

export function getNextRecitationStep({
  currentIndex,
  startIndex,
  endIndex,
  iteration,
  repeatCount,
}: {
  currentIndex: number;
  startIndex: number;
  endIndex: number;
  iteration: number;
  repeatCount: number;
}): RecitationStep {
  if (currentIndex < endIndex)
    return { complete: false, index: currentIndex + 1, iteration };
  if (iteration + 1 < Math.max(1, repeatCount))
    return { complete: false, index: startIndex, iteration: iteration + 1 };
  return { complete: true, index: startIndex, iteration: 0 };
}
