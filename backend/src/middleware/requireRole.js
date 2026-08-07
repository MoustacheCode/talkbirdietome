export function requireRole(requiredRole) {
    return (request, h) => {
        const userRole = request.auth?.role;

        if (!userRole) {
            return h.response({ error: "User role not found" }).code(403);
        }

        if (userRole !== requiredRole) {
            return h
                .response({
                    error: "2 Stroke penalty: Insufficient permissions",
                })
                .code(403);
        }

        return h.continue;
    };
}
