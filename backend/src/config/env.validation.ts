import { z } from 'zod';

export const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function validate(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Config validation error: ${parsed.error.message}`);
  }

  return parsed.data;
}
