-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  practice_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'clinic')),
  pa_count_this_month INTEGER NOT NULL DEFAULT 0,
  pa_quota INTEGER DEFAULT 10,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  practice_setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.prior_auths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  payer TEXT NOT NULL,
  payer_id TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  procedure_code TEXT,
  icd10_code TEXT,
  generated_form JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','denied','appealed')),
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  notes TEXT,
  -- Patient information
  patient_name TEXT,
  patient_dob DATE,
  patient_member_id TEXT,
  patient_group_number TEXT,
  patient_plan_name TEXT,
  -- Service details
  requested_service_date DATE,
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergent')),
  place_of_service TEXT DEFAULT 'outpatient',
  -- Rendering provider
  rendering_provider_name TEXT,
  rendering_provider_npi TEXT,
  rendering_facility_name TEXT,
  rendering_facility_address TEXT,
  -- Authorization tracking
  auth_number TEXT,
  auth_valid_from DATE,
  auth_valid_through DATE,
  -- AI extraction and complete form
  extracted_clinical_data JSONB,
  complete_pa_form JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.appeals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pa_id UUID REFERENCES public.prior_auths(id) ON DELETE CASCADE NOT NULL,
  denial_reason TEXT NOT NULL,
  generated_appeal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','overturned','upheld')),
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Practice profiles (one per user account)
CREATE TABLE public.practice_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  practice_name TEXT NOT NULL,
  practice_type TEXT,
  specialty TEXT,
  physician_name TEXT NOT NULL,
  physician_npi TEXT NOT NULL,
  physician_credentials TEXT,
  practice_address TEXT NOT NULL,
  practice_city TEXT NOT NULL,
  practice_state TEXT NOT NULL DEFAULT 'IL',
  practice_zip TEXT NOT NULL,
  practice_phone TEXT NOT NULL,
  practice_fax TEXT,
  practice_tax_id TEXT,
  in_network_payers TEXT[] DEFAULT ARRAY['bcbs_il','aetna','uhc','cigna','humana'],
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'hero',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prior_auths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own practice" ON public.practice_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own PAs" ON public.prior_auths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own appeals" ON public.appeals FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
