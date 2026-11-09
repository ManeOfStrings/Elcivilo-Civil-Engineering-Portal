-- ==============================================================================
-- CIVIL ENGINEERING ACADEMIC PORTAL: SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Strict Two-Tier Architecture:
-- 1. Public Student Portal: Anonymous read-only access (SELECT enabled for all)
-- 2. Secure Admin Dashboard: Authenticated administrator access only (INSERT, UPDATE, DELETE)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INTEGER NOT NULL DEFAULT 3,
    faculty_name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Civil Engineering',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACADEMIC DOCUMENTS TABLE (Syllabus, Notes, Question Papers, Supply Special Notes)
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

-- 4. LAST DATES & NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'upcoming', 'info')),
    due_date DATE,
    due_time TIME WITHOUT TIME ZONE,
    attachment_name TEXT,
    attachment_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ASSIGNMENTS TABLE (Adapted for no-login public student submission via external URL)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 100,
    question_pdf_url TEXT,
    external_submission_url TEXT NOT NULL, -- e.g., Google Forms / MS Forms / University Portal Link
    submission_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- SUBJECTS POLICIES
-- ------------------------------------------------------------------------------
-- Everyone (public students without login) can read subjects
CREATE POLICY "Public: Anyone can view subjects"
    ON public.subjects FOR SELECT
    USING (true);

-- Authenticated admins have full CRUD access
CREATE POLICY "Admin: Authenticated users can insert subjects"
    ON public.subjects FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can update subjects"
    ON public.subjects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can delete subjects"
    ON public.subjects FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------------------------
-- DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Everyone can browse and download documents
CREATE POLICY "Public: Anyone can view documents"
    ON public.documents FOR SELECT
    USING (true);

-- Authenticated admins can upload and manage documents
CREATE POLICY "Admin: Authenticated users can insert documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can update documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can delete documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
-- Everyone can view announcements and deadlines
CREATE POLICY "Public: Anyone can view notifications"
    ON public.notifications FOR SELECT
    USING (true);

-- Authenticated admins can publish, edit, and delete notifications
CREATE POLICY "Admin: Authenticated users can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can update notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can delete notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------------------------
-- ASSIGNMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Everyone can read assignment notices and download briefs
CREATE POLICY "Public: Anyone can view assignments"
    ON public.assignments FOR SELECT
    USING (true);

-- Authenticated admins can post and manage assignments
CREATE POLICY "Admin: Authenticated users can insert assignments"
    ON public.assignments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can update assignments"
    ON public.assignments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin: Authenticated users can delete assignments"
    ON public.assignments FOR DELETE
    TO authenticated
    USING (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- Create the public academic storage bucket: 'academic-vault'
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-vault', 'academic-vault', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read access for any visitor
CREATE POLICY "Public Read Academic Vault Objects"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'academic-vault');

-- Storage RLS: Only authenticated admins can upload files
CREATE POLICY "Admin Upload Academic Vault Objects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'academic-vault');

-- Storage RLS: Only authenticated admins can update files
CREATE POLICY "Admin Update Academic Vault Objects"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'academic-vault');

-- Storage RLS: Only authenticated admins can delete files
CREATE POLICY "Admin Delete Academic Vault Objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'academic-vault');

-- ==============================================================================
-- SEED DATA: OFFICIAL CIVIL ENGINEERING CURRICULUM & RESOURCES
-- ==============================================================================

INSERT INTO public.subjects (code, name, semester, credits, faculty_name, description) VALUES
('CE501', 'Structural Analysis II', 5, 4, 'Dr. Robert Vance', 'Indeterminate structures, slope deflection method, moment distribution, and matrix flexibility method.'),
('CE502', 'Design of Concrete Structures I', 5, 4, 'Prof. Sarah Jenkins', 'Limit state design conforming to IS 456:2000 for singly/doubly reinforced beams, flanged sections, and shear.'),
('CE503', 'Geotechnical Engineering I', 5, 4, 'Dr. Alan Morales', 'Soil mechanics, permeability, compaction, consolidation theory, and Mohr-Coulomb shear strength.'),
('CE504', 'Hydrology & Water Resources', 5, 3, 'Dr. Maya Patel', 'Precipitation analysis, hydrograph theory, reservoir sizing, flood routing, and ground water hydrology.'),
('CE505', 'Environmental Engineering I', 5, 3, 'Prof. David Miller', 'Water quality parameters, aeration, sedimentation, filtration, disinfection, and conveyance design.'),
('CE506', 'Transportation Engineering I', 5, 3, 'Dr. Kelly Chang', 'Geometric design of highways, IRC standards, flexible/rigid pavement design, and traffic flow characteristics.')
ON CONFLICT (code) DO NOTHING;

-- End of schema

