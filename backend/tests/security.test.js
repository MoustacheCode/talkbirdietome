import jwt from "jsonwebtoken";
import prisma from "../src/prisma/client.js";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "../.env.test") }); // Load test environment variables
import { server } from "../src/server.js";
import { verifySupabaseToken } from "../src/middleware/verifySupabaseToken.js";
import { checkOwnership } from "../src/middleware/checkOwnership.js";

// Mock role-checking logic for isolated test route protection
const checkAdminRole = (request, h) => {
    if (request.auth?.role !== "admin") {
        return h
            .response({
                statusCode: 403,
                error: "Forbidden",
                message: "2 Stroke penalty: Insufficient permissions",
            })
            .code(403)
            .takeover();
    }
    return h.continue;
};

beforeAll(async () => {
    await server.initialize();
    server.route([
        {
            method: "GET",
            path: "/test/security/auth",
            options: {
                ext: {
                    onPreHandler: { method: verifySupabaseToken },
                },
                handler: (request, h) =>
                    h.response({ success: true }).code(200),
            },
        },
        {
            method: "GET",
            path: "/test/security/admin",
            options: {
                ext: {
                    onPreHandler: [
                        { method: verifySupabaseToken },
                        { method: checkAdminRole },
                    ],
                },
                handler: (request, h) =>
                    h.response({ success: true }).code(200),
            },
        },
        {
            method: "PUT",
            path: "/test/security/rounds/{id}",
            options: {
                ext: {
                    onPreHandler: [
                        { method: verifySupabaseToken },
                        { method: checkOwnership() },
                    ],
                },
                handler: (request, h) =>
                    h.response({ success: true }).code(200),
            },
        },
    ]);
});

afterAll(async () => {
    await prisma.$disconnect();
});

// Authentication block for testing the authentication middleware
describe("Authentication", () => {
    it("rejects invalid tokens", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/test/security/auth",
            headers: {
                Authorization: "Bearer invalid.token.value",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            statusCode: 401,
            error: "Unauthorized",
            message: "Invalid Auth Token",
        });
    });

    it("rejects missing tokens", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/test/security/auth",
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            statusCode: 401,
            error: "Unauthorized",
            message: "Missing Auth Token",
        });
    });
});

// Role Permission block for testing the role-based access control middleware
describe("Role Permission", () => {
    function makeToken(payload) {
        return jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
    }

    it("allows admin to access admin routes", async () => {
        const adminToken = makeToken({
            sub: "2",
            email: "admin@example.com",
            role: "admin",
        });

        const response = await server.inject({
            method: "GET",
            url: "/test/security/admin",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
    });

    it("rejects normal users from accessing admin routes", async () => {
        const userToken = makeToken({
            sub: "3",
            email: "user@example.com",
            role: "user",
        });

        const response = await server.inject({
            method: "GET",
            url: "/test/security/admin",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.payload)).toEqual({
            statusCode: 403,
            error: "Forbidden",
            message: "2 Stroke penalty: Insufficient permissions",
        });
    });
});

// Ownership block for testing the ownership verification middleware
describe("Ownership checks", () => {
    function makeToken(payload) {
        return jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
    }

    it("rejects users who do not own the round", async () => {
        const userToken = makeToken({
            sub: "1",
            email: "user@example.com",
            role: "user",
        });

        server.ext("onPreAuth", (request, h) => {
            if (request.path === "/test/security/rounds/999") {
                request.round = { userId: "someone-else-id" };
            }
            return h.continue;
        });

        // Simulate a round that belongs to another user
        const response = await server.inject({
            method: "PUT",
            url: "/test/security/rounds/999", // Assuming round ID 999 belongs to another user
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            payload: {
                totalScore: 72,
            },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.payload)).toEqual({
            error: "1 Stroke penalty: You do not have permission to perform this action",
        });
    });

    it("allows user to update their own round", async () => {
        const userToken = makeToken({
            sub: "1",
            email: "user@example.com",
            role: "user",
        });

        server.ext("onPreAuth", (request, h) => {
            if (request.path === "/test/security/rounds/1") {
                request.round = { userId: "1" };
            }
            return h.continue;
        });

        // Simulate a round that belongs to the user
        const response = await server.inject({
            method: "PUT",
            url: "/test/security/rounds/1",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            payload: {
                totalScore: 70,
            },
        });

        expect(response.statusCode).toBe(200);
    });

    it("allows admin to update any round", async () => {
        const adminToken = makeToken({
            sub: "2",
            email: "admin@example.com",
            role: "admin",
        });

        // Admin updating a round that belongs to another user
        const response = await server.inject({
            method: "PUT",
            url: "/test/security/rounds/999",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
            payload: {
                totalScore: 68,
            },
        });

        expect(response.statusCode).toBe(200);
    });
});
