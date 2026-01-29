"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import {Notification} from "@prisma/client";

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
        const userDetails=await createTeamUser(invitationExists.agencyId,{
            email:invitationExists.email,
            agencyId:invitationExists.agencyId,
            avatarUrl:user.imageUrl,
            id:user.id,
            name:`${user.firstName} ${user.lastName}`,
            role:invitationExists.role,
            createdAt:new Date(),
            updatedAt:new Date(),

        })
        if(userDetails){
            await (await clerkClient()).users.updateUserMetadata(user.id,{
                privateMetadata:{
                    role:userDetails.role||'SUBACCOUNT_USER',

                }
            })
            await db.invitation.delete({
                where:{
                    email:userDetails.email,
                    
                },
            })
            return userDetails.agencyId;
        }else return null;
    }else{
        const agency=await db.user.findUnique({
            where:{
                email:user.emailAddresses[0].emailAddress,
            },
        })
        return agency?agency.agencyId:null;
    }
   

}