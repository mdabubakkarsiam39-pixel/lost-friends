declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function expect(value: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeNull(): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
    toContain(expected: unknown): void;
    toThrow(): void;
  };
}

declare module 'web-push' {
  export function setVapidDetails(
    email: string,
    publicKey: string,
    privateKey: string
  ): void;
  export function sendNotification(
    subscription: object,
    payload: string
  ): Promise<{ statusCode: number }>;
}