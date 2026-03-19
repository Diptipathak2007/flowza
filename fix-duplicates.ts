import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const user = await db.user.findUnique({
    where: { email: 'diptipathak2007@gmail.com' },
    include: { permissions: true }
  })
  
  if (user) {
    console.log("Permissions for user:", user.permissions)
    
    // Find duplicates based on subAccountId
    const seen = new Set();
    for (const p of user.permissions) {
      if (seen.has(p.subAccountId)) {
        console.log("Deleting duplicate permission:", p.id)
        await db.permissions.delete({ where: { id: p.id }})
      } else {
        seen.add(p.subAccountId)
      }
    }
    console.log("Cleaned up duplicates.")
  }
}

main().catch(console.error).finally(() => db.$disconnect())
