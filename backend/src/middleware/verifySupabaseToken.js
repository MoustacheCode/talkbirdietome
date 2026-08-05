import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL));

export const verifySupabaseToken = async (request, h) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return h.response({ error: "Missing Auth Token" }).code(401);
    }

    const token = authHeader.substring(7);

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
        return h.response({ error: "Invalid Auth Token" }).code(401);
    }
};
