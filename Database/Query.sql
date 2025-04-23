
-- Create users table with extended profile information
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    language_preference TEXT,
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('tourist', 'guide'))
);

-- Create guides table for additional guide information
CREATE TABLE public.guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    areas_of_expertise TEXT[],
    spoken_languages TEXT[],
    bio TEXT,
    experience_years INTEGER,
    certifications TEXT[],
    hourly_rate DECIMAL(10,2),
    id_proof_url TEXT,
    guide_license_url TEXT,
    profile_picture_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create storage bucket for guide documents
INSERT INTO storage.buckets (id, name) VALUES ('guide-documents', 'guide-documents');

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'guide-documents');

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR ALL USING (auth.uid() = auth_id);

CREATE POLICY "Guides can view their own data" ON public.guides
    FOR ALL USING (user_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid()
    ));
