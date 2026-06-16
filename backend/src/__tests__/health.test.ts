import { describe, it, expect } from 'bun:test';

describe('Health Check', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have correct environment', () => {
    expect(process.env.NODE_ENV || 'development').toBeDefined();
  });
});