/*
  Warnings:

  - Added the required column `redirectUrl` to the `domains` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `domains` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."domains" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "redirectUrl" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "planType" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- AddForeignKey
ALTER TABLE "public"."domains" ADD CONSTRAINT "domains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
