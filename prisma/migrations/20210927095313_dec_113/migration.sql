/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "feedback" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization.email_unique" ON "Organization"("email");
