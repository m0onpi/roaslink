-- CreateTable
CREATE TABLE "public"."tracking_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitPage" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tracking_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "element" TEXT,
    "data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracking_sessions_sessionId_key" ON "public"."tracking_sessions"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."tracking_sessions" ADD CONSTRAINT "tracking_sessions_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "public"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tracking_events" ADD CONSTRAINT "tracking_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."tracking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
