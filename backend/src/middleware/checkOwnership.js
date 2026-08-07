export function checkOwnership() {
    return (request, h) => {
        const userId = request.auth?.userId;
        const role = request.auth?.role;
        const roundOwnerId = request.round?.userId;

        if (role === "admin") {
            return h.continue;
        }

        if (userId !== roundOwnerId) {
            return h
                .response({
                    error: "1 Stroke penalty: You do not have permission to perform this action",
                })
                .code(403)
                .takeover();
        }

        return h.continue;
    };
}
