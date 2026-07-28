-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "datePlayed" TIMESTAMP(3) NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "scoreRelativeToPar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);
