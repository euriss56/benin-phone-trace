CREATE TABLE public.police_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  commissioner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.police_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view police contacts"
ON public.police_contacts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert police contacts"
ON public.police_contacts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update police contacts"
ON public.police_contacts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete police contacts"
ON public.police_contacts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_police_contacts_updated_at
BEFORE UPDATE ON public.police_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();