export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};