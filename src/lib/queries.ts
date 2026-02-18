"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { User, Notification, Agency, Plan, SubAccount } from "@prisma/client";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) return;
  const userData = await db.user.findUnique({
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

  // LOGGING FOR V3.4 SYNC DEBUG
  if (userData?.agency) {
    console.log("--- V3.4: getAuthUserDetails Agency Name IN USER RELATION ---", userData.agency.name);
    
    // EXPLICIT RE-FETCH TO BYPASS PRISMA RELATION CACHING
    const freshAgency = await db.agency.findUnique({
        where: { id: userData.agency.id },
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
        console.log("--- V3.4: getAuthUserDetails FRESH AGENCY Name ---", freshAgency.name);
        userData.agency = freshAgency as any;
    }
  }

  if (!userData) return;

  // Robust check: If user exists but has no agency populated, check if they are associated with any agency
  if (!userData.agency) {
    const associatedAgency = await db.agency.findFirst({
      where: {
        OR: [
          { users: { some: { email: userData.email } } },
          { companyEmail: userData.email }
        ]
      },
      include: {
        sidebarOptions: true,
        subAccounts: {
          include: {
            sidebarOptions: true,
          },
        },
      },
    })

    if (associatedAgency) {
      if (userData.agencyId !== associatedAgency.id) {
        return await db.user.update({
          where: { id: userData.id },
          data: { agencyId: associatedAgency.id },
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
          }
        })
      } else {
        userData.agency = associatedAgency as any
      }
    }
  }

  return userData;
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
        console.log('could not find user')
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
                },
            }
        })
    }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null
  const response = await db.user.create({ data: { ...user } })
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
      name: `${user.firstName} ${user.lastName}`,
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
      await (await clerkClient()).users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      })

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
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  await (await clerkClient()).users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: userData.role || "SUBACCOUNT_USER",
    },
  });

  return userData;
};

export const upsertAgency = async (agency: Partial<Agency>) => {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      console.log('--- Upserting Agency: No auth user ---')
      return null;
    }

    if (!agency.id) {
       console.log('--- Upserting Agency: No ID provided ---')
       return null;
    }

    console.log('--- upsertAgency entry (Atomic V3.5) ---', agency.id)
    console.log('--- RECEIVED KEYS ON SERVER ---', Object.keys(agency))
    console.log('--- RECEIVED NAME ON SERVER ---', agency.name)
    
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
    
    console.log('--- Agency Upserted (V3.3) ---', agencyDetails.id, agencyDetails.name)

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
      console.log('--- Clerk metadata synced to AGENCY_OWNER ---', authUser.id);
    } catch (clerkError) {
      console.error('--- Failed to sync Clerk metadata ---', clerkError);
    }

    return agencyDetails;
  } catch (error) {
    console.log(error);
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
        console.log(error)
    }
}

export const getAuthUser = async (email: string) => {
  try {
    console.log("--- DB: FETCHING AUTH USER ---", email);
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
    console.log("--- DB: FETCHING AGENCY DETAILS ---", agencyId);
    if (!agencyId) return null;
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { subAccounts: true },
    })
    console.log("--- DB: AGENCY DETAILS FETCHED ---", !!agency);
    return agency
  } catch (error) {
    console.log("--- ERROR in getAgencyDetails ---", error);
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
    console.log(error);
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
    console.log("--- ERROR in changeUserPermissions ---", error);
  }
};

export const updateUser = async (
  user: Partial<User> & { id: string }
) => {
  try {
    if (!user.id) {
      throw new Error("User ID is required");
    }

    console.log("--- DB: UPDATING USER ---", user.id);

    const { id, ...updateData } = user;

    const response = await db.user.update({
      where: { id },
      data: updateData,
    });

    await (await clerkClient()).users.updateUserMetadata(id, {
      privateMetadata: {
        role: user.role ?? "SUBACCOUNT_USER",
      },
    });

    revalidatePath("/agency", "layout");

    console.log("--- DB: USER UPDATED ---", response.id);
    return response;
  } catch (error) {
    console.error("--- ERROR in updateUser ---", error);
    throw error; // important for proper error handling
  }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.agencyId) return null
  const agencyOwner = await db.user.findFirst({
    where: {
      agency: {
        id: subAccount.agencyId,
      },
      role: 'AGENCY_OWNER',
    },
  })
  if (!agencyOwner) return null
  const permissionId = uuidv4()
  console.log('--- Upserting SubAccount (Atomic) ---', subAccount.id)
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
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
  return response
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
