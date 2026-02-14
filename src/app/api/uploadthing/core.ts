import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const authenticateUser = async () => {
  const { userId } = await auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  subaccountLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  agencyLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
