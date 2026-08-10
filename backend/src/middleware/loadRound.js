import prisma from "../prisma/client.js";

export async function loadRound(request, h) {
    const { id } = request.params;

    // Fetch the target round with deep relational inclusions to support scorecard validation layers
    const round = await prisma.round.findUnique({
        where: { id: Number(id) },
        include: {
            course: true, // Attaches the full course context to the active session object
            tee: {
                include: {
                    holes: {
                        orderBy: { holeNumber: "asc" }, // Enforces correct layout order for down-stream operations
                    },
                },
            },
            holeScores: true, // Pre-loads the user's historical scores for instant validation access
        },
    });

    if (!round) {
        return h.response({ error: "Round not found" }).code(404);
    }

    request.round = round; // Binds the rich round model directly to the request lifecycle
    return h.continue;
}
