-- Create profiles table for user preferences and style quiz
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_colors TEXT[] DEFAULT '{}',
  preferred_styles TEXT[] DEFAULT '{}',
  preferred_patterns TEXT[] DEFAULT '{}',
  style_quiz_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create fashion_items table
CREATE TABLE public.fashion_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'dresses')),
  color_tags TEXT[] NOT NULL DEFAULT '{}',
  pattern_tags TEXT[] NOT NULL DEFAULT '{}',
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  brand TEXT,
  gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
  complementary_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fashion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fashion items are viewable by everyone" ON public.fashion_items FOR SELECT USING (true);

-- Create user_interactions table
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.fashion_items(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'like', 'save', 'purchase')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions" ON public.user_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interactions" ON public.user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.user_interactions FOR DELETE USING (auth.uid() = user_id);

-- Create user_wardrobe table
CREATE TABLE public.user_wardrobe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.fashion_items(id) ON DELETE CASCADE,
  board_name TEXT DEFAULT 'My Wardrobe',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, board_name)
);

ALTER TABLE public.user_wardrobe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wardrobe" ON public.user_wardrobe FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their wardrobe" ON public.user_wardrobe FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their wardrobe" ON public.user_wardrobe FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_fashion_items_category ON public.fashion_items(category);
CREATE INDEX idx_fashion_items_color_tags ON public.fashion_items USING GIN(color_tags);
CREATE INDEX idx_fashion_items_style_tags ON public.fashion_items USING GIN(style_tags);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_item_id ON public.user_interactions(item_id);
CREATE INDEX idx_user_wardrobe_user_id ON public.user_wardrobe(user_id);