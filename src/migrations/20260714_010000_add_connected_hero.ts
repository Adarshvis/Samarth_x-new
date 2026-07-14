import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_connected_hero_buttons_variant" AS ENUM('primary', 'secondary', 'outline', 'ghost');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- ── Main block table ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_connected_hero" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar,
      "headline" varchar,
      "description" varchar,
      "built_with_label" varchar DEFAULT 'Built with',
      "show_cloud_panel" boolean DEFAULT true,
      "cloud_panel_title" varchar DEFAULT 'Unified Education Cloud',
      "background_color" varchar DEFAULT '#0B1B3F',
      "background_color_end" varchar DEFAULT '#12245C',
      "accent_color" varchar DEFAULT '#FFAA01',
      "text_color" varchar DEFAULT '#FFFFFF',
      "card_bg_color" varchar DEFAULT '#0F2350',
      "animations_enabled" boolean DEFAULT true,
      "animations_hero_text" boolean DEFAULT true,
      "animations_cards" boolean DEFAULT true,
      "animations_chips" boolean DEFAULT true,
      "block_name" varchar
    );

    -- ── CTA buttons ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_connected_hero_buttons" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar,
      "variant" "enum_pages_blocks_connected_hero_buttons_variant" DEFAULT 'primary',
      "icon" varchar
    );

    -- ── Built-with partners ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_connected_hero_built_with_logos" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar,
      "logo_id" integer
    );

    -- ── Cloud cards ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_connected_hero_cloud_cards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "number" varchar,
      "title" varchar,
      "subtitle" varchar,
      "icon" varchar
    );

    -- ── Cloud chips ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_connected_hero_cloud_chips" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar,
      "icon" varchar
    );

    -- ── Foreign keys ──
    ALTER TABLE "pages_blocks_connected_hero" DROP CONSTRAINT IF EXISTS "ch_parent_id_fk";
    ALTER TABLE "pages_blocks_connected_hero" ADD CONSTRAINT "ch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_connected_hero_buttons" DROP CONSTRAINT IF EXISTS "ch_buttons_parent_id_fk";
    ALTER TABLE "pages_blocks_connected_hero_buttons" ADD CONSTRAINT "ch_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_connected_hero"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_connected_hero_built_with_logos" DROP CONSTRAINT IF EXISTS "ch_builtwith_parent_id_fk";
    ALTER TABLE "pages_blocks_connected_hero_built_with_logos" ADD CONSTRAINT "ch_builtwith_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_connected_hero"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_connected_hero_built_with_logos" DROP CONSTRAINT IF EXISTS "ch_builtwith_logo_id_fk";
    ALTER TABLE "pages_blocks_connected_hero_built_with_logos" ADD CONSTRAINT "ch_builtwith_logo_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "pages_blocks_connected_hero_cloud_cards" DROP CONSTRAINT IF EXISTS "ch_cloud_cards_parent_id_fk";
    ALTER TABLE "pages_blocks_connected_hero_cloud_cards" ADD CONSTRAINT "ch_cloud_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_connected_hero"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_connected_hero_cloud_chips" DROP CONSTRAINT IF EXISTS "ch_cloud_chips_parent_id_fk";
    ALTER TABLE "pages_blocks_connected_hero_cloud_chips" ADD CONSTRAINT "ch_cloud_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_connected_hero"("id") ON DELETE cascade ON UPDATE no action;

    -- ── Indexes ──
    CREATE INDEX IF NOT EXISTS "ch_order_idx" ON "pages_blocks_connected_hero" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ch_parent_id_idx" ON "pages_blocks_connected_hero" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "ch_path_idx" ON "pages_blocks_connected_hero" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "ch_buttons_order_idx" ON "pages_blocks_connected_hero_buttons" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ch_buttons_parent_id_idx" ON "pages_blocks_connected_hero_buttons" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "ch_builtwith_order_idx" ON "pages_blocks_connected_hero_built_with_logos" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ch_builtwith_parent_id_idx" ON "pages_blocks_connected_hero_built_with_logos" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "ch_builtwith_logo_idx" ON "pages_blocks_connected_hero_built_with_logos" USING btree ("logo_id");

    CREATE INDEX IF NOT EXISTS "ch_cloud_cards_order_idx" ON "pages_blocks_connected_hero_cloud_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ch_cloud_cards_parent_id_idx" ON "pages_blocks_connected_hero_cloud_cards" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "ch_cloud_chips_order_idx" ON "pages_blocks_connected_hero_cloud_chips" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ch_cloud_chips_parent_id_idx" ON "pages_blocks_connected_hero_cloud_chips" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_connected_hero_cloud_chips" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_connected_hero_cloud_cards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_connected_hero_built_with_logos" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_connected_hero_buttons" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_connected_hero" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_connected_hero_buttons_variant";
  `)
}
