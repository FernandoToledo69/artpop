import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@artpop.local' },
    update: {},
    create: {
      name: 'Admin artpop',
      email: 'admin@artpop.local',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const artisanUser = await prisma.user.upsert({
    where: { email: 'ana.lima@email.com' },
    update: {},
    create: {
      name: 'Ana Lima',
      email: 'ana.lima@email.com',
      passwordHash,
      role: 'ARTISAN',
      artisan: {
        create: {
          name: 'Ateliê Ana Lima',
          city: 'Campina Grande',
          state: 'PB',
          bio: 'Peças autorais feitas à mão.',
          status: 'ACTIVE',
        },
      },
    },
    include: { artisan: true },
  });

  if (artisanUser.artisan) {
    const count = await prisma.product.count({ where: { artisanId: artisanUser.artisan.id } });
    if (count === 0) {
      await prisma.product.create({
        data: {
          title: 'Vaso cerâmico azul',
          category: 'CERAMICA',
          technique: 'Cerâmica artesanal',
          description: 'Peça decorativa pintada à mão.',
          price: 189.9,
          stock: 8,
          weightKg: 1.2,
          lengthCm: 20,
          widthCm: 20,
          heightCm: 30,
          mainImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5',
          additionalImages: [],
          artisanId: artisanUser.artisan.id,
        },
      });
    }
  }
  console.log(`Seed concluído. Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());