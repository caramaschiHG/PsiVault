import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const RETENTION_DAYS = 30;

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400000);
  const result = await prisma.performanceMetric.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`Removidas ${result.count} métricas antigas (>${RETENTION_DAYS} dias).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
