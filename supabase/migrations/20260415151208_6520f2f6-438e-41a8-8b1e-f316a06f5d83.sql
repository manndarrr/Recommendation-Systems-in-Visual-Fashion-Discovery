
-- Drop the restrictive SELECT policy and replace with one that allows authenticated users to read all interactions
-- This is needed for collaborative filtering to compare user behavior
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;

CREATE POLICY "Authenticated users can view all interactions"
ON public.user_interactions
FOR SELECT
TO authenticated
USING (true);
