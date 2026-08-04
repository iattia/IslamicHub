import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  await prisma.translation.createMany({ data: [
    { id: 'en.sahih', language: 'en', name: 'Sahih International' },
    { id: 'en.pickthall', language: 'en', name: 'Pickthall' },
    { id: 'en.yusufali', language: 'en', name: 'Yusuf Ali' },
  ], skipDuplicates: true });
  await prisma.reciter.upsert({ where: { id: 'ar.alafasy' }, update: { name: 'Mishary Rashid Alafasy' }, create: { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' } });
}
main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1); });
