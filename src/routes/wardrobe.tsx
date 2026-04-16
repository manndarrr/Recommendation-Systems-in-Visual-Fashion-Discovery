import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FashionCard } from "@/components/FashionCard";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Your saved fashion items and outfit collections." },
    ],
  }),
  component: WardrobePage,
});

function WardrobePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    loadWardrobe();

    const channel = supabase
      .channel('wardrobe-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_wardrobe', filter: `user_id=eq.${user.id}` }, () => {
        loadWardrobe();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadWardrobe = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_wardrobe")
      .select("*, fashion_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWardrobeItems(data || []);
    setLoading(false);
  };

  const removeItem = async (wardrobeId: string) => {
    await supabase.from("user_wardrobe").delete().eq("id", wardrobeId);
    setWardrobeItems(prev => prev.filter(w => w.id !== wardrobeId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">My Wardrobe</h1>
        <p className="mt-2 text-muted-foreground">{wardrobeItems.length} saved items</p>
      </motion.div>

      {loading ? (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted aspect-[3/4]" />
          ))}
        </div>
      ) : wardrobeItems.length === 0 ? (
        <div className="mt-20 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Your wardrobe is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Save items from the discover page to build your collection</p>
          <Link to="/discover" className="mt-6 inline-block">
            <Button>Explore Collection</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wardrobeItems.map(w => {
            const item = w.fashion_items;
            if (!item) return null;
            return (
              <div key={w.id} className="relative">
                <FashionCard
                  id={item.id}
                  name={item.name}
                  image_url={item.image_url}
                  price={Number(item.price)}
                  brand={item.brand || ""}
                  category={item.category}
                  style_tags={item.style_tags || []}
                  color_tags={item.color_tags || []}
                />
                <button
                  onClick={() => removeItem(w.id)}
                  className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground transition-all hover:bg-destructive hover:scale-110"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
