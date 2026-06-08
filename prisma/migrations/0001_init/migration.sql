-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "commissionRate" REAL NOT NULL DEFAULT 3.5,
    "proPrice" REAL NOT NULL DEFAULT 29.9,
    "uploadLimitMb" INTEGER NOT NULL DEFAULT 10,
    "templateOverrides" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlertMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT NOT NULL DEFAULT '',
    "goal" REAL NOT NULL DEFAULT 0,
    "raised" REAL NOT NULL DEFAULT 0,
    "themeColor" TEXT NOT NULL DEFAULT '#9146ff',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "widgetToken" TEXT NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notifyEmailDonation" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmailWeekly" BOOLEAN NOT NULL DEFAULT false,
    "notifyPanelDonation" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethods" TEXT NOT NULL DEFAULT '[]',
    "alertSettings" TEXT NOT NULL DEFAULT '{}',
    "tipPageSettings" TEXT NOT NULL DEFAULT '{}',
    "chatBotSettings" TEXT NOT NULL DEFAULT '{}',
    "affiliateCode" TEXT,
    "referredByCode" TEXT,
    "affiliateClicks" INTEGER NOT NULL DEFAULT 0,
    "affiliateSignups" INTEGER NOT NULL DEFAULT 0,
    "affiliateEarnings" REAL NOT NULL DEFAULT 0,
    "apiKey" TEXT,
    "availableBalance" REAL NOT NULL DEFAULT 0,
    "totalWithdrawn" REAL NOT NULL DEFAULT 0,
    "pixKey" TEXT,
    "pixKeyType" TEXT,
    "pixHolderName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wooviPixKey" TEXT,
    "wooviPixKeyType" TEXT,
    "wooviSubaccountName" TEXT,
    "proExpiresAt" DATETIME,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorWooviPixKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "pixKeyType" TEXT NOT NULL,
    "subaccountName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomSound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'none',
    "legalName" TEXT,
    "cpf" TEXT,
    "birthDate" DATETIME,
    "documentType" TEXT,
    "documentFrontKey" TEXT,
    "documentBackKey" TEXT,
    "selfieKey" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cpfVerificationMessage" TEXT,
    "cpfVerificationProvider" TEXT,
    "cpfVerificationStatus" TEXT,
    "cpfVerifiedAt" DATETIME,
    "diditSessionId" TEXT,
    "diditStatus" TEXT,
    "diditVerifiedAt" DATETIME,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pixKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "fee" REAL,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "payload" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "correlationID" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pixCode" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "donorName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "method" TEXT NOT NULL,
    "pixCode" TEXT,
    "wooviPaymentId" TEXT,
    "splitPayment" BOOLEAN NOT NULL DEFAULT false,
    "applicationFee" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donorTtsVoiceId" TEXT,
    FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpEnabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiry" DATETIME,
    "totpBackupCodes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_apiKey_key" ON "Creator"("apiKey" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_affiliateCode_key" ON "Creator"("affiliateCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_widgetToken_key" ON "Creator"("widgetToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId" ASC);

-- CreateIndex
CREATE INDEX "CreatorWooviPixKey_creatorId_idx" ON "CreatorWooviPixKey"("creatorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorWooviPixKey_pixKey_key" ON "CreatorWooviPixKey"("pixKey" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_creatorId_key" ON "KycVerification"("creatorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON "OAuthAccount"("provider" ASC, "providerAccountId" ASC);

-- CreateIndex
CREATE INDEX "SecurityChallenge_userId_purpose_idx" ON "SecurityChallenge"("userId" ASC, "purpose" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_correlationID_key" ON "SubscriptionPayment"("correlationID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);
