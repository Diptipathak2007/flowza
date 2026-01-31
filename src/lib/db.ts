import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  const connectionString = (process.env.DATABASE_URL || "").replace(
    "mysql://",
    "mariadb://"
  );
  const adapter = new PrismaMariaDb(connectionString);
  return new PrismaClient({ adapter, log: ["error"] });
};

export const db = globalThis.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
