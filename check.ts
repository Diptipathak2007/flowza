import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const user = await db.user.findUnique({
    where: { email: 'diptipathak2007@gmail.com' },
    include: { agency: true }
  })
  console.log("USER:", user)

  const inv = await db.invitation.findUnique({
    where: { email: 'diptipathak2007@gmail.com' }
  })
  console.log("INVITATION:", inv)
}

main().catch(console.error).finally(() => db.$disconnect())
