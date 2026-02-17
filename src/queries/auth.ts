"use server"

import { db } from "@/lib/db"

export const getAuthUser = async (email: string) => {
  try {
    if (!email) return null;
    const user = await db.user.findUnique({
      where: {
        email,
      },
      include: {
        agency: true,
        permissions: true,
      },
    })
    return user
  } catch (error) {
    console.error("--- ERROR in getAuthUser ---", error);
    return null;
  }
}
