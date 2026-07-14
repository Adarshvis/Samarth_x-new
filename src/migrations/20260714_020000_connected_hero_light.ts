import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_connected_hero" ADD COLUMN IF NOT EXISTS "headline_highlight" varchar;
    ALTER TABLE "pages_blocks_connected_hero" ADD COLUMN IF NOT EXISTS "center_logo_id" integer;

    ALTER TABLE "pages_blocks_connected_hero" DROP CONSTRAINT IF EXISTS "ch_center_logo_id_fk";
    ALTER TABLE "pages_blocks_connected_hero" ADD CONSTRAINT "ch_center_logo_id_fk" FOREIGN KEY ("center_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "ch_center_logo_idx" ON "pages_blocks_connected_hero" USING btree ("center_logo_id");

    -- Switch stored defaults to the light theme palette
    ALTER TABLE "pages_blocks_connected_hero" ALTER COLUMN "background_color" SET DEFAULT '#FFFFFF';
    ALTER TABLE "pages_blocks_connected_hero" ALTER COLUMN "background_color_end" SET DEFAULT '#EEF2FF';
    ALTER TABLE "pages_blocks_connected_hero" ALTER COLUMN "accent_color" SET DEFAULT '#2563EB';
    ALTER TABLE "pages_blocks_connected_hero" ALTER COLUMN "text_color" SET DEFAULT '#0F172A';
    ALTER TABLE "pages_blocks_connected_hero" ALTER COLUMN "card_bg_color" SET DEFAULT '#FFFFFF';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_connected_hero" DROP CONSTRAINT IF EXISTS "ch_center_logo_id_fk";
    ALTER TABLE "pages_blocks_connected_hero" DROP COLUMN IF EXISTS "center_logo_id";
    ALTER TABLE "pages_blocks_connected_hero" DROP COLUMN IF EXISTS "headline_highlight";
  `)
}
