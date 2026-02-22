-- Create treatment categories enum
DO $$ BEGIN
    CREATE TYPE public.treatment_category AS ENUM ('Dental', 'Cosmetic', 'Orthopedic', 'Cardiology', 'Fertility', 'Health Screening');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
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

-- Enable RLS for treatments (publicly readable)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Treatments are viewable by everyone" ON public.treatments FOR SELECT USING (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own medical records" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medical records" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medical records" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Null if sent to "Arovia Admin"
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Add triggers for updated_at
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some initial treatments
INSERT INTO public.treatments (title, category, description, price_estimate, duration_days, image_url)
VALUES 
('Full Dental Implants', 'Dental', 'Restore your smile with high-quality dental implants. Includes consultation and 3D imaging.', '$3,000 - $5,000', 5, 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop'),
('Rhinoplasty', 'Cosmetic', 'Professional nose reshaping surgery by top surgeons.', '$4,000 - $7,000', 7, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=1000&auto=format&fit=crop'),
('Hip Replacement', 'Orthopedic', 'Advanced orthopedic surgery for total hip replacement using latest techniques.', '$10,000 - $15,000', 14, 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop'),
('Cardiac Bypass Surgery', 'Cardiology', 'Expert cardiovascular surgery with comprehensive post-operative care.', '$15,000 - $25,000', 21, 'https://images.unsplash.com/photo-1579154235602-3c353a298867?q=80&w=1000&auto=format&fit=crop'),
('IVF Treatment', 'Fertility', 'Complete fertility treatment cycle including stimulation and implantation.', '$5,000 - $8,000', 30, 'https://images.unsplash.com/photo-1581594693702-fbdc51b2ad46?q=80&w=1000&auto=format&fit=crop');
