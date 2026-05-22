-- Migration: Drop speaking_prompts table (deprecated speaking feature)
-- Run: npx prisma migrate deploy OR npx prisma migrate dev --name drop-speaking

DROP TABLE IF EXISTS `speaking_prompts`;
