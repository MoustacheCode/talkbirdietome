import { PrismaClient } from "@prisma/client";

// Creates a new instance of prismaclient
const prisma = new PrismaClient();

// Exports the prisma instance for use in other files
export default prisma;
