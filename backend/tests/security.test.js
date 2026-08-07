import { server } from "../src/server.js";

describe("Authentication", () => {
    it("rejects invalid tokens", async () => {
        const response = await server.inject({
            method: "GET",
            path: "/rounds/1",
            headers: {
                Authorization: "Bearer invalid.token.value",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
            error: "Invalid token",
        });
    });
});
