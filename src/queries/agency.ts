"use server"

import { db } from "@/lib/db"

export const getAgencyDetails = async (agencyId: string) => {
  try {
    if (!agencyId) return null;
    const agency = await db.agency.findUnique({
      where: {
        id: agencyId,
      },
      include: {
        subAccounts: true,
      },
    })
    return agency
  } catch (error) {
    console.error("--- ERROR in getAgencyDetails ---", error);
    return null;
  }
}

export const updateAgencyConnectedId = async (
  agencyId: string,
  connectedId: string
) => {
  if (!agencyId) return null
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { connectAccountId: connectedId },
  })
  return response
}
