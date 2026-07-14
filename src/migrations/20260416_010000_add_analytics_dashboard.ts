import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_analytics_dashboard_heading_alignment" AS ENUM('left', 'center', 'right');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Drop old charts table if it exists from previous version
    DROP TABLE IF EXISTS "pages_blocks_analytics_dashboard_charts" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_analytics_dashboard_charts_chart_type";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_analytics_dashboard_charts_width";

    -- Recreate the main block table with updated columns
    CREATE TABLE IF NOT EXISTS "pages_blocks_analytics_dashboard" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "section_heading" varchar,
      "section_description" varchar,
      "heading_alignment" "enum_pages_blocks_analytics_dashboard_heading_alignment" DEFAULT 'center',
      "enabled" boolean DEFAULT true,
      "background_color" varchar DEFAULT '#F8FAFC',
      "superset_base_url" varchar,
      "superset_provider" varchar DEFAULT 'db',
      "superset_username" varchar,
      "superset_password" varchar,
      "active_tab_color" varchar DEFAULT '#1E40AF',
      "dashboard_height" numeric DEFAULT 800,
      "block_name" varchar
    );

    -- Add new columns if table already existed with old schema
    ALTER TABLE "pages_blocks_analytics_dashboard" ADD COLUMN IF NOT EXISTS "active_tab_color" varchar DEFAULT '#1E40AF';
    ALTER TABLE "pages_blocks_analytics_dashboard" ADD COLUMN IF NOT EXISTS "dashboard_height" numeric DEFAULT 800;

    -- Drop NOT NULL on superset fields (they're in a collapsible, not always filled)
    ALTER TABLE "pages_blocks_analytics_dashboard" ALTER COLUMN "superset_base_url" DROP NOT NULL;
    ALTER TABLE "pages_blocks_analytics_dashboard" ALTER COLUMN "superset_username" DROP NOT NULL;
    ALTER TABLE "pages_blocks_analytics_dashboard" ALTER COLUMN "superset_password" DROP NOT NULL;

    -- Dashboard tabs (replaces charts)
    CREATE TABLE IF NOT EXISTS "pages_blocks_analytics_dashboard_dashboards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "embed_uuid" varchar,
      "height" numeric DEFAULT 800,
      "visible" boolean DEFAULT true
    );

    ALTER TABLE "pages_blocks_analytics_dashboard" DROP CONSTRAINT IF EXISTS "pages_blocks_analytics_dashboard_parent_id_fk";
    ALTER TABLE "pages_blocks_analytics_dashboard" ADD CONSTRAINT "pages_blocks_analytics_dashboard_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_analytics_dashboard_dashboards" DROP CONSTRAINT IF EXISTS "pages_blocks_analytics_dashboard_dashboards_parent_id_fk";
    ALTER TABLE "pages_blocks_analytics_dashboard_dashboards" ADD CONSTRAINT "pages_blocks_analytics_dashboard_dashboards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_analytics_dashboard"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "pages_blocks_analytics_dashboard_order_idx" ON "pages_blocks_analytics_dashboard" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_analytics_dashboard_parent_id_idx" ON "pages_blocks_analytics_dashboard" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_analytics_dashboard_path_idx" ON "pages_blocks_analytics_dashboard" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_analytics_dashboard_dashboards_order_idx" ON "pages_blocks_analytics_dashboard_dashboards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_analytics_dashboard_dashboards_parent_id_idx" ON "pages_blocks_analytics_dashboard_dashboards" USING btree ("_parent_id");

    -- Clean up old global tables if they exist
    DROP TABLE IF EXISTS "analytics_settings_chart_configs" CASCADE;
    DROP TABLE IF EXISTS "analytics_settings" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_analytics_settings_chart_configs_chart_type";
    DROP TYPE IF EXISTS "public"."enum_analytics_settings_chart_configs_width";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_analytics_dashboard_dashboards" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_analytics_dashboard" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_analytics_dashboard_heading_alignment";
  `)
}
