export const userController = {
    register: async (request, h) => {
        return h.response({ message: "Register route is working" }).code(200);
    },
};
