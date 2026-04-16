
ALTER TABLE public.fashion_items DROP CONSTRAINT IF EXISTS fashion_items_category_check;
ALTER TABLE public.fashion_items ADD CONSTRAINT fashion_items_category_check CHECK (category = ANY (ARRAY['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'dresses', 'suits', 'blazers', 'watches', 'casual']));

DELETE FROM public.user_wardrobe;
DELETE FROM public.user_interactions;
DELETE FROM public.fashion_items;
