-- CreateEnum
CREATE TYPE "SignInType" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signInType" "SignInType" NOT NULL DEFAULT E'LOCAL',
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "passwordSalt" DROP NOT NULL;
