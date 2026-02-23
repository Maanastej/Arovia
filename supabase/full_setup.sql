-- ==========================================
-- AROVIA CARE CONNECT: FULL DATABASE SETUP (V2)
-- ==========================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Click "New Query"
-- 3. Paste EVERYTHING below and click "RUN"
-- 4. After running, go to Dashboard -> API Settings and "Reload Schema".

-- 1. CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
DROP FUNCTION IF EXISTS public.handle_agent_reply();
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.medical_records;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.treatments;
DROP TYPE IF EXISTS public.treatment_category;

-- 2. CREATE CORE TYPES
CREATE TYPE public.treatment_category AS ENUM ('Dental', 'Cosmetic', 'Orthopedic', 'Cardiology', 'Fertility', 'Health Screening');

-- 3. CREATE TABLES
CREATE TABLE public.treatments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category public.treatment_category NOT NULL,
    description TEXT,
    price_estimate TEXT,
    duration_days INTEGER,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table for user metadata
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.medical_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_agent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. ENABLE RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users view own appts" ON public.appointments FOR SELECT USING (auth.uid() = user_id OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin update appts" ON public.appointments FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users add own appts" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own docs" ON public.medical_records FOR SELECT USING (auth.uid() = user_id OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users add own docs" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users chat" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users send chat" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. AUTOMATION LOGIC

-- A. Handle New User (Create Profile + Welcome Message)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

    INSERT INTO public.messages (sender_id, receiver_id, content, is_agent)
    VALUES (
        NEW.id, 
        NEW.id, 
        'Welcome to Arovia Care Connect! 👋 I am your dedicated medical concierge. How can I assist you with your journey today?',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. AI Chat Agent (Auto-reply)
CREATE OR REPLACE FUNCTION public.handle_agent_reply()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_agent = false THEN
        INSERT INTO public.messages (sender_id, receiver_id, content, is_agent)
        VALUES (
            NEW.sender_id, 
            NEW.sender_id, 
            'I have received your message! Our team is reviewing your request. In the meantime, feel free to explore our treatment options.',
            true
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_agent_reply();

-- 7. SEED DUMMY DATA
INSERT INTO public.treatments (title, category, description, price_estimate, duration_days, image_url)
VALUES 
('Full Dental Implants', 'Dental', 'Restore your smile with high-quality dental implants.', '$3,000 - $5,000', 5, 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop'),
('Rhinoplasty', 'Cosmetic', 'Professional nose reshaping surgery.', '$4,000 - $7,000', 7, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=1000&auto=format&fit=crop'),
('Hip Replacement', 'Orthopedic', 'Advanced orthopedic surgery.', '$10,000 - $15,000', 14, 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop'),
('Cardiac Bypass', 'Cardiology', 'Expert cardiovascular surgery.', '$15,000 - $25,000', 21, 'https://images.unsplash.com/photo-1579154235602-3c353a298867?q=80&w=1000&auto=format&fit=crop'),
('IVF Treatment', 'Fertility', 'Complete fertility treatment cycle.', '$5,000 - $8,000', 30, 'https://images.unsplash.com/photo-1581594693702-fbdc51b2ad46?q=80&w=1000&auto=format&fit=crop');
