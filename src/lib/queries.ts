"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { User, Notification, Agency, Plan, SubAccount } from "@prisma/client";

export const getAuthUserDetails=async()=>{
    const user=await currentUser();
    if(!user) return;
    const userData=await db.user.findUnique({
        where:{
            email:user.emailAddresses[0].emailAddress,
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
    })
    
    // Robust check: If user exists but has no agency populated, check if they are associated with any agency
    if (userData && !userData.agency) {
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
           // Link them if not linked
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
}
export const saveActivityLogsNotification=async({
    agencyId,
    description,
    subAccountId,
}:{
    agencyId?:string,
    description:string,
    subAccountId?:string,
})=>{
    const authUser=await currentUser();
    let userData;
    if(!authUser){
        const response=await db.user.findFirst({
            where:{
                agency:{subAccounts:{some:{id:subAccountId}}}
            }
        })
        if(response){
            userData=response;
        }
    }else{
        userData=await db.user.findUnique({
            where:{
                email:authUser?.emailAddresses[0].emailAddress,
            },
            
        })
    }
    if(!userData){
        console.log("User not found");
        return;
    }
    let foundAgencyId=agencyId;
    if(!foundAgencyId){
        if(!subAccountId){
            throw new Error("Agency ID or Sub Account ID is required");
        }
        const response=await db.subAccount.findUnique({
            where:{
                id:subAccountId,
            },
            
        })
        if(response){
            foundAgencyId=response.agencyId;
        }
        if(subAccountId){
            await db.notification.create({
                data:{
                    notification:`${userData.name}|${description}`,
                    user:{connect:{id:userData.id}},
                    agency:{connect:{id:foundAgencyId}},
                    subAccount:{connect:{id:subAccountId}},
                    
                }
            })
        }else{
            await db.notification.create({
                data:{
                    notification:`${userData.name}|${description}`,
                    user:{connect:{id:userData.id}},
                    agency:{connect:{id:foundAgencyId}},
                    
                }
            })
        }
    }
    
   
    
}
export const createTeamUser=async(agencyId:string,user:User)=>{
    if(user.role==='AGENCY_OWNER')return null;
    const response=await db.user.create({
        data:{...user},
    })
    return response;

}

export const verifyAndAcceptInvitation=async()=>{
    const user=await currentUser();
    if(!user) return redirect("/sign-in");
    const invitationExists=await db.invitation.findUnique({
        where:{
            email:user.emailAddresses[0].emailAddress,
            status:"PENDING",
        },
    })
    if(invitationExists){
        const userDetails = await db.user.upsert({
          where: { email: invitationExists.email },
          update: {
            role: invitationExists.role,
            agencyId: invitationExists.agencyId,
          },
          create: {
            email: invitationExists.email,
            agencyId: invitationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        if (userDetails) {
          await (await clerkClient()).users.updateUserMetadata(user.id, {
            privateMetadata: {
              role: userDetails.role || "SUBACCOUNT_USER",
            },
          });
          await db.invitation.delete({
            where: {
              email: userDetails.email,
            },
          });
          return userDetails.agencyId;
        } else return null;
    }else{
        const userDetails=await db.user.findUnique({
            where:{
                email:user.emailAddresses[0].emailAddress,
            },
        })
        return userDetails?userDetails.agencyId:null;
    }
   

}

export const updateAgencyDetails=async(agencyId:string,agencyDetails:Partial<Agency>)=>{
    const response=await db.agency.update({
       data:{
            ...agencyDetails,
       },
       where:{
        id:agencyId,
       }
    })
    return response;
}

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: {
      id: agencyId,
    },
  });
  return response;
};

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
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  return userData;
};

export const upsertAgency = async (agency: Agency) => {
  try {
    const authUser = await currentUser();
    if (!authUser) return null;

    console.log('--- Upserting Agency Request (Refactored) ---', agency.id, agency.name)
    
    // Explicitly check for ID to decide between create and update
    const existingAgency = await db.agency.findUnique({
        where: { id: agency.id }
    })

    let agencyDetails;

    if (existingAgency) {
        console.log('Updating existing agency:', existingAgency.id)
        agencyDetails = await db.agency.update({
            where: { id: agency.id },
            data: {
                name: agency.name || undefined,
                agencyLogo: agency.agencyLogo || undefined,
                companyEmail: agency.companyEmail || undefined,
                companyPhone: agency.companyPhone || undefined,
                whiteLabel: agency.whiteLabel,
                address: agency.address || undefined,
                city: agency.city || undefined,
                zipCode: agency.zipCode || undefined,
                state: agency.state || undefined,
                country: agency.country || undefined,
                goal: agency.goal,
                connectAccountId: agency.connectAccountId,
                updatedAt: new Date(),
            }
        })
    } else {
        if (!agency.name) {
            return;
        }
        agencyDetails = await db.agency.create({
            data: {
                id: agency.id,
                name: agency.name,
                agencyLogo: agency.agencyLogo || '',
                companyEmail: agency.companyEmail || '',
                companyPhone: agency.companyPhone || '',
                whiteLabel: agency.whiteLabel,
                address: agency.address || '',
                city: agency.city || '',
                zipCode: agency.zipCode || '',
                state: agency.state || '',
                country: agency.country || '',
                goal: agency.goal,
                connectAccountId: agency.connectAccountId,
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
        });
    }

    revalidatePath('/agency')
    revalidatePath(`/agency/${agencyDetails.id}`)
    
    console.log('--- Agency Saved to DB (Refactored) ---', agencyDetails.id, agencyDetails.name)

    // Ensure sidebar options exist if it was an update and somehow they were missing
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
            },
        })
        return response;
    } catch (error) {
        console.log(error);
    }
}
export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.agencyId) return null;
  const agencyOwner = await db.user.findFirst({
    where: {
      agencyId: subAccount.agencyId,
      role: "AGENCY_OWNER",
    },
  });
  if (!agencyOwner) return null;
  const permissionId = uuidv4();
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
        connect: {
          id: agencyOwner.id,
        },
      },
      sidebarOptions: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });
  return response;
};
