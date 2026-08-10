export function checkOwnership() {
    return (request, h) => {
        const userId = Number(request.auth?.userId); // Casts the token string identifier to a number for safe evaluation
        const role = request.auth?.role;
        const roundOwnerId = Number(request.round?.userId); // Casts the database integer record to a number for safe evaluation

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
