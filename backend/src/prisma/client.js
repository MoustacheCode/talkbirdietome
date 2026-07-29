import { PrismaClient } from "@prisma/client"; // Imports the PrismaClient class from the @prisma/client package

// Creates a new instance of the PrismaClient
const prisma = new PrismaClient();

export default prisma; // Exports the prisma client so it can be used in other files
