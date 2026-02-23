
-- Create treatment_category enum type
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

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Treatments: public read
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT USING (true);

-- Appointments: users manage own
CREATE POLICY "Users view own appts" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own appts" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Medical records: users manage own
CREATE POLICY "Users view own docs" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own docs" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: users can read and send
CREATE POLICY "Users chat" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send chat" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
