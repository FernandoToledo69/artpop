import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => console.log(`Artpop API ouvindo na porta ${env.port}`));
}

start().catch(async (error) => {
  console.error('Falha ao iniciar o backend:', error);
  await prisma.$disconnect();
  process.exit(1);
});