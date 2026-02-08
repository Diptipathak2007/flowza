"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import {Notification} from "@prisma/client";
import { Agency, Plan } from "@prisma/client";

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

    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: {
        name: agency.name || '',
        agencyLogo: agency.agencyLogo || '',
        companyEmail: agency.companyEmail || '',
        companyPhone: agency.companyPhone || '',
        whiteLabel: agency.whiteLabel ?? true,
        address: agency.address || '',
        city: agency.city || '',
        zipCode: agency.zipCode || '',
        state: agency.state || '',
        country: agency.country || '',
        goal: agency.goal || 5,
        connectAccountId: agency.connectAccountId || '',
        updatedAt: new Date(),
        users: {
          connect: { email: authUser.emailAddresses[0].emailAddress },
        },
      },
      create: {
        id: agency.id,
        name: agency.name || '',
        agencyLogo: agency.agencyLogo || '',
        companyEmail: agency.companyEmail || '',
        companyPhone: agency.companyPhone || '',
        whiteLabel: agency.whiteLabel ?? true,
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
    });
    return agencyDetails;
  } catch (error) {
    console.log(error);
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