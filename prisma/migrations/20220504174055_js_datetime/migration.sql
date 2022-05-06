/*
  Warnings:

  - Added the required column `jsDateTime` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jsDateTime` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "jsDateTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "jsDateTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;
