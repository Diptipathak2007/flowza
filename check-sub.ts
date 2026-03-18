import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const qtas = await db.subAccount.findFirst({
    where: { name: 'qtas' },
    include: { agency: true }
  })
  console.log("SUBACCOUNT:", qtas)
}

main().catch(console.error).finally(() => db.$disconnect())
