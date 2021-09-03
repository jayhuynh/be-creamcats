/*
  Warnings:

  - The primary key for the `Application` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,positionId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Application" DROP CONSTRAINT "Application_pkey",
ADD PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_userId_positionId_pair" ON "Application"("userId", "positionId");
