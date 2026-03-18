import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const perms = await db.permissions.findMany({
    where: { email: 'diptipathak2007@gmail.com' },
    include: { subAccount: true }
  })
  console.log("PERMISSIONS:", perms)
}

main().catch(console.error).finally(() => db.$disconnect())
