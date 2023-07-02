export class RedisMock {
  private store: Record<string, string> = {};

  async get(key: string): Promise<string | undefined> {
    return this.store[key] || undefined;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store[key] = value;
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (this.store[key]) {
      delete this.store[key];
      return 1;
    }
    return 0;
  }
}
