
CREATE TABLE public.ml_training_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  model_name TEXT NOT NULL DEFAULT 'imei-risk-model',
  accuracy DOUBLE PRECISION,
  loss DOUBLE PRECISION,
  epochs INTEGER NOT NULL DEFAULT 0,
  training_samples INTEGER NOT NULL DEFAULT 0,
  duration_seconds DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'started',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ml_training_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view training logs"
ON public.ml_training_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert training logs"
ON public.ml_training_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
