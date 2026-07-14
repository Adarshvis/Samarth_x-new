-- Adds columns for CareerPosting block fields that exist in the Payload config
-- but were never added to the database (push:false, manual migrations).
--   problemDomainsHeading -> problem_domains_heading (text, default 'Problem Domains')
--   preApplyContent       -> pre_apply_content (richText -> jsonb)
ALTER TABLE "pages_blocks_career_posting"
  ADD COLUMN IF NOT EXISTS "problem_domains_heading" varchar DEFAULT 'Problem Domains';

ALTER TABLE "pages_blocks_career_posting"
  ADD COLUMN IF NOT EXISTS "pre_apply_content" jsonb;
