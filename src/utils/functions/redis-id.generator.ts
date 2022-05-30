export type RedisIdTypes = 'verify' | 'reset' | 'update';
type ReturnType = `${RedisIdTypes}-${string}`;
type RedisIdEnum = Record<RedisIdTypes, (email: string) => ReturnType>;

export const RedisIdEnum: RedisIdEnum = {
  verify: (email: string) => `verify-${email}`,
  reset: (email: string) => `reset-${email}`,
  update: (email: string) => `update-${email}`,
};
