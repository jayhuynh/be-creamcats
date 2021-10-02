/*
  Warnings:

  - The `gender` column on the `Position` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'ANY';

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";
