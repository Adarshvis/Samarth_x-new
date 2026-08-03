import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_document_list_heading_alignment" AS ENUM('left', 'center', 'right');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- ── Documents upload collection ──
    CREATE TABLE IF NOT EXISTS "documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    CREATE INDEX IF NOT EXISTS "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "documents_created_at_idx" ON "documents" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "documents_filename_idx" ON "documents" USING btree ("filename");

    -- Payload needs a relationship column for every collection here
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "documents_id" integer;
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documents_fk";
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");

    -- ── Document List block ──
    CREATE TABLE IF NOT EXISTS "pages_blocks_document_list" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "section_heading" varchar,
      "section_description" varchar,
      "heading_alignment" "enum_pages_blocks_document_list_heading_alignment" DEFAULT 'center',
      "show_icon" boolean DEFAULT true,
      "show_view_button" boolean DEFAULT true,
      "show_download_button" boolean DEFAULT true,
      "view_label" varchar DEFAULT 'View',
      "download_label" varchar DEFAULT 'Download',
      "accent_color" varchar DEFAULT '#F97316',
      "card_bg_color" varchar DEFAULT '#FFFFFF',
      "background_color" varchar DEFAULT '#FFFFFF',
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_document_list_documents" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "subtitle" varchar,
      "date" timestamp(3) with time zone,
      "file_id" integer,
      "icon" varchar
    );

    -- Foreign keys
    ALTER TABLE "pages_blocks_document_list" DROP CONSTRAINT IF EXISTS "dl_parent_id_fk";
    ALTER TABLE "pages_blocks_document_list" ADD CONSTRAINT "dl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_document_list_documents" DROP CONSTRAINT IF EXISTS "dl_docs_parent_id_fk";
    ALTER TABLE "pages_blocks_document_list_documents" ADD CONSTRAINT "dl_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_document_list"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_document_list_documents" DROP CONSTRAINT IF EXISTS "dl_docs_file_id_fk";
    ALTER TABLE "pages_blocks_document_list_documents" ADD CONSTRAINT "dl_docs_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;

    -- Indexes
    CREATE INDEX IF NOT EXISTS "dl_order_idx" ON "pages_blocks_document_list" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "dl_parent_id_idx" ON "pages_blocks_document_list" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "dl_path_idx" ON "pages_blocks_document_list" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "dl_docs_order_idx" ON "pages_blocks_document_list_documents" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "dl_docs_parent_id_idx" ON "pages_blocks_document_list_documents" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "dl_docs_file_idx" ON "pages_blocks_document_list_documents" USING btree ("file_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_document_list_documents" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_document_list" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_document_list_heading_alignment";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documents_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "documents_id";

    DROP TABLE IF EXISTS "documents" CASCADE;
  `)
}
