ALTER TABLE public.user_interactions
  ADD CONSTRAINT interaction_type_valid
  CHECK (interaction_type IN ('like', 'view', 'click'));