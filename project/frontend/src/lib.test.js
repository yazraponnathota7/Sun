import { describe, expect, it } from 'vitest';
import { money, statusClass, friendly, localInput } from './lib.js';

describe('SMART-Q Management UI helpers', () => {
  it('formats Indian rupee values', () => {
    expect(money(125)).toContain('125');
    expect(money(0)).toContain('0');
  });
  it('normalizes order status names for CSS classes', () => {
    expect(statusClass('Ready for Pickup')).toBe('ready-for-pickup');
    expect(statusClass('')).toBe('pending');
  });
  it('maps common auth/network errors to readable copy', () => {
    expect(friendly('Invalid login credentials')).toBe('Incorrect email or password.');
    expect(friendly('Failed to fetch')).toContain('internet connection');
  });
  it('formats local datetime without converting it to UTC', () => {
    expect(localInput(new Date(2026, 0, 2, 3, 4))).toBe('2026-01-02T03:04');
  });
});
