import { PrismaClient } from "@prisma/client"; // Imports the PrismaClient class from the @prisma/client package
import dotenv from "dotenv"; // Imports the dotenv module to handle environment variables safely
import path from "path"; // Imports the path module to resolve system directory layouts

// Check the active runtime state to load the correct configuration variables profile
if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: path.resolve(process.cwd(), "../.env.test") }); // Loads the test environment variables file cleanly
} else {
    dotenv.config(); // Loads the standard development environment variables file cleanly
}

// Creates a new instance of the PrismaClient with dynamic database connection overrides
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // Dynamically sets the database connection URL from the environment variables
        },
    },
});

export default prisma; // Exports the prisma client so it can be used in other files
