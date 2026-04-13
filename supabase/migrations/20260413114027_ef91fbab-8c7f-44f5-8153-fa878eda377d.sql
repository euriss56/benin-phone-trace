-- Add new roles to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dealer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'technicien';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'enqueteur';

-- Add market and activity type to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS marche text DEFAULT 'Autre',
ADD COLUMN IF NOT EXISTS type_activite text DEFAULT 'revente';

-- Update handle_new_user to use 'dealer' as default role and store marche/type_activite
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone, marche, type_activite)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'marche', 'Autre'),
    COALESCE(NEW.raw_user_meta_data->>'type_activite', 'revente')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'dealer'));
  RETURN NEW;
END;
$$;