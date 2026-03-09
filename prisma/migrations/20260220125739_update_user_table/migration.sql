-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profileUrl" TEXT DEFAULT 'https://i.pinimg.com/1200x/65/1c/6d/651c6da502353948bdc929f02da2b8e0.jpg',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
