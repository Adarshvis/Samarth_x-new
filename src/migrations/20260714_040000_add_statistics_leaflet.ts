import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_statistics_spotlight_map_source" AS ENUM('image', 'leaflet');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_map_source" "enum_pages_blocks_statistics_spotlight_map_source" DEFAULT 'image';
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_map_lat" numeric DEFAULT 15.2993;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_map_lng" numeric DEFAULT 74.124;
    ALTER TABLE "pages_blocks_statistics" ADD COLUMN IF NOT EXISTS "spotlight_map_zoom" numeric DEFAULT 8;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_map_zoom";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_map_lng";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_map_lat";
    ALTER TABLE "pages_blocks_statistics" DROP COLUMN IF EXISTS "spotlight_map_source";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_statistics_spotlight_map_source";
  `)
}
