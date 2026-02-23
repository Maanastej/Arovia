-- ==========================================
-- AROVIA CARE CONNECT: FULL DATABASE SETUP
-- ==========================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Click "New Query"
-- 3. Paste EVERYTHING below and click "RUN"
-- 4. After running, go to Dashboard -> API Settings and "Reload Schema" if possible (or just refresh the page).

-- 1. CLEANUP (Optional - clears old versions)
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.medical_records;
DROP TABLE IF EXISTS public.appointments;
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
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Users view own appts" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own appts" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own docs" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own docs" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users chat" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send chat" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. AI CHAT AGENT LOGIC
-- This function automatically replies to any message sent by a user.
CREATE OR REPLACE FUNCTION public.handle_agent_reply()
RETURNS TRIGGER AS $$
BEGIN
    -- Only reply if a USER sent the message (is_agent is false)
    -- and there isn't already a reply pending (prevent loops)
    IF NEW.is_agent = false THEN
        INSERT INTO public.messages (sender_id, receiver_id, content, is_agent)
        VALUES (
            NEW.sender_id, -- Keep the context
            NEW.sender_id, 
            'Hello! I am your Arovia Assistant. 👋 I see you are interested in our services. How can I help you with your medical journey today?',
            true
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after every message insert
DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_agent_reply();

-- 7. SEED DUMMY DATA
INSERT INTO public.treatments (title, category, description, price_estimate, duration_days, image_url)
VALUES 
('Full Dental Implants', 'Dental', 'Restore your smile with high-quality dental implants. Includes consultation and 3D imaging.', '$3,000 - $5,000', 5, 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop'),
('Rhinoplasty', 'Cosmetic', 'Professional nose reshaping surgery by top surgeons.', '$4,000 - $7,000', 7, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=1000&auto=format&fit=crop'),
('Hip Replacement', 'Orthopedic', 'Advanced orthopedic surgery for total hip replacement using latest techniques.', '$10,000 - $15,000', 14, 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop'),
('Cardiac Bypass Surgery', 'Cardiology', 'Expert cardiovascular surgery with comprehensive post-operative care.', '$15,000 - $25,000', 21, 'https://images.unsplash.com/photo-1579154235602-3c353a298867?q=80&w=1000&auto=format&fit=crop'),
('IVF Treatment', 'Fertility', 'Complete fertility treatment cycle including stimulation and implantation.', '$5,000 - $8,000', 30, 'https://images.unsplash.com/photo-1581594693702-fbdc51b2ad46?q=80&w=1000&auto=format&fit=crop'),
('Teeth Whitening', 'Dental', 'Professional laser teeth whitening for a brighter smile in one session.', '$300 - $600', 1, 'https://images.unsplash.com/photo-1445527815219-ecbfec67992e?q=80&w=1000&auto=format&fit=crop'),
('Breast Augmentation', 'Cosmetic', 'Safe and professional breast enhancement surgery with premium implants.', '$5,000 - $8,000', 5, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop'),
('Executive Health Checkup', 'Health Screening', 'Full body diagnostic screening including heart, liver, and lung function tests.', '$500 - $1,200', 2, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop'),
('Spine Surgery', 'Orthopedic', 'Specialized spinal decompression and fusion by world-renowned surgeons.', '$9,000 - $14,000', 10, 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1000&auto=format&fit=crop'),
('Angioplasty', 'Cardiology', 'Minimally invasive procedure to open blocked heart arteries.', '$7,000 - $12,000', 3, 'https://images.unsplash.com/photo-1504813184591-01592fd03cfd?q=80&w=1000&auto=format&fit=crop');
