import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL?.replace(
  "mysql://",
  "mariadb://"
)}`;
const adapter = new PrismaMariaDb(connectionString);

export const db =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"], // optional
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
