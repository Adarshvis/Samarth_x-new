import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_statistics_layout" ADD VALUE IF NOT EXISTS 'impactSpotlight';

    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "eyebrow" varchar DEFAULT 'IMPACT AT SCALE';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "accent_color" varchar DEFAULT '#7AA5FF';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "text_color" varchar DEFAULT '#FFFFFF';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_enabled" boolean DEFAULT true;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_eyebrow" varchar DEFAULT 'SPOTLIGHT';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_heading" varchar;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_description" varchar;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_button_label" varchar DEFAULT 'Read the story';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_button_url" varchar;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_map_id" integer;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_marker_label" varchar DEFAULT 'Goa';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_marker_sublabel" varchar DEFAULT 'Live on SamarthX';

    ALTER TABLE "pages_blocks_statistics" DROP CONSTRAINT IF EXISTS "stats_spotlight_map_id_fk";
    ALTER TABLE "pages_blocks_statistics" ADD CONSTRAINT "stats_spotlight_map_id_fk" FOREIGN KEY ("spotlight_map_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "stats_spotlight_map_idx" ON "pages_blocks_statistics" USING btree ("spotlight_map_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_statistics" DROP CONSTRAINT IF EXISTS "stats_spotlight_map_id_fk";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_marker_sublabel";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_marker_label";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_map_id";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_button_url";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_button_label";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_description";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_heading";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_eyebrow";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_enabled";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "text_color";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "accent_color";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "eyebrow";
  `)
}
