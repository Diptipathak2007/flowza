import { clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const user = await db.user.findUnique({
    where: { email: 'diptipathak2007@gmail.com' }
  })
  if (user) {
    const client = await clerkClient()
    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: "SUBACCOUNT_USER"
      }
    })
    console.log("Updated Clerk metadata for", user.email)
  }
}

main().catch(console.error).finally(() => db.$disconnect())
