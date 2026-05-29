-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SignalDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED_TP', 'CLOSED_SL', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SignalEventType" AS ENUM ('CREATED', 'PRICE_CHECK', 'ENTRY_HIT', 'TP_HIT', 'SL_HIT', 'EXPIRED', 'CANCELLED', 'MANUAL_UPDATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "accessUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "direction" "SignalDirection" NOT NULL,
    "winrate" INTEGER NOT NULL,
    "entry" DECIMAL(65,30) NOT NULL,
    "stopLoss" DECIMAL(65,30) NOT NULL,
    "takeProfit" DECIMAL(65,30) NOT NULL,
    "status" "SignalStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastMarketPrice" DECIMAL(65,30),
    "lastBid" DECIMAL(65,30),
    "lastAsk" DECIMAL(65,30),
    "lastCheckedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "entryHitPrice" DECIMAL(65,30),
    "closePrice" DECIMAL(65,30),
    "closeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalEvent" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "type" "SignalEventType" NOT NULL,
    "price" DECIMAL(65,30),
    "bid" DECIMAL(65,30),
    "ask" DECIMAL(65,30),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AccessLog_adminId_idx" ON "AccessLog"("adminId");

-- CreateIndex
CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");

-- CreateIndex
CREATE INDEX "Signal_status_idx" ON "Signal"("status");

-- CreateIndex
CREATE INDEX "Signal_pair_idx" ON "Signal"("pair");

-- CreateIndex
CREATE INDEX "Signal_expiresAt_idx" ON "Signal"("expiresAt");

-- CreateIndex
CREATE INDEX "SignalEvent_signalId_idx" ON "SignalEvent"("signalId");

-- CreateIndex
CREATE INDEX "SignalEvent_type_idx" ON "SignalEvent"("type");

-- CreateIndex
CREATE INDEX "SignalEvent_createdAt_idx" ON "SignalEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "SignalEvent" ADD CONSTRAINT "SignalEvent_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
