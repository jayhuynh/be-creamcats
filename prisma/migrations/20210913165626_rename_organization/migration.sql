/*
  Warnings:

  - You are about to drop the column `orgId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_orgId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "orgId",
ADD COLUMN     "organizationId" INTEGER;

-- DropTable
DROP TABLE "Org";

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "addr" TEXT,
    "email" TEXT,
    "phone" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
