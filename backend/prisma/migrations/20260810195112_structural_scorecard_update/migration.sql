/*
  Warnings:

  - Added the required column `courseId` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_userId_fkey";

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "courseId" INTEGER NOT NULL,
ALTER COLUMN "totalScore" SET DEFAULT 0,
ALTER COLUMN "scoreRelativeToPar" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "HoleScore" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "holeId" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "putts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoleScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HoleScore_roundId_holeId_key" ON "HoleScore"("roundId", "holeId");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
