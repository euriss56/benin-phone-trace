
-- Create storage bucket for phone photos
INSERT INTO storage.buckets (id, name, public) VALUES ('phone-photos', 'phone-photos', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload phone photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'phone-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view phone photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'phone-photos');

CREATE POLICY "Users can delete their own phone photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'phone-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Police reports table
CREATE TABLE public.police_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_id UUID NOT NULL REFERENCES public.stolen_phones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_status TEXT NOT NULL DEFAULT 'signalé',
  police_reference TEXT,
  notes TEXT,
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.police_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own police reports"
ON public.police_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all police reports"
ON public.police_reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update police reports"
ON public.police_reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create police reports"
ON public.police_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_police_reports_updated_at
BEFORE UPDATE ON public.police_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add photo_urls column (array) to stolen_phones for multiple photos
ALTER TABLE public.stolen_phones ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
