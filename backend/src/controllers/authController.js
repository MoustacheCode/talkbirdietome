import prisma from "../prisma/client.js";

export const authController = {
    me: async (request, h) => {
        const userId = request.auth.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return h.response(user).code(200);
    },
};
