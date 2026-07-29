import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// Creates a new instance of the PrismaClient
const prisma = new PrismaClient();

export default prisma; // Exports the prisma client so it can be used in other files
