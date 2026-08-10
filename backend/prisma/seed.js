import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BATCH_SIZE = 1000; // Process 1,000 courses at a time

async function main() {
    const filePath = path.join(__dirname, "us_golf_data.json");
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: Missing file at ${filePath}`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    console.log("⚡ Starting High-Speed Batch Seed...");
    const startTime = Date.now();

    let batchFeatures = [];
    let overallCount = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const feature = JSON.parse(line);
            if (
                feature.properties?.name &&
                Array.isArray(feature.properties.scorecard) &&
                feature.properties.scorecard.length > 0
            ) {
                batchFeatures.push(feature.properties);
            }

            if (batchFeatures.length >= BATCH_SIZE) {
                await processBatch(batchFeatures);
                overallCount += batchFeatures.length;
                console.log(`⏳ Seeded ${overallCount} courses...`);
                batchFeatures = [];
            }
        } catch (err) {
            continue; // Skip individual malformed JSON lines safely
        }
    }

    // Process any remaining records
    if (batchFeatures.length > 0) {
        await processBatch(batchFeatures);
        overallCount += batchFeatures.length;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
        `\n🎉 Finished! Seeded ${overallCount} courses with 3 Tee options each in ${duration}s!`,
    );
}

async function processBatch(items) {
    // We isolate every batch into a single fast database transaction
    await prisma.$transaction(async (tx) => {
        // 1. Bulk insert Clubs and get back their generated IDs
        const clubsData = items.map((item) => ({
            name: item.name,
            region: item.state || "USA",
            country: "United States",
        }));

        const createdClubs = await tx.club.createManyAndReturn({
            data: clubsData,
            skipDuplicates: true, // Instantly ignores duplicate club names
        });

        // Map club names to IDs for fast lookup
        const clubMap = new Map(createdClubs.map((c) => [c.name, c.id]));

        // 2. Bulk insert Courses linked to those Clubs
        const coursesData = [];
        for (const item of items) {
            const clubId = clubMap.get(item.name);
            if (clubId) {
                coursesData.push({ name: item.name, clubId });
            }
        }

        const createdCourses = await tx.course.createManyAndReturn({
            data: coursesData,
        });

        // 3. Build Tees and Holes arrays in memory
        const teesToCreate = [];
        const holesToCreateLayouts = []; // Temporary holding array

        const teeConfigs = [
            { color: "Blue", scale: 1.05 },
            { color: "White", scale: 1.0 },
            { color: "Red", scale: 0.9 },
        ];

        for (const course of createdCourses) {
            // Find the original raw item configuration data matching this course
            const originalItem = items.find((i) => i.name === course.name);
            if (!originalItem) continue;

            const totalPar = originalItem.scorecard.reduce(
                (sum, h) => sum + (h.par || 4),
                0,
            );
            const verifiedYardage =
                originalItem.total_yardage && originalItem.total_yardage > 0
                    ? originalItem.total_yardage
                    : (originalItem.holes || 18) * 350;
            const yardsPerPar = verifiedYardage / totalPar;

            const baseHoles = originalItem.scorecard.map((hole, idx) => ({
                holeNumber: idx + 1,
                par: hole.par || 4,
                strokeIndex: hole.handicap_index || idx + 1,
                baseYards: Math.round((hole.par || 4) * yardsPerPar),
            }));

            // Stage the Tees for creation
            for (const config of teeConfigs) {
                teesToCreate.push({
                    color: config.color,
                    totalPar: totalPar,
                    courseId: course.id,
                    // Keep layout instructions attached temporarily to process in the next step
                    metaHoles: baseHoles.map((h) => ({
                        holeNumber: h.holeNumber,
                        par: h.par,
                        strokeIndex: h.strokeIndex,
                        yards: Math.round(h.baseYards * config.scale),
                    })),
                });
            }
        }

        // 4. Bulk insert Tees and gather IDs
        // Clean database payload payload by stripping out the metadata helper
        const cleanTeesData = teesToCreate.map(
            ({ metaHoles, ...teeFields }) => teeFields,
        );
        const createdTees = await tx.tee.createManyAndReturn({
            data: cleanTeesData,
        });

        // 5. Final Step: Match generated Tee IDs to their respective Holes and bulk insert
        const bulkHolesData = [];
        for (let i = 0; i < createdTees.length; i++) {
            const spawnedTee = createdTees[i];
            const originalMetaLayout = teesToCreate[i].metaHoles;

            for (const hole of originalMetaLayout) {
                bulkHolesData.push({
                    holeNumber: hole.holeNumber,
                    par: hole.par,
                    strokeIndex: hole.strokeIndex,
                    yards: hole.yards,
                    teeId: spawnedTee.id,
                });
            }
        }

        // Write all holes for this batch (up to 54,000 holes at once!) in one single call
        await tx.hole.createMany({ data: bulkHolesData });
    });
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
