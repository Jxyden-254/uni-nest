// Single shared Prisma client instance for the whole server.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
