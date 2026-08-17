import { authController } from "../controllers/authController.js";
import { verifySupabaseToken } from "../middleware/verifySupabaseToken.js";

export const authRoutes = [
    {
        method: "GET",
        path: "/auth/me",
        handler: authController.me,
        options: {
            pre: [{ method: verifySupabaseToken }],
        },
    },
];
