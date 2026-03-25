"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { Agency, Contact, Lane, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client"
;

export const getAuthUserDetails = async () => {
  try {
    const user = await currentUser();
    if (!user) return;

    let userData = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      include: {
        agency: {
          include: {
            sidebarOptions: true,
            subAccounts: {
              include: {
                sidebarOptions: true,
              },
            },
          },
        },
        permissions: true,
      },
    });

    if (!userData) return;

    // SELF-HEALING: If the user's Clerk ID has changed but email is the same
    // This happens if a user is deleted and recreated in Clerk.
    if (userData.id !== user.id) {
      console.log(`--- [SELF-HEALING] ID Mismatch for ${userData.email}. DB: ${userData.id}, Clerk: ${user.id} ---`);
      
      // We need to migrate the user record to the new ID.
      // Since ID is a primary key, we must delete and recreate (or update if Prisma/DB allows, but delete/create is safer for PKs).
      try {
        const fullOldUser = await db.user.findUnique({
          where: { id: userData.id },
          include: { permissions: true }
        });

        if (fullOldUser) {
          // Delete old record
          await db.user.delete({ where: { id: userData.id } });
          
          // Create new record with same data but new ID
          userData = await db.user.create({
            data: {
              ...fullOldUser,
              id: user.id,
              permissions: {
                createMany: {
                  data: fullOldUser.permissions.map(p => ({
                    access: p.access,
                    subAccountId: p.subAccountId,
                  }))
                }
              }
            },
            include: {
              agency: {
                include: {
                  sidebarOptions: true,
                  subAccounts: {
                    include: {
                      sidebarOptions: true,
                    },
                  },
                },
              },
              permissions: true,
            },
          }) as any;
          console.log(`--- [SELF-HEALING] Successfully migrated ${userData!.email} to new Clerk ID ${user.id} ---`);
        }
      } catch (healingError) {
        console.error("--- [SELF-HEALING ERROR] Failed to migrate user ID ---", healingError);
      }
    }

    // RE-FETCH AGENCY IF USER HAS ONE (ensures relations are fresh)
    if (userData!.agency) {
      const freshAgency = await db.agency.findUnique({
        where: { id: userData!.agency.id },
        include: {
          sidebarOptions: true,
          subAccounts: {
            include: {
              sidebarOptions: true,
            },
          },
        },
      });
      if (freshAgency) {
        userData!.agency = freshAgency as any;

        // Sync with Clerk if role is out of sync (owner check)
        if (
          freshAgency.companyEmail === userData!.email &&
          userData!.role !== "AGENCY_OWNER"
        ) {
          userData = (await db.user.update({
            where: { id: userData!.id },
            data: { role: "AGENCY_OWNER" },
            include: {
              agency: {
                include: {
                  sidebarOptions: true,
                  subAccounts: {
                    include: {
                      sidebarOptions: true,
                    },
                  },
                },
              },
              permissions: true,
            },
          })) as any;

          const client = await clerkClient();
          try {
            await client.users.updateUserMetadata(userData!.id, {
              privateMetadata: {
                role: "AGENCY_OWNER",
              },
            });
          } catch (clerkError) {
            console.error(
              "--- CLERK SYNC ERROR in getAuthUserDetails (Role Update) ---",
              clerkError
            );
          }
        }
      }
    }

    // Robust check: If user exists but has no agency populated, check if they are associated with any agency
    if (!userData!.agency) {
      const associatedAgency = await db.agency.findFirst({
        where: {
          OR: [
            { users: { some: { email: userData!.email } } },
            { companyEmail: userData!.email },
          ],
        },
        include: {
          sidebarOptions: true,
          subAccounts: {
            include: {
              sidebarOptions: true,
            },
          },
        },
      });

      if (associatedAgency) {
        const isActuallyOwner =
          associatedAgency.companyEmail === userData!.email;
        if (
          userData!.agencyId !== associatedAgency.id ||
          (isActuallyOwner && userData!.role !== "AGENCY_OWNER")
        ) {
          const updatedUser = await db.user.update({
            where: { id: userData!.id },
            data: {
              agencyId: associatedAgency.id,
              role: isActuallyOwner ? "AGENCY_OWNER" : userData!.role,
            },
            include: {
              agency: {
                include: {
                  sidebarOptions: true,
                  subAccounts: {
                    include: {
                      sidebarOptions: true,
                    },
                  },
                },
              },
              permissions: true,
            },
          });

          // Sync with Clerk if owner
          if (isActuallyOwner) {
            try {
              const client = await clerkClient();
              await client.users.updateUserMetadata(userData!.id, {
                privateMetadata: {
                  role: "AGENCY_OWNER",
                },
              });
            } catch (clerkError) {
              console.error(
                "--- CLERK SYNC ERROR DURING ASSOCIATED AUTO-FIX ---",
                clerkError
              );
            }
          }
          userData = updatedUser as any;
        } else {
          userData!.agency = associatedAgency as any;
        }
      }
    }


    return userData;
  } catch (error) {
    console.error("--- ERROR in getAuthUserDetails ---", error);
    return null;
  }
};


export const saveActivityLogsNotification=async({
    agencyId,
    description,
    subAccountId,
}:{
    agencyId?:string,
    description:string,
    subAccountId?:string
})=>{
    const authUser=await currentUser();
    let userData;
    if(!authUser){
        const response=await db.user.findFirst({
            where:{
                agency:{
                   subAccounts:{
                       some:{
                           id:subAccountId
                       }
                   } 
                }
            }
        })
        if(response){
            userData=response
        }
    }else{
        userData=await db.user.findUnique({
            where:{
                email:authUser.emailAddresses[0].emailAddress,
            }
        })
    }

    if(!userData){
        console.warn('--- saveActivityLogsNotification Warning: Could not find user ---', authUser?.emailAddresses[0]?.emailAddress)
        return;
    }

    let foundAgencyId=agencyId;
    if(!foundAgencyId){
        if(!subAccountId) {
            throw new Error('You need to provide either an agency id or subaccount id')
        }
        const response=await db.subAccount.findUnique({
            where:{
                id:subAccountId,
            }
        })
        if(response) foundAgencyId=response.agencyId
    }
    try {
        if(subAccountId){
            await db.notification.create({
                data:{
                    notification:`${userData.name} | ${description}`,
                    user:{
                        connect:{
                            id:userData.id,
                        }
                    },
                    agency:{
                        connect:{
                            id:foundAgencyId,
                        }
                    },
                    subAccount:{
                        connect:{
                            id:subAccountId,
                        }
                    }
                }
            })
        }else{
            await db.notification.create({
                data:{
                    notification:`${userData.name} | ${description}`,
                    user:{
                        connect:{
                            id:userData.id,
                        }
                    },
                    agency:{
                        connect:{
                            id:foundAgencyId,
                        }
                    }
                }
            })
        }
    } catch (error) {
        console.error('--- Error saving notification ---', error)
        // We don't throw here to prevent crashing the main flow
    }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null
  
  const existingUser = await db.user.findUnique({
    where: { email: user.email },
  })

  // Prevent downgrading an existing AGENCY_OWNER
  if (existingUser?.role === 'AGENCY_OWNER' && (user.role as any) !== 'AGENCY_OWNER') {
    return existingUser
  }


  const response = await db.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      agencyId: user.agencyId,
      // Note: We don't update ID here to avoid PK violation if the upsert is meant for an existing record
    },
    create: {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })

  // If IDs mismatch, the next call to getAuthUserDetails will fix it via self-healing
  return response
}




export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()

  if (!user) return redirect('/sign-in')
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subAccountId: undefined,
    })

    if (userDetails) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
          privateMetadata: {
            role: userDetails.role || 'SUBACCOUNT_USER',
          },
        })
      } catch (clerkError) {
        console.error("--- CLERK SYNC ERROR in verifyAndAcceptInvitation ---", clerkError);
      }

      await db.invitation.delete({
        where: { email: userDetails.email },
      })

      return userDetails.agencyId
    } else return null
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return agency ? agency.agencyId : null
  }
}

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  })
  return response
}

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: userData.role || "SUBACCOUNT_USER",
      },
    });
  } catch (clerkError) {
    console.error("--- CLERK SYNC ERROR in initUser ---", clerkError);
  }

  return userData;
};

export const upsertAgency = async (agency: Partial<Agency>) => {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      return null;
    }

    if (!agency.id) {
       return null;
    }
    
    const agencyDetails = await db.agency.upsert({
      where: { id: agency.id },
      update: {
        name: agency.name,
        agencyLogo: agency.agencyLogo,
        companyEmail: agency.companyEmail,
        companyPhone: agency.companyPhone,
        whiteLabel: agency.whiteLabel,
        address: agency.address,
        city: agency.city,
        zipCode: agency.zipCode,
        state: agency.state,
        country: agency.country,
        goal: agency.goal,
        connectAccountId: agency.connectAccountId,
        updatedAt: new Date(),
      },
      create: {
        id: agency.id,
        name: agency.name || '',
        agencyLogo: agency.agencyLogo || '',
        companyEmail: agency.companyEmail || '',
        companyPhone: agency.companyPhone || '',
        whiteLabel: agency.whiteLabel || false,
        address: agency.address || '',
        city: agency.city || '',
        zipCode: agency.zipCode || '',
        state: agency.state || '',
        country: agency.country || '',
        goal: agency.goal || 5,
        connectAccountId: agency.connectAccountId || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: {
          connect: { email: authUser.emailAddresses[0].emailAddress },
        },
        sidebarOptions: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    })

    revalidatePath('/', 'layout')
    revalidatePath('/agency', 'layout')
    revalidatePath(`/agency/${agencyDetails.id}`, 'layout')
    revalidatePath(`/agency/${agencyDetails.id}/settings`, 'layout')
    revalidatePath(`/agency/${agencyDetails.id}/launchpad`, 'layout')
    

    // Self-healing: Ensure sidebar options exist if it's an update and somehow they were missing
    const existingSidebarOptions = await db.agencySidebarOption.findMany({
      where: { agencyId: agencyDetails.id }
    });

    if (existingSidebarOptions.length === 0) {
      await db.agencySidebarOption.createMany({
        data: [
          {
            name: "Dashboard",
            icon: "category",
            link: `/agency/${agencyDetails.id}`,
            agencyId: agencyDetails.id,
          },
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/agency/${agencyDetails.id}/launchpad`,
            agencyId: agencyDetails.id,
          },
          {
            name: "Billing",
            icon: "payment",
            link: `/agency/${agencyDetails.id}/billing`,
            agencyId: agencyDetails.id,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/agency/${agencyDetails.id}/settings`,
            agencyId: agencyDetails.id,
          },
          {
            name: "Sub Accounts",
            icon: "person",
            link: `/agency/${agencyDetails.id}/all-subaccounts`,
            agencyId: agencyDetails.id,
          },
          {
            name: "Team",
            icon: "shield",
            link: `/agency/${agencyDetails.id}/team`,
            agencyId: agencyDetails.id,
          },
        ],
      });
    }

    // Sync Clerk metadata so the layout role check always passes for the owner
    try {
      await (await clerkClient()).users.updateUserMetadata(authUser.id, {
        privateMetadata: {
          role: 'AGENCY_OWNER',
        },
      });
      
      // CRITICAL: Also update the role in the database to ensure other queries (like upsertSubAccount) can find the owner
      // Wrap in try-catch to avoid 500 error if user record is missing
      try {
        await db.user.update({
          where: { email: authUser.emailAddresses[0].emailAddress },
          data: { role: 'AGENCY_OWNER' },
        })
      } catch (dbError) {
        console.warn('--- Failed to sync role in DB (Non-fatal) ---', dbError);
      }
    } catch (clerkError) {
      console.error('--- Failed to sync Clerk metadata or DB role ---', clerkError);
    }

    return agencyDetails;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getNotificationAndUser=async(agencyId:string)=>{
    try {
        const response=await db.notification.findMany({
            where:{
                agencyId,
            },
            include:{
                user:true,
            },
            orderBy:{
                createdAt:'desc',
            }
        })
        return response
    } catch (error) {
        console.error(error)
    }
}

export const getAuthUser = async (email: string) => {
  try {
    if (!email) return null;
    const user = await db.user.findUnique({
      where: { email },
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

export const getAgencyDetails = async (agencyId: string) => {
  try {
    if (!agencyId) return null;
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { subAccounts: true },
    })
    return agency
  } catch (error) {
    console.error("--- ERROR in getAgencyDetails ---", error);
    return null;
  }
}

export const getUserWithPermissionsAndSubAccount = async (userId: string) => {
  try {
    const response = await db.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            subAccount: true,
          },
        },
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const changeUserPermissions = async (
  permissionId: string,
  userEmail: string,
  subAccountId: string,
  access: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access },
      create: {
        access,
        subAccountId,
        email: userEmail,
      },
    });

    if (response) {
      await revalidatePath("/agency", "page");
    }

    return response;
  } catch (error) {
    console.error("--- ERROR in changeUserPermissions ---", error);
  }
};

export const updateUser = async (
  user: Partial<User> & { id: string }
) => {

  try {
    const { id, ...data } = user;
    console.log("--- [FINAL DEBUG] updateUser called with ID:", id);
    console.log("--- [FINAL DEBUG] Attempting DB update with:", JSON.stringify(data, null, 2));

    if (!id) throw new Error("Missing user ID");

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...data,
      },
    });

    console.log("--- [FINAL DEBUG] DB Update success:", !!updatedUser);
    if (updatedUser) {
      console.log("--- [FINAL DEBUG] New DB values:", {
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      });
    }

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        privateMetadata: {
          role: data.role ?? "SUBACCOUNT_USER",
        },
      });

      // Sync profile image to Clerk if it changed
      if (data.avatarUrl === "") {
        await client.users.deleteUserProfileImage(id);
      } else if (data.avatarUrl) {
        const syncWithRetry = async (url: string, retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try {
              const imageResponse = await fetch(url);
              if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                const file = new File([blob], `profile-${id}.png`, { type: blob.type });
                await client.users.updateUserProfileImage(id, { file });
                return true;
              }
            } catch (e) {}
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1000));
          }
          return false;
        };
        await syncWithRetry(data.avatarUrl);
      }
    } catch (clerkError) {
      console.error("--- CLERK SYNC ERROR in updateUser ---", clerkError);
      // We don't throw here so the DB update still counts as a success in the UI
    }

    revalidatePath("/agency", "page");
    revalidatePath(`/agency/${updatedUser.agencyId}`, "layout");
    revalidatePath(`/agency/${updatedUser.agencyId}`, "page");
    revalidatePath(`/agency/${updatedUser.agencyId}/team`, "page");
    revalidatePath("/subaccount", "page");
    revalidatePath("/", "layout");
    revalidatePath("/(main)", "layout");

    return updatedUser;
  } catch (error) {
    console.error("--- ERROR in updateUser ---", error);
    throw error;
  }
}
;

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.agencyId) {
    console.error('--- upsertSubAccount REJECTED: missing agencyId ---')
    return null
  }
  
  // STRICT VALIDATION: Reject empty name to prevent "Untitled Account" records
  if (!subAccount.name || subAccount.name.trim() === '') {
    console.error('--- upsertSubAccount REJECTED: name is empty ---', JSON.stringify({
      id: subAccount.id,
      name: subAccount.name,
      address: subAccount.address,
    }))
    throw new Error('SubAccount name is required. Cannot save without a name.')
  }
  const agencyOwner = await db.user.findFirst({
    where: {
      agency: {
        id: subAccount.agencyId,
      },
      role: 'AGENCY_OWNER',
    },
  })
  if (!agencyOwner) {
    // Fallback: If no AGENCY_OWNER found, check if there's any user at all to grant access to
    // This handles cases where the owner's role might be out of sync
    const anyAgencyUser = await db.user.findFirst({
      where: { agencyId: subAccount.agencyId }
    })
    
    if (!anyAgencyUser) {
      return null
    }
    
    // We'll continue with the fallback user's email for permissions if necessary
    // but ideally the upsertAgency fix will prevent this
  }

  const ownerEmail = agencyOwner?.email ?? (await db.user.findFirst({ where: { agencyId: subAccount.agencyId } }))?.email
  if (!ownerEmail) return null

  const permissionId = uuidv4()
  try {
    const response = await db.subAccount.upsert({
        where: { id: subAccount.id },
        update: {
          name: subAccount.name || '',
          subAccountLogo: subAccount.subAccountLogo || '',
          address: subAccount.address || '',
          city: subAccount.city || '',
          zipCode: subAccount.zipCode || '',
          state: subAccount.state || '',
          country: subAccount.country || '',
          companyEmail: subAccount.companyEmail || '',
          companyPhone: subAccount.companyPhone || '',
          goal: subAccount.goal || 5000,
          updatedAt: new Date(),
        },
        create: {
          id: subAccount.id,
          name: subAccount.name || '',
          subAccountLogo: subAccount.subAccountLogo || '',
          address: subAccount.address || '',
          city: subAccount.city || '',
          zipCode: subAccount.zipCode || '',
          state: subAccount.state || '',
          country: subAccount.country || '',
          companyEmail: subAccount.companyEmail || '',
          companyPhone: subAccount.companyPhone || '',
          goal: subAccount.goal || 5000,
          agencyId: subAccount.agencyId,
          connectAccountId: subAccount.connectAccountId || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: {
            create: [
              {
                access: true,
                email: ownerEmail,
                id: uuidv4(),
              },
              {
                access: true,
                email: subAccount.companyEmail,
                id: uuidv4(),
              },
            ],
          },

          pipelines: {
            create: { name: 'Lead Cycle' },
          },
          sidebarOptions: {
            create: [
              {
                name: 'Launchpad',
                icon: 'clipboardIcon',
                link: `/subaccount/${subAccount.id}/launchpad`,
              },
              {
                name: 'Settings',
                icon: 'settings',
                link: `/subaccount/${subAccount.id}/settings`,
              },
              {
                name: 'Funnels',
                icon: 'pipelines',
                link: `/subaccount/${subAccount.id}/funnels`,
              },
              {
                name: 'Media',
                icon: 'database',
                link: `/subaccount/${subAccount.id}/media`,
              },
              {
                name: 'Automations',
                icon: 'chip',
                link: `/subaccount/${subAccount.id}/automations`,
              },
              {
                name: 'Pipelines',
                icon: 'flag',
                link: `/subaccount/${subAccount.id}/pipelines`,
              },
              {
                name: 'Contacts',
                icon: 'person',
                link: `/subaccount/${subAccount.id}/contacts`,
              },
              {
                name: 'Dashboard',
                icon: 'category',
                link: `/subaccount/${subAccount.id}`,
              },
            ],
          },
        },
      })
      
      revalidatePath(`/agency/${response.agencyId}/all-subaccounts`);
      revalidatePath(`/agency/${response.agencyId}/team`);
      revalidatePath(`/agency/${response.agencyId}/settings`);
      revalidatePath(`/subaccount/${response.id}/settings`);
      revalidatePath(`/subaccount/${response.id}`, 'layout');

      
      return response
  } catch (error) {
    console.error('--- ERROR in upsertSubAccount database operation ---', error)
    throw error // Re-throw to be caught by the action
  }
}

export const deleteSubAccount = async (subAccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subAccountId,
    },
  })
  return response
}

export const getSubAccountDetails = async (subAccountId: string) => {
    const response = await db.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
    })
    return response
}

export const updateSubAccountConnectedId = async (
  subAccountId: string,
  connectedAccountId: string
) => {
  const response = await db.subAccount.update({
    where: { id: subAccountId },
    data: { connectAccountId: connectedAccountId },
  })
  return response
}

export const sendInvitation = async (invitationData: {
  role: Role;
  email: string;
  agencyId: string;
}) => {
  const { role, email, agencyId } = invitationData;
  if (!email || !role || !agencyId) {
    throw new Error("Missing required fields for invitation");
  }

  const response = await db.invitation.upsert({
    where: { email },
    update: { role, agencyId },
    create: { email, agencyId, role },
  })



  try {
    const rawUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    const redirectUrl = `${rawUrl.replace(/\/$/, '')}/agency`
    
    console.log("--- STARTING CLERK INVITATION ---", { email, redirectUrl });

    const invitation = await (await clerkClient()).invitations.createInvitation({
      emailAddress: email,
      redirectUrl,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
    
    console.log("--- CLERK INVITATION SUCCESS ---", invitation.id);
    return response
  } catch (error: any) {
    console.error("--- CLERK INVITATION ERROR DETAIL ---");
    if (error.errors) {
      console.error(JSON.stringify(error.errors, null, 2));
    } else {
      console.error(error);
    }
    
    // Check if user is already invited (Clerk sometimes returns 422 or 400 for this)
    const isAlreadyInvited = error.errors?.some((e: any) => 
      e.code === 'form_identifier_exists' || 
      e.message?.toLowerCase().includes('already')
    );

    if (isAlreadyInvited) {
      console.log("--- HANDLING EXISTING INVITATION GRACEFULLY ---");
      return response; // Return the DB record anyway as they are already invited
    }

    throw error;
  }
}

export const getMedia = async (subaccountId: string) => {
  const media = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: {
      media: true,
    },
  });
  return media;
};

export const upsertMedia = async (
  subaccountId: string,
  mediaItem: Prisma.MediaCreateWithoutSubAccountInput
) => {
  const response = await db.media.create({
    data: {
      ...mediaItem,
      subAccountId: subaccountId,
    },
  });
  return response;
};

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  });
  return response;
};



