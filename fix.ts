import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const owner = await db.user.findUnique({
    where: { email: 'learning20282024@gmail.com' },
    include: { agency: true }
  })
  
  if (owner?.agencyId) {
    const updated = await db.user.update({
      where: { email: 'diptipathak2007@gmail.com' },
      data: { 
        agencyId: owner.agencyId,
        role: 'SUBACCOUNT_USER'
      }
    })
    console.log("FIXED USER:", updated)
  } else {
    console.log("Could not find owner agency")
  }
}

main().catch(console.error).finally(() => db.$disconnect())
