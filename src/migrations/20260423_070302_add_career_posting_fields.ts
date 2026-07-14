import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_career_posting" ADD COLUMN IF NOT EXISTS "problem_domains_heading" varchar DEFAULT 'Problem Domains';
    ALTER TABLE "pages_blocks_career_posting" ADD COLUMN IF NOT EXISTS "pre_apply_content" jsonb;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_career_posting" DROP COLUMN IF EXISTS "problem_domains_heading";
    ALTER TABLE "pages_blocks_career_posting" DROP COLUMN IF EXISTS "pre_apply_content";
  `)
}
