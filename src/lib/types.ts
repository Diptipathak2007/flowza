import { Prisma } from "@prisma/client";
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
