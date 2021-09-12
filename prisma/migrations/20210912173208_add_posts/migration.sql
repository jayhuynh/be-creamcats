/*
  Warnings:

  - You are about to drop the `_TagToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" TEXT;

-- DropTable
DROP TABLE "_TagToUser";

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
