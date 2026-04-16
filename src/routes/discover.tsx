import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FashionCard } from "@/components/FashionCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { getForYouRecommendations } from "@/lib/recommendation-engine";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Browse our curated fashion collection with style recommendations." },
    ],
  }),
  component: DiscoverPage,
});

const CATEGORIES = ["all", "tops", "casual", "outerwear", "blazers", "suits", "shoes", "accessories", "watches"];
const STYLES = ["all", "formal", "casual", "classic", "leather", "sporty", "luxury", "vintage", "streetwear", "minimal"];

function DiscoverPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStyle, setActiveStyle] = useState("all");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [forYouItems, setForYouItems] = useState<any[]>([]);
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [allUsersInteractions, setAllUsersInteractions] = useState<any[]>([]);
  const [userPrefs, setUserPrefs] = useState<any>(null);

  useEffect(() => {
    loadItems();
    if (user) {
      loadLikedItems();
      loadPersonalization();
    }

    const itemChannel = supabase
      .channel('discover-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fashion_items' }, () => {
        loadItems();
      })
      .subscribe();

    const interactionChannel = supabase
      .channel('discover-interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_interactions' }, () => {
        if (user) {
          loadLikedItems();
          loadPersonalization();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemChannel);
      supabase.removeChannel(interactionChannel);
    };
  }, [user]);

  const loadItems = async () => {
    const { data } = await supabase.from("fashion_items").select("*").order("created_at");
    setItems(data || []);
    setLoading(false);
  };

  const loadLikedItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_interactions")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("interaction_type", "like");
    setLikedItems(new Set((data || []).map(d => d.item_id)));
  };

  const loadPersonalization = async () => {
    if (!user) return;
    const [prefsRes, userIntsRes, allIntsRes] = await Promise.all([
      supabase.from("profiles").select("preferred_colors, preferred_styles, preferred_patterns").eq("user_id", user.id).single(),
      supabase.from("user_interactions").select("item_id, interaction_type, user_id").eq("user_id", user.id),
      supabase.from("user_interactions").select("item_id, interaction_type, user_id"),
    ]);
    setUserPrefs(prefsRes.data);
    setUserInteractions(userIntsRes.data || []);
    setAllUsersInteractions(allIntsRes.data || []);
  };

  // Compute "For You" when data is ready
  useEffect(() => {
    if (!user || items.length === 0) {
      setForYouItems([]);
      return;
    }
    const recs = getForYouRecommendations(
      items, userPrefs || undefined, userInteractions, allUsersInteractions, user.id, 8
    );
    setForYouItems(recs);
  }, [items, userPrefs, userInteractions, allUsersInteractions, user]);

  const handleLike = async (itemId: string) => {
    if (!user) return;
    if (likedItems.has(itemId)) {
      await supabase.from("user_interactions").delete().eq("user_id", user.id).eq("item_id", itemId).eq("interaction_type", "like");
      setLikedItems(prev => { const n = new Set(prev); n.delete(itemId); return n; });
    } else {
      await supabase.from("user_interactions").insert({ user_id: user.id, item_id: itemId, interaction_type: "like" });
      setLikedItems(prev => new Set(prev).add(itemId));
    }
  };

  const filtered = items.filter(item => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (activeStyle !== "all" && !item.style_tags?.includes(activeStyle)) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">Discover</h1>
        <p className="mt-2 text-muted-foreground">Explore our curated collection of {items.length} fashion pieces</p>
      </motion.div>

      {/* For You section */}
      {user && forYouItems.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">For You</h2>
            <Badge variant="secondary" className="text-[10px]">Hybrid AI</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Personalized picks based on your style, interactions, and similar users' preferences</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {forYouItems.map(rec => {
              const recItem = items.find(i => i.id === rec.itemId);
              if (!recItem) return null;
              return (
                <div key={rec.itemId} className="space-y-2">
                  <FashionCard
                    id={recItem.id}
                    name={recItem.name}
                    image_url={recItem.image_url}
                    price={Number(recItem.price)}
                    brand={recItem.brand || ""}
                    category={recItem.category}
                    style_tags={recItem.style_tags || []}
                    color_tags={recItem.color_tags || []}
                    onLike={handleLike}
                    isLiked={likedItems.has(recItem.id)}
                  />
                  <RecommendationCard reasons={rec.reasons} score={rec.score} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <div className="mt-8 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items or brands..." className="pl-10" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer capitalize transition-all hover:scale-105"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(style => (
                  <Badge
                    key={style}
                    variant={activeStyle === style ? "default" : "outline"}
                    className="cursor-pointer capitalize transition-all hover:scale-105"
                    onClick={() => setActiveStyle(style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* All Items heading */}
      <h2 className="mt-8 font-[var(--font-display)] text-xl font-bold text-foreground">
        {activeCategory === "all" ? "All Items" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
        {activeStyle !== "all" && ` · ${activeStyle}`}
        {search && ` · "${search}"`}
      </h2>

      {/* Grid */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted aspect-[3/4]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No items found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(item => (
            <FashionCard
              key={item.id}
              id={item.id}
              name={item.name}
              image_url={item.image_url}
              price={Number(item.price)}
              brand={item.brand || ""}
              category={item.category}
              style_tags={item.style_tags || []}
              color_tags={item.color_tags || []}
              onLike={handleLike}
              isLiked={likedItems.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
