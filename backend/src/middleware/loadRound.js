import prisma from "../prisma/client.js";

export async function loadRound(request, h) {
    const { id } = request.params;

    const round = await prisma.round.findUnique({
        where: { id: Number(id) },
    });

    if (!round) {
        return h.response({ error: "Round not found" }).code(404);
    }

    request.round = round;
    return h.continue;
}
