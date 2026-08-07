import { createRemoteJWKSet, jwtVerify } from "jose";
import Boom from "@hapi/boom";
import { decodeJwt } from "jose";

const isTestEnv = process.env.NODE_ENV === "test";

const JWKS =
    !isTestEnv && process.env.SUPABASE_JWKS_URL
        ? createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL))
        : null;

export const verifySupabaseToken = async (request, h) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw Boom.unauthorized("Missing Auth Token");
    }

    const token = authHeader.substring(7);

    // Test mode to bypass Jose verification and use a simple secret for testing
    if (isTestEnv) {
        try {
            const payload = decodeJwt(token);

            request.auth = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            return h.continue;
        } catch {
            throw Boom.unauthorized("Invalid Auth Token");
        }
    }

    try {
        const { payload } = await jwtVerify(token, JWKS);
        // Identity fields from Supabase JWT payload
        request.auth = {
            userId: payload.sub, //Supabase user ID
            email: payload.email, //Supabase user email
            role: payload.role, // Supabase user role
        };

        return h.continue;
    } catch (error) {
        console.error("JWT verification failed:", error);
        throw Boom.unauthorized("Invalid Auth Token");
    }
};
