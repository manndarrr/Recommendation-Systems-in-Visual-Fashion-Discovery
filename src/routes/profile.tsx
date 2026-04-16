import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STYLE_CATEGORIES, COLOR_PALETTE } from "@/lib/fashion-data";
import { getColdStartStatus } from "@/lib/recommendation-engine";
import { User, Settings, Heart, ShoppingBag, LogOut, Package, Brain, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Your StyleUps profile and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    loadProfile();

    const profileChannel = supabase
      .channel('profile-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, () => {
        loadProfile();
      })
      .subscribe();

    const interactionChannel = supabase
      .channel('profile-interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_interactions', filter: `user_id=eq.${user.id}` }, () => {
        loadProfile();
      })
      .subscribe();

    const wardrobeChannel = supabase
      .channel('profile-wardrobe')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_wardrobe', filter: `user_id=eq.${user.id}` }, () => {
        loadProfile();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(interactionChannel);
      supabase.removeChannel(wardrobeChannel);
    };
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const [profileRes, interactionsRes, wardrobeRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("user_interactions").select("*, fashion_items(name, category, image_url, price, brand)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_wardrobe").select("id").eq("user_id", user.id),
    ]);
    setProfile(profileRes.data);
    setInteractions(interactionsRes.data || []);
    setWardrobeCount(wardrobeRes.data?.length || 0);
    
    if (profileRes.data) {
      setSelectedStyles(profileRes.data.preferred_styles || []);
      setSelectedColors(profileRes.data.preferred_colors || []);
      setDisplayName(profileRes.data.display_name || "");
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      display_name: displayName,
      preferred_styles: selectedStyles,
      preferred_colors: selectedColors,
      style_quiz_completed: true,
    }).eq("user_id", user.id);
    setEditing(false);
    loadProfile();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  const likeCount = interactions.filter(i => i.interaction_type === "like").length;
  const totalInteractions = interactions.length;
  const coldStartInfo = getColdStartStatus(totalInteractions);

  // Simulated purchase history from liked items
  const likedInteractions = interactions.filter(i => i.interaction_type === "like" && i.fashion_items);
  const simulatedPurchases = likedInteractions.slice(0, 5).map((int, idx) => ({
    id: `ORD-${String(2024000 + idx).padStart(7, '0')}`,
    item: int.fashion_items,
    date: new Date(new Date(int.created_at).getTime() + 86400000 * (idx + 1)).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    status: idx === 0 ? "Processing" : "Delivered",
  }));


  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Settings className="mr-2 h-4 w-4" /> {editing ? "Cancel" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Items Liked", value: likeCount, icon: Heart },
          { label: "In Wardrobe", value: wardrobeCount, icon: ShoppingBag },
          { label: "Style Tags", value: selectedStyles.length, icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4 text-center">
            <stat.icon className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Personalization Summary */}
      <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">Personalization Summary</h2>
        </div>
        <div className="mt-4 space-y-3">
          {/* Cold start indicator */}
          <div className="flex items-center gap-3 rounded-lg bg-accent/30 px-4 py-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{coldStartInfo.mode}</p>
              <p className="text-xs text-muted-foreground">{coldStartInfo.description}</p>
            </div>
            <div className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold ${coldStartInfo.isColdStart ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"}`}>
              {coldStartInfo.isColdStart ? "Building" : "Active"}
            </div>
          </div>

          {selectedColors.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg bg-accent/20 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">
                Your preferred colors (<span className="font-medium text-foreground">{selectedColors.join(", ")}</span>) boost matching items by <span className="font-medium text-foreground">15%</span>
              </p>
            </div>
          )}

          {selectedStyles.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg bg-accent/20 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">
                Your style preferences (<span className="font-medium text-foreground">{selectedStyles.join(", ")}</span>) increase relevance scoring
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg bg-accent/20 px-4 py-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{totalInteractions} interactions</span> tracked — behavioral data {totalInteractions >= 5 ? "is actively contributing" : "will contribute once you reach 5 interactions"}
            </p>
          </div>
        </div>
      </div>

      {/* Style preferences */}
      <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">Style Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">These influence your personalized recommendations</p>

        {editing ? (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Preferred Styles</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_CATEGORIES.map(style => (
                  <Badge key={style} variant={selectedStyles.includes(style) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])}>{style}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Preferred Colors</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(c => (
                  <Badge key={c.value} variant={selectedColors.includes(c.value) ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedColors(prev => prev.includes(c.value) ? prev.filter(s => s !== c.value) : [...prev, c.value])}>{c.name}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={saveProfile}>Save Preferences</Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Name</p>
              <p className="mt-1 font-medium text-foreground">{profile?.display_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Styles</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(profile?.preferred_styles || []).length > 0 ? profile.preferred_styles.map((s: string) => (
                  <Badge key={s} variant="secondary" className="capitalize">{s}</Badge>
                )) : <span className="text-sm text-muted-foreground">No preferences set</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(profile?.preferred_colors || []).length > 0 ? profile.preferred_colors.map((c: string) => (
                  <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>
                )) : <span className="text-sm text-muted-foreground">No preferences set</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Purchase History kept, browsing history and recent activity removed from UI */}
    </div>
  );
}
