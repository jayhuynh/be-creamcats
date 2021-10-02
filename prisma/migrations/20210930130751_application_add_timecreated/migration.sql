/*
  Warnings:

  - Added the required column `timeCreated` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "timeCreated" TIMESTAMP(3) NOT NULL;
