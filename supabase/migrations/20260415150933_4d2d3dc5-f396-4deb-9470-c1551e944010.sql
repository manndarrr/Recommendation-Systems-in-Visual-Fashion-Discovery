
-- First delete interactions and wardrobe entries for items we'll remove
DELETE FROM public.user_interactions
WHERE item_id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY category 
        ORDER BY 
          array_length(style_tags, 1) DESC NULLS LAST,
          array_length(color_tags, 1) DESC NULLS LAST,
          price DESC
      ) as rn
    FROM public.fashion_items
  ) ranked WHERE rn > 13
);

DELETE FROM public.user_wardrobe
WHERE item_id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY category 
        ORDER BY 
          array_length(style_tags, 1) DESC NULLS LAST,
          array_length(color_tags, 1) DESC NULLS LAST,
          price DESC
      ) as rn
    FROM public.fashion_items
  ) ranked WHERE rn > 13
);

-- Now delete the items themselves
DELETE FROM public.fashion_items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY category 
        ORDER BY 
          array_length(style_tags, 1) DESC NULLS LAST,
          array_length(color_tags, 1) DESC NULLS LAST,
          price DESC
      ) as rn
    FROM public.fashion_items
  ) ranked WHERE rn > 13
);
