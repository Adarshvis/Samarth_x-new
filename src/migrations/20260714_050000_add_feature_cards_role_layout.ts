import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_feature_cards_card_layout" ADD VALUE IF NOT EXISTS 'roleCards';
    ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
    ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "link_label" varchar DEFAULT 'Discover more';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_feature_cards_cards" DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE "pages_blocks_feature_cards" DROP COLUMN IF EXISTS "eyebrow";
  `)
}
