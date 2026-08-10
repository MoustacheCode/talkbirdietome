import prisma from "../prisma/client.js"; // Imports the prisma client to interact with the database

export const roundService = {
    getAllRounds: async () => {
        // Get all rounds from the database
        return prisma.round.findMany({
            include: {
                course: true, // Includes course overview data in the return payload
                tee: true, // Includes tee box colors and total par values
                holeScores: {
                    include: {
                        hole: true, // Includes layout properties for each individual hole score
                    },
                },
            },
        });
    },

    createRound: async (data) => {
        // Destructure scorecard details out of request payload to handle database transactions
        const { holeScores, ...roundData } = data;

        // Execute sequentially in a transaction to safely establish nested layout rules
        return prisma.$transaction(async (tx) => {
            // Create a new round in the database
            const round = await tx.round.create({
                data: {
                    userId: roundData.userId,
                    courseId: roundData.courseId,
                    teeId: roundData.teeId,
                    datePlayed: new Date(roundData.datePlayed),
                    totalScore: roundData.totalScore || 0,
                    scoreRelativeToPar: roundData.scoreRelativeToPar || 0,
                },
            });

            // Write all individual player scores if an entry scorecard array is passed
            if (Array.isArray(holeScores) && holeScores.length > 0) {
                const bulkScores = holeScores.map((score) => ({
                    roundId: round.id, // Explicit reference link to the newly spawned round record
                    holeId: score.holeId,
                    strokes: score.strokes,
                    putts: score.putts || null,
                }));

                // Write all scores safely in one single call
                await tx.holeScore.createMany({
                    data: bulkScores,
                });
            }

            // Fetch fully populated round information to send back to front end scorecard router
            return tx.round.findUnique({
                where: { id: round.id },
                include: {
                    course: true,
                    tee: true,
                    holeScores: true,
                },
            });
        });
    },

    updateRound: async (id, data) => {
        // Destructure scorecard details to separate base attributes from nested layout lines
        const { holeScores, ...roundData } = data;

        // Isolate updates within a single transaction to prevent incomplete score synchronization states
        return prisma.$transaction(async (tx) => {
            // Process player scores updates if any entries are targeted inside the request array
            if (Array.isArray(holeScores)) {
                for (const score of holeScores) {
                    // Update or insert individual scores safely based on compounding unique index keys
                    await tx.holeScore.upsert({
                        where: {
                            roundId_holeId: {
                                roundId: id,
                                holeId: score.holeId,
                            },
                        },
                        update: {
                            strokes: score.strokes,
                            putts:
                                score.putts !== undefined ? score.putts : null,
                        },
                        create: {
                            roundId: id,
                            holeId: score.holeId,
                            strokes: score.strokes,
                            putts: score.putts || null,
                        },
                    });
                }
            }

            // Update the round with the specified id
            return tx.round.update({
                where: { id },
                data: roundData,
                include: {
                    course: true,
                    tee: true,
                    holeScores: true,
                },
            });
        });
    },

    deleteRound: async (id) => {
        return prisma.round.delete({
            where: { id }, // Delete the round with the specified id
        });
    },
};
