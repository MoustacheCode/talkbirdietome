import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") }); // Load test environment variables
import { server } from "../src/server.js";

// Authentication block for testing the authentication middleware
describe("Authentication", () => {
    it("rejects invalid tokens", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/rounds/1",
            headers: {
                Authorization: "Bearer invalid.token.value",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            error: "Invalid token",
        });
    });

    it("rejects missing tokens", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/rounds/1",
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            error: "Missing auth token",
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
            sub: "admin-123",
            email: "admin@example.com",
            role: "admin",
        });

        const response = await server.inject({
            method: "GET",
            url: "/admin/dashboard",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
    });

    it("rejects normal users from accessing admin routes", async () => {
        const userToken = makeToken({
            sub: "user-456",
            email: "user@example.com",
            role: "user",
        });

        const response = await server.inject({
            method: "GET",
            url: "/admin/dashboard",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.payload)).toEqual({
            error: "2 Stroke penalty: Insufficient permissions",
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
            sub: "user-123",
            email: "user@example.com",
            role: "user",
        });

        // Simulate a round that belongs to another user
        const response = await server.inject({
            method: "PUT",
            url: "/rounds/999", // Assuming round ID 999 belongs to another user
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            payload: {
                score: 72,
            },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.payload)).toEqual({
            error: "1 Stroke penalty: You do not have permission to perform this action",
        });
    });

    it("allows user to update their own round", async () => {
        const userToken = makeToken({
            sub: "user-123",
            email: "user@example.com",
            role: "user",
        });

        // Simulate a round that belongs to the user
        const response = await server.inject({
            method: "PUT",
            url: "/rounds/1",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            payload: {
                score: 70,
            },
        });

        expect(response.statusCode).toBe(200);
    });

    it("allows admin to update any round", async () => {
        const adminToken = makeToken({
            sub: "admin-999",
            email: "admin@example.com",
            role: "admin",
        });

        // Admin updating a round that belongs to another user
        const response = await server.inject({
            method: "PUT",
            url: "/rounds/999",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
            payload: {
                score: 68,
            },
        });

        expect(response.statusCode).toBe(200);
    });
});
