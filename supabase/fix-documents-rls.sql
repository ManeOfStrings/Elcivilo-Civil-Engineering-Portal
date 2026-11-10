-- ==============================================================================
-- ELCIVILO CIVIL ENGINEERING PORTAL
-- INSTANT FIX: SUPABASE ROW LEVEL SECURITY (RLS) FOR DOCUMENTS & STORAGE
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/xdjzdiputesszxggjwmh
-- 2. Click "SQL Editor" in the left navigation bar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- 1. Ensure UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verify / Create Academic Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('syllabus', 'notes', 'question_paper', 'supply')),
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    unit TEXT,
    exam_type TEXT,
    exam_year INTEGER,
    supply_category TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    storage_path TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ensure required columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'storage_path') THEN
        ALTER TABLE public.documents ADD COLUMN storage_path TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'download_count') THEN
        ALTER TABLE public.documents ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_by') THEN
        ALTER TABLE public.documents ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing conflicting policies on documents
DROP POLICY IF EXISTS "Public: Anyone can view documents" ON public.documents;
DROP POLICY IF EXISTS "Public read for documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public read documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public select documents" ON public.documents;
DROP POLICY IF EXISTS "Admin: Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admin: Allow insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow document uploads" ON public.documents;
DROP POLICY IF EXISTS "Admin: Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated update documents" ON public.documents;
DROP POLICY IF EXISTS "Admin: Allow update documents" ON public.documents;
DROP POLICY IF EXISTS "Admin: Authenticated users can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated delete documents" ON public.documents;
DROP POLICY IF EXISTS "Admin: Allow delete documents" ON public.documents;

-- 5. Create Documents Table Policies
-- SELECT: All visitors, students, and admins can view documents
CREATE POLICY "Public: Anyone can view documents"
    ON public.documents FOR SELECT
    TO anon, authenticated
    USING (true);

-- INSERT: Allow admin portal uploads (both anon and authenticated sessions)
CREATE POLICY "Admin: Allow insert documents"
    ON public.documents FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- UPDATE: Allow document modifications
CREATE POLICY "Admin: Allow update documents"
    ON public.documents FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: Allow document deletions
CREATE POLICY "Admin: Allow delete documents"
    ON public.documents FOR DELETE
    TO anon, authenticated
    USING (true);

-- 6. Configure Storage Bucket for 'academic-vault'
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-vault', 'academic-vault', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean up existing storage policies
DROP POLICY IF EXISTS "Public Read Academic Vault Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public read objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read academic-vault" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Academic Vault Objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload academic-vault" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Academic Vault Objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Academic Vault Objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete academic-vault" ON storage.objects;

-- Storage Policy A: Public read access for all visitors to view & download documents
CREATE POLICY "Public Read Academic Vault Objects"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'academic-vault');

-- Storage Policy B: Allow admin file uploads into academic-vault (both anon and authenticated)
CREATE POLICY "Admin Upload Academic Vault Objects"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'academic-vault');

-- Storage Policy C: Allow updates in academic-vault
CREATE POLICY "Admin Update Academic Vault Objects"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'academic-vault');

-- Storage Policy D: Allow deletions from academic-vault
CREATE POLICY "Admin Delete Academic Vault Objects"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'academic-vault');

-- 7. High Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_documents_category_sem ON public.documents(category, semester);
CREATE INDEX IF NOT EXISTS idx_documents_subject_code ON public.documents(subject_code);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- 8. Enable Realtime on documents table (so all student devices update immediately without page refresh)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
