import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaDb?: PrismaClient;
};

/**
 * NOTE: DATABASE_URL uses PgBouncer (port 6543) which is unreachable from
 * this environment. Both clients below use DIRECT_URL (port 5432, direct
 * Postgres) which is accessible.
 *
 * If the environment ever changes (e.g. deployed to a server that can reach
 * port 6543), `prisma` can be reverted to `new PrismaClient()` (which reads
 * DATABASE_URL automatically) while `prismaDb` stays on DIRECT_URL for
 * interactive $transaction calls.
 */

/**
 * prisma — primary client, used for all regular queries.
 * Explicitly uses DIRECT_URL to bypass the unreachable PgBouncer pooler.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } },
  });

/**
 * prismaDb — alias pointing to the same direct connection.
 * Kept for code that explicitly imports prismaDb for $transaction() calls.
 */
export const prismaDb = prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDb = prismaDb;
}
