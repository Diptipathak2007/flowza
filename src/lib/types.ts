import { Prisma } from "@prisma/client";
import { z } from "zod";
import { 
  Notification, 
  User, 
} from "@prisma/client";

export type NotificationsWithUser =
  | ({ user: User } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.UserGetPayload<{
  include: {
    permissions: {
      include: {
        subAccount: true;
      };
    };
  };
}>;

export type AuthUserWithAgencySidebarOptionsAndSubAccounts = Prisma.UserGetPayload<{
  include: {
    agency: {
      include: {
        sidebarOptions: true;
        subAccounts: {
          include: {
            sidebarOptions: true;
          };
        };
      };
    };
    permissions: true;
  };
}>;

export type UsersWithAgencySubAccountPermissionsSidebarOptions = Prisma.UserGetPayload<{
  include: {
    agency: {
      include: {
        subAccounts: true;
      };
    };
    permissions: {
      include: {
        subAccount: true;
      };
    };
  };
}>;

export type LaneDetail = Prisma.LaneGetPayload<{
  include: {
    tickets: {
      include: {
        tags: true
        customer: true
        assigned: true
      }
    }
  }
}>

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PipelineGetPayload<{
  include: {
    lanes: {
      include: {
        tickets: {
          include: {
            tags: true
            assigned: true
            customer: true
          }
        }
      }
    }
  }
}>

export type TicketAndTags = Prisma.TicketGetPayload<{
  include: {
    tags: true
    assigned: true
    customer: true
  }
}>

export type TicketsWithTags = TicketAndTags[]
