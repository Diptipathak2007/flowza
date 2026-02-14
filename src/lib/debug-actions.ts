"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateAgencyName = async (agencyId: string, name: string) => {
  try {
    console.log(`Debug Action: Updating agency ${agencyId} to name: ${name}`);
    const result = await db.agency.update({
      where: { id: agencyId },
      data: { name: name }
    });
    console.log('Debug Action Result:', result);
    revalidatePath(`/agency/${agencyId}`);
    return result;
  } catch (error) {
    console.error('Debug Action Error:', error);
    throw error;
  }
}
