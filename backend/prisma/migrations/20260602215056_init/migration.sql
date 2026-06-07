-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'MINTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('MINT', 'UPDATE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "ownerWallet" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "squareFeet" INTEGER NOT NULL DEFAULT 0,
    "price" TEXT NOT NULL,
    "description" TEXT,
    "metadataHash" VARCHAR(64),
    "imagesRootHash" VARCHAR(64),
    "documentsRootHash" VARCHAR(64),
    "chainHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "sha256Hash" VARCHAR(64) NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" "DocumentFileType" NOT NULL,
    "docType" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL DEFAULT 1,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataVersion" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "metadataHash" VARCHAR(64) NOT NULL,
    "imagesRootHash" VARCHAR(64) NOT NULL,
    "documentsRootHash" VARCHAR(64) NOT NULL,
    "metadataSnapshot" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT NOT NULL,

    CONSTRAINT "MetadataVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "metadataHash" VARCHAR(64) NOT NULL,
    "imagesRootHash" VARCHAR(64) NOT NULL,
    "documentsRootHash" VARCHAR(64) NOT NULL,
    "metadataSnapshot" JSONB NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "documentIds" TEXT[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "declineReason" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_tokenId_key" ON "Property"("tokenId");

-- CreateIndex
CREATE INDEX "Document_propertyId_idx" ON "Document"("propertyId");

-- CreateIndex
CREATE INDEX "Document_sha256Hash_idx" ON "Document"("sha256Hash");

-- CreateIndex
CREATE INDEX "MetadataVersion_propertyId_idx" ON "MetadataVersion"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataVersion_propertyId_versionNo_key" ON "MetadataVersion"("propertyId", "versionNo");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_submittedBy_idx" ON "Request"("submittedBy");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataVersion" ADD CONSTRAINT "MetadataVersion_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
