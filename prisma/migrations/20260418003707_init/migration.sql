-- CreateTable
CREATE TABLE "RecurringMeeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "zoomMeetingId" TEXT,
    "zoomJoinUrl" TEXT,
    "zoomStartUrl" TEXT,
    "scheduledTime" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "company" TEXT,
    "sector" TEXT,
    "dueDate" DATETIME,
    "reviewer" TEXT,
    "recurringMeetingId" TEXT,
    "meetingDay" TEXT,
    "submissionUrl" TEXT,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_recurringMeetingId_fkey" FOREIGN KEY ("recurringMeetingId") REFERENCES "RecurringMeeting" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RecurringMeeting_zoomMeetingId_key" ON "RecurringMeeting"("zoomMeetingId");
