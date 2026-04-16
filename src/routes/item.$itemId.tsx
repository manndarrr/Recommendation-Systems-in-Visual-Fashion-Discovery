import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FashionCard } from "@/components/FashionCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { findSimilarItems, getCompleteTheLook } from "@/lib/recommendation-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ShoppingBag, ChevronDown, ChevronUp, Brain, Layers, BarChart3, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/item/$itemId")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "View fashion item details and get style recommendations." },
    ],
  }),
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { itemId } = Route.useParams();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [userPrefs, setUserPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [allUsersInteractions, setAllUsersInteractions] = useState<any[]>([]);
  const [userInteractions, setUserInteractions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [itemId, user]);

  const loadData = async () => {
    setLoading(true);
    const [itemRes, allRes] = await Promise.all([
      supabase.from("fashion_items").select("*").eq("id", itemId).single(),
      supabase.from("fashion_items").select("*"),
    ]);
    setItem(itemRes.data);
    setAllItems(allRes.data || []);

    if (user) {
      const [prefsRes, likeRes, saveRes, userIntsRes] = await Promise.all([
        supabase.from("profiles").select("preferred_colors, preferred_styles, preferred_patterns").eq("user_id", user.id).single(),
        supabase.from("user_interactions").select("id").eq("user_id", user.id).eq("item_id", itemId).eq("interaction_type", "like").maybeSingle(),
        supabase.from("user_wardrobe").select("id").eq("user_id", user.id).eq("item_id", itemId).maybeSingle(),
        supabase.from("user_interactions").select("item_id, interaction_type, user_id").eq("user_id", user.id),
      ]);
      setUserPrefs(prefsRes.data);
      setLiked(!!likeRes.data);
      setSaved(!!saveRes.data);
      setUserInteractions(userIntsRes.data || []);

      // Fetch all users' interactions for collaborative filtering
      const { data: allInts } = await supabase.from("user_interactions").select("item_id, interaction_type, user_id");
      setAllUsersInteractions(allInts || []);

      // Track view interaction for cold-start data
      await supabase.from("user_interactions").insert({ user_id: user.id, item_id: itemId, interaction_type: "view" });
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("user_interactions").delete().eq("user_id", user.id).eq("item_id", itemId).eq("interaction_type", "like");
    } else {
      await supabase.from("user_interactions").insert({ user_id: user.id, item_id: itemId, interaction_type: "like" });
    }
    setLiked(!liked);
  };

  const handleSave = async () => {
    if (!user) return;
    if (saved) {
      await supabase.from("user_wardrobe").delete().eq("user_id", user.id).eq("item_id", itemId);
    } else {
      await supabase.from("user_wardrobe").insert({ user_id: user.id, item_id: itemId });
    }
    setSaved(!saved);
  };

  if (loading || !item) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-10 w-64 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const similarItems = findSimilarItems(
    item, allItems, userPrefs || undefined, 8,
    allUsersInteractions, user?.id, userInteractions
  );
  const completeTheLook = getCompleteTheLook(
    item, allItems, userPrefs || undefined, 4,
    allUsersInteractions, user?.id
  );

  const pipelineSteps = [
    { icon: Search, title: "Input Analysis", desc: `Extracted features: ${item.color_tags?.length || 0} colors, ${item.style_tags?.length || 0} styles, ${item.pattern_tags?.length || 0} patterns` },
    { icon: Layers, title: "Feature Embedding", desc: `Category: ${item.category} · Tags mapped to feature vectors for similarity computation` },
    { icon: Brain, title: "Similarity Scoring", desc: "Weighted tag overlap (color 35%, style 35%, pattern 20%, complementary 10%) simulating cosine similarity" },
    { icon: BarChart3, title: "Ranking & Personalization", desc: userPrefs ? "Results ranked by similarity score + your preference boost (colors, styles, patterns)" : "Results ranked by visual similarity. Sign in to enable personalized boosting." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/discover" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl bg-muted">
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{item.brand}</p>
            <h1 className="mt-1 font-[var(--font-display)] text-3xl font-bold text-foreground">{item.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-foreground">₹{Number(item.price).toLocaleString('en-IN')}</p>
          </div>

          <p className="leading-relaxed text-muted-foreground">{item.description}</p>

          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
              <Badge variant="secondary" className="capitalize">{item.category}</Badge>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</p>
              <div className="flex flex-wrap gap-1.5">
                {item.style_tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</p>
              <div className="flex flex-wrap gap-1.5">
                {item.color_tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
                ))}
              </div>
            </div>
            {item.pattern_tags?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patterns</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.pattern_tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleLike} variant={liked ? "default" : "outline"} className="flex-1 gap-2">
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {liked ? "Liked" : "Like"}
            </Button>
            <Button onClick={handleSave} variant={saved ? "default" : "outline"} className="flex-1 gap-2">
              <ShoppingBag className="h-4 w-4" />
              {saved ? "In Wardrobe" : "Save to Wardrobe"}
            </Button>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link> to like and save items
            </p>
          )}

          {/* Why this recommendation? — Pipeline explanation */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="flex w-full items-center gap-2 text-left"
            >
              <Brain className="h-5 w-5 text-primary" />
              <span className="flex-1 font-[var(--font-display)] text-sm font-semibold text-foreground">
                How recommendations work
              </span>
              {whyExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {whyExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                    {pipelineSteps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <step.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{step.title}</p>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Complete the Look */}
      {completeTheLook.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-foreground">Complete the Look</h2>
          <p className="mt-1 text-sm text-muted-foreground">Complementary pieces to build a full outfit</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {completeTheLook.map(rec => {
              const recItem = allItems.find(i => i.id === rec.itemId);
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
                  />
                  <RecommendationCard reasons={rec.reasons} score={rec.score} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Similar Items */}
      {similarItems.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-foreground">Visually Similar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Items with matching visual features in the embedding space</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similarItems.map(rec => {
              const recItem = allItems.find(i => i.id === rec.itemId);
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
                  />
                  <RecommendationCard reasons={rec.reasons} score={rec.score} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
