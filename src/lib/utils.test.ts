import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges conflicting Tailwind classes predictably', () => {
    expect(cn('px-3 text-sm', false && 'hidden', 'px-5')).toBe('text-sm px-5');
  });
});
