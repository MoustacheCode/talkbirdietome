import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
    // Connection string to the PostgreSQL database
    connectionString: process.env.DATABASE_URL,
});

// Creates a new instance of the PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma; // Exports the prisma client so it can be used in other files
